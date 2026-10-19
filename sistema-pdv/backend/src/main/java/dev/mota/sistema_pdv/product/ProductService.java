package dev.mota.sistema_pdv.product;

import dev.mota.sistema_pdv.movements.ProductMovementItemsMapper;
import dev.mota.sistema_pdv.movements.StockMovement;
import dev.mota.sistema_pdv.movements.StockMovementRepository;
import dev.mota.sistema_pdv.movements.StockMovementType;
import dev.mota.sistema_pdv.product.dto.*;
import dev.mota.sistema_pdv.product.exception.ProductAlreadyExistsException;
import dev.mota.sistema_pdv.product.exception.ProductNotFoundException;
import dev.mota.sistema_pdv.shared.error.ConflictException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final ProductMapper productMapper;
    private final StockMovementRepository stockMovementRepository;
    private final ProductMovementItemsMapper productMovementItemsMapper;

    @Transactional
    public ProductResponse create(CreateProductRequest request) {

        Product product = Product.create(request.barcode(), request.name(), request.priceInCents(), request.minStock());

        if (productRepository.existsByBarcode(product.getBarcode())) {
            throw new ProductAlreadyExistsException(product.getBarcode());
        }

        return productMapper.toResponse(productRepository.save(product));
    }

    @Transactional
    public ProductResponse update(UUID productId, UpdateProductRequest request) {
        Product product = findProduct(productId);

        if (!product.getVersion().equals(request.version())) {
            throw new ConflictException("Este produto foi alterado por outra pessoa. Atualize a página e tente novamente.");
        }

        product.updateDetails(request.name(), request.priceInCents(), request.minStock());


        return productMapper.toResponse(productRepository.saveAndFlush(product));
    }

    @Transactional
    public ProductResponse archive(UUID productId) {
        Product product = findProduct(productId);
        product.archive();
        return productMapper.toResponse(productRepository.saveAndFlush(product));
    }

    @Transactional
    public ProductResponse restock(UUID productId, int quantity) {
        Product product = findProduct(productId);

        StockMovement stockMovement = StockMovement.create(StockMovementType.ENTRY, null);

        stockMovement.addProduct(product, quantity);
        stockMovementRepository.save(stockMovement);
        return productMapper.toResponse(productRepository.saveAndFlush(product));
    }

    @Transactional
    public ProductResponse reactivate(UUID productId) {
        Product product = findProduct(productId);
        product.reactivate();
        return productMapper.toResponse(productRepository.saveAndFlush(product));
    }

    @Transactional
    public void decreaseStock(UUID productId, int quantity) {
        Product product = findProduct(productId);

        StockMovement stockMovement = StockMovement.create(StockMovementType.EXIT, null);

        stockMovement.addProduct(product, quantity);
        stockMovementRepository.save(stockMovement);


    }

    @Transactional(readOnly = true)
    public ProductResponse findProductById(UUID productId) {
        return productMapper.toResponse(findProduct(productId));
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> findAllActive() {
        return productRepository.findAllByActiveTrueOrderByNameAsc()
                .stream()
                .map(productMapper::toResponse)
                .toList();
    }

<<<<<<< Updated upstream
=======
    @Transactional(readOnly = true)
    public List<ProductResponse> findLowStock() {

        return productRepository.findActiveBelowMinStock()
                .stream()
                .map(productMapper::toResponse)
                .toList();
    }
>>>>>>> Stashed changes

    @Transactional
    public ProductResponse adjustStock(AdjustStockRequest request, UUID productId) {
        Product product = findProduct(productId);

        StockMovement stockMovement = StockMovement.create(
                StockMovementType.ADJUSTMENT,
                request.reason());
        stockMovement.addCountedProduct(product, request.countedQuantity());

        stockMovementRepository.save(stockMovement);
        return productMapper.toResponse(productRepository.saveAndFlush(product));
    }
<<<<<<< Updated upstream
=======

    @Transactional(readOnly = true)
    public List<ProductMovementResponse> findMovementOfProduct(UUID productId) {
        findProduct(productId);

        return productRepository.findHistoryOfProduct(productId).stream()
                .map(productMovementItemsMapper::toResponse)
                .toList();
    }

    private Product findProduct(UUID productId) {
        return productRepository.findById(productId).orElseThrow(ProductNotFoundException::new);
    }
>>>>>>> Stashed changes
}
