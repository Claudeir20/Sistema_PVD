package dev.mota.sistema_pdv.product;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import dev.mota.sistema_pdv.shared.error.ConflictException;
import org.junit.jupiter.api.Test;

/** Regras de negócio do produto, testadas sem banco (rápido). */
class ProductTest {

    private static Product cable() {
        return Product.create("7891000000011", "Cabo USB-C reforçado", 2990, 5);
    }

    private static void assertRejected(String expectedMessage, Runnable action) {
        IllegalArgumentException error = assertThrows(IllegalArgumentException.class, action::run);
        assertEquals(expectedMessage, error.getMessage());
    }

    @Test
    void createsActiveProductWithoutStock() {
        Product product = Product.create("  7891000000011 ", "  Cabo USB-C reforçado ", 2990, 5);

        assertNotNull(product.getId());
        assertEquals("7891000000011", product.getBarcode());
        assertEquals("Cabo USB-C reforçado", product.getName());
        assertEquals(2990, product.getPriceInCents());
        assertEquals(0, product.getStockQuantity());
        assertEquals(5, product.getMinStock());
        assertTrue(product.isActive());
    }

    @Test
    void eachNewProductGetsItsOwnId() {
        assertNotEquals(cable().getId(), cable().getId());
    }

    @Test
    void rejectsInvalidDataOnCreation() {
        assertRejected("Informe o código de barras.", () -> Product.create("  ", "Cabo", 2990, 5));
        assertRejected("Informe o código de barras.", () -> Product.create(null, "Cabo", 2990, 5));
        assertRejected("O código de barras não pode ter espaços.",
                () -> Product.create("789 100", "Cabo", 2990, 5));
        assertRejected("O código de barras deve ter no máximo 50 caracteres.",
                () -> Product.create("1".repeat(51), "Cabo", 2990, 5));
        assertRejected("Informe o nome do produto.", () -> Product.create("789", " ", 2990, 5));
        assertRejected("O nome do produto deve ter no máximo 120 caracteres.",
                () -> Product.create("789", "a".repeat(121), 2990, 5));
        assertRejected("O preço deve ser maior que zero.", () -> Product.create("789", "Cabo", 0, 5));
        assertRejected("O estoque mínimo não pode ser negativo.", () -> Product.create("789", "Cabo", 2990, -1));
    }

    @Test
    void updatesDetailsKeepingBarcode() {
        Product product = cable();

        product.updateDetails("Cabo USB-C 2 m", 3490, 8);

        assertEquals("7891000000011", product.getBarcode());
        assertEquals("Cabo USB-C 2 m", product.getName());
        assertEquals(3490, product.getPriceInCents());
        assertEquals(8, product.getMinStock());
    }

    @Test
    void invalidUpdateKeepsPreviousValues() {
        Product product = cable();

        assertRejected("O preço deve ser maior que zero.", () -> product.updateDetails("Outro nome", -1, 8));

        assertEquals("Cabo USB-C reforçado", product.getName());
        assertEquals(5, product.getMinStock());
    }

    @Test
    void restockIncreasesStock() {
        Product product = cable();

        product.restock(7);
        product.restock(3);

        assertEquals(10, product.getStockQuantity());
    }

    @Test
    void restockRejectsZeroOrNegativeQuantity() {
        Product product = cable();

        assertRejected("A quantidade deve ser maior que zero.", () -> product.restock(0));
        assertRejected("A quantidade deve ser maior que zero.", () -> product.restock(-2));
        assertEquals(0, product.getStockQuantity());
    }

    @Test
    void decreaseStockRemovesQuantity() {
        Product product = cable();
        product.restock(10);

        product.decreaseStock(4);

        assertEquals(6, product.getStockQuantity());
    }

    @Test
    void decreaseStockNeverGoesNegative() {
        Product product = cable();
        product.restock(2);

        assertRejected("Estoque insuficiente para Cabo USB-C reforçado. Disponível: 2.",
                () -> product.decreaseStock(3));
        assertEquals(2, product.getStockQuantity());
    }

    @Test
    void belowMinStockWhenAtOrUnderMinimum() {
        Product product = cable(); // mínimo 5
        product.restock(6);
        assertFalse(product.isBelowMinStock());

        product.decreaseStock(1); // 5
        assertTrue(product.isBelowMinStock());
    }

    @Test
    void archivedProductCannotMoveStock() {
        Product product = cable();
        product.restock(5);
        product.archive();

        assertFalse(product.isActive());
        assertRejected("O produto Cabo USB-C reforçado está arquivado.", () -> product.restock(1));
        assertRejected("O produto Cabo USB-C reforçado está arquivado.", () -> product.decreaseStock(1));
    }

    @Test
    void archiveAndReactivateOnlyOnce() {
        Product product = cable();

        product.archive();
        assertThrows(ConflictException.class, product::archive);

        product.reactivate();
        assertTrue(product.isActive());
        assertThrows(ConflictException.class, product::reactivate);
    }
}
