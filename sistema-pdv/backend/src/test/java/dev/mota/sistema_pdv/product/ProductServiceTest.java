package dev.mota.sistema_pdv.product;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;

import dev.mota.sistema_pdv.movements.StockMovementType;
import dev.mota.sistema_pdv.product.dto.CreateProductRequest;
import dev.mota.sistema_pdv.product.dto.ProductMovementResponse;
import dev.mota.sistema_pdv.product.dto.ProductResponse;
import dev.mota.sistema_pdv.product.dto.UpdateProductRequest;
import dev.mota.sistema_pdv.product.exception.ProductAlreadyExistsException;
import dev.mota.sistema_pdv.product.exception.ProductNotFoundException;
import dev.mota.sistema_pdv.shared.error.ConflictException;

import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service com banco H2 de verdade. @Transactional desfaz o que cada teste gravou.
 */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
class ProductServiceTest {

    @Autowired
    ProductService productService;

    @Autowired
    ProductRepository productRepository;

    private ProductResponse createCable() {
        return productService.create(new CreateProductRequest("7891000000011", "Cabo USB-C", 2990L, 5));
    }

    @Test
    void createsProduct() {
        ProductResponse response = createCable();

        assertEquals("7891000000011", response.barcode());
        assertEquals(0L, response.version());
        assertEquals(1, productRepository.count());
    }

    @Test
    void rejectsDuplicateBarcodeEvenWithSpaces() {
        createCable();

        ProductAlreadyExistsException error = assertThrows(ProductAlreadyExistsException.class, () -> productService.create(new CreateProductRequest(" 7891000000011 ", "Outro", 1000L, 1)));
        assertEquals("Já existe um produto com o código de barras 7891000000011.", error.getMessage());
    }

    @Test
    void updateReturnsTheNewVersion() {
        ProductResponse created = createCable();

        ProductResponse updated = productService.update(created.id(), new UpdateProductRequest("Cabo USB-C 2 m", 3490L, 8, created.version()));

        assertEquals("Cabo USB-C 2 m", updated.name());
        assertEquals(3490, updated.priceInCents());
        assertEquals(1L, updated.version());
    }

    @Test
    void updateWithOldVersionIsRejected() {
        ProductResponse created = createCable();
        productService.update(created.id(), new UpdateProductRequest("Nome do Bruno", 3490L, 8, 0L));

        assertThrows(ConflictException.class, () -> productService.update(created.id(), new UpdateProductRequest("Nome da Ana", 1990L, 2, 0L)));

        assertEquals("Nome do Bruno", productRepository.findById(created.id()).orElseThrow().getName());
    }

    @Test
    void unknownProductIsNotFound() {
        UUID missingId = UUID.randomUUID();

        assertThrows(ProductNotFoundException.class, () -> productService.update(missingId, new UpdateProductRequest("Cabo", 2990L, 5, 0L)));
        assertThrows(ProductNotFoundException.class, () -> productService.archive(missingId));
    }

    @Test
    void archivesOnlyOnce() {
        ProductResponse created = createCable();

        ProductResponse archived = productService.archive(created.id());

        assertFalse(archived.active());
        assertEquals(1L, archived.version());
        assertThrows(ConflictException.class, () -> productService.archive(created.id()));
    }

    @Test
    void restockAddsTheInformedQuantityAndSavesIt() {
        ProductResponse created = createCable();

        ProductResponse restocked = productService.restock(created.id(), 5);

        assertEquals(5, restocked.stockQuantity());
        assertEquals(1L, restocked.version());
        assertEquals(5, productRepository.findById(created.id()).orElseThrow().getStockQuantity());
    }

    @Test
    void decreaseStockKeepsTheEntityRules() {
        Product product = Product.create("7891000000028", "Película", 3990, 6);
        product.restock(4);
        productRepository.saveAndFlush(product);

        productService.decreaseStock(product.getId(), 3);
        assertEquals(1, productRepository.findById(product.getId()).orElseThrow().getStockQuantity());

        assertThrows(IllegalArgumentException.class, () -> productService.decreaseStock(product.getId(), 2));
    }

    @Test
    void findLowStockReturnsOnlyActiveProductsAtOrBelowMinimum() {
        // 1. PREPARAR: um produto para cada situação
        Product lowStock = Product.create("1000000028", "Carregador", 3990, 4);           // estoque 0, mínimo 4

        Product wellStocked = Product.create("658711239", "Conector Tipo C", 1590, 5);
        wellStocked.restock(10);                                                         // estoque 10, mínimo 5

        Product archived = Product.create("228766239", "Capinha de Silicone", 1000, 5);  // estoque 0, mínimo 5
        archived.archive();

        productRepository.save(lowStock);
        productRepository.save(wellStocked);
        productRepository.save(archived);

        // 2. EXECUTAR
        List<ProductResponse> result = productService.findLowStock();

        // 3. CONFERIR: só o Carregador (ativo e abaixo do mínimo)
        List<String> names = result.stream().map(ProductResponse::name).toList();
        assertEquals(List.of("Carregador"), names);
    }

    @Test
    void historyListsMovementsNewestFirst() {

        ProductResponse product = createCable();
        productService.restock(product.id(), 10);
        productService.decreaseStock(product.id(), 3);
        List<ProductMovementResponse> result = productService.findMovementOfProduct(product.id());

        assertEquals(2, result.size());
        assertEquals(StockMovementType.EXIT, result.get(0).type());
        assertEquals(-3, result.get(0).quantity());
        assertEquals(7, result.get(0).balanceAfter());

        assertEquals(StockMovementType.ENTRY, result.get(1).type());
        assertEquals(10, result.get(1).quantity());
        assertEquals(10, result.get(1).balanceAfter());


    }


    @Test
    void historyOfUnknownProductIsNotFound() {
        UUID missingId = UUID.randomUUID();

        assertThrows(ProductNotFoundException.class, () -> productService.findMovementOfProduct(missingId));
    }
}
