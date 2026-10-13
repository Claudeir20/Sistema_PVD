package dev.mota.sistema_pdv.product;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import dev.mota.sistema_pdv.product.dto.ProductResponse;
import org.junit.jupiter.api.Test;

class ProductMapperTest {

    private final ProductMapper mapper = new ProductMapper();

    @Test
    void copiesAllFieldsToResponse() {
        Product product = Product.create("7891000000011", "Cabo USB-C", 2990, 5);
        product.restock(18);

        ProductResponse response = mapper.toResponse(product);

        assertEquals(product.getId(), response.id());
        assertEquals("7891000000011", response.barcode());
        assertEquals("Cabo USB-C", response.name());
        assertEquals(2990, response.priceInCents());
        assertEquals(18, response.stockQuantity());
        assertEquals(5, response.minStock());
        assertTrue(response.active());
    }
}
