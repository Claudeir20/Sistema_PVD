package dev.mota.sistema_pdv.product;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

import jakarta.persistence.PersistenceException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;
import org.springframework.boot.jpa.test.autoconfigure.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;

/**
 * Confere o mapeamento da entidade contra a tabela criada pela V2 (H2 no modo PostgreSQL).
 * Cada teste roda numa transação desfeita no final, então um não interfere no outro.
 */
@DataJpaTest
@ActiveProfiles("test")
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class ProductPersistenceTest {

    @Autowired
    TestEntityManager entityManager;

    @Test
    void savesAndLoadsAllFields() {
        Product product = Product.create("7891000000011", "Cabo USB-C reforçado", 2990, 5);
        product.restock(18);

        entityManager.persistAndFlush(product);
        entityManager.clear(); // força a leitura do banco, e não do cache

        Product loaded = entityManager.find(Product.class, product.getId());
        assertEquals("7891000000011", loaded.getBarcode());
        assertEquals("Cabo USB-C reforçado", loaded.getName());
        assertEquals(2990, loaded.getPriceInCents());
        assertEquals(18, loaded.getStockQuantity());
        assertEquals(5, loaded.getMinStock());
        assertEquals(0L, loaded.getVersion());
        assertNotNull(loaded.getCreatedAt());
        assertNotNull(loaded.getUpdatedAt());
    }

    @Test
    void versionIncreasesOnEachChange() {
        Product product = Product.create("7891000000011", "Cabo USB-C reforçado", 2990, 5);
        entityManager.persistAndFlush(product);

        product.restock(3);
        entityManager.flush();

        assertEquals(1L, product.getVersion());
    }

    @Test
    void barcodeIsUnique() {
        entityManager.persistAndFlush(Product.create("7891000000011", "Cabo USB-C", 2990, 5));

        Product duplicate = Product.create("7891000000011", "Outro produto", 1000, 1);

        assertThrows(PersistenceException.class, () -> entityManager.persistAndFlush(duplicate));
    }
}
