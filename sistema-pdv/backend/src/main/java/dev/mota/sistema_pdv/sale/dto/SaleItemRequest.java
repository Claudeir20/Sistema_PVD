package dev.mota.sistema_pdv.sale.dto;

import java.util.UUID;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record SaleItemRequest(
    @NotNull (message = "Informe o produto")
    UUID productId,

    @NotNull (message = "Informe a quantidade ")
    @Positive (message = "Quantidade deve ser maior que zero")
    Integer quantity
) {
    
}
