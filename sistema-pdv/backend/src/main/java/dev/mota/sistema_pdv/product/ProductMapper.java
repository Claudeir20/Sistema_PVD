package dev.mota.sistema_pdv.product;

import dev.mota.sistema_pdv.product.dto.ProductResponse;
import org.springframework.stereotype.Component;

/** Converte a entidade Product no DTO da API. Só copia dados: as regras ficam na entidade. */
@Component
public class ProductMapper {

    public ProductResponse toResponse(Product product) {
        return new ProductResponse(
                product.getId(),
                product.getBarcode(),
                product.getName(),
                product.getPriceInCents(),
                product.getStockQuantity(),
                product.getMinStock(),
                product.isActive(),
                product.getVersion(),
                product.getCreatedAt(),
                product.getUpdatedAt());
    }
}
