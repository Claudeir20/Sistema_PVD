package dev.mota.sistema_pdv.product.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

public record ImportProductItem(
    int line,

    @NotBlank (message ="Informe o código de barras.")
    @Size (max = 50, message = "O Código de barras deve ter no máximo 50 caracteres")
    String barcode,

    @NotBlank(message = "Informe o nome do produto.")
    @Size(max = 120, message = "O nome do produto deve ter no máximo 120 caracteres")
    String name, 

    @NotNull (message = "Informe o preço.")
    @Positive(message = "O preço deve ser maior que zero.")
    Long priceInCents,

    @NotNull (message = "Informe o estoque mínimo.")
    @PositiveOrZero(message = "O estoque mínimo não pode ser negativo.")
    Integer minStock,

    @PositiveOrZero (message = "O estoque inicial não pode ser negativo")
    int initialStock
) {
    
}
