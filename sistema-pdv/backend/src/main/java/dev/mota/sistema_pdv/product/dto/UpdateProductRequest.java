package dev.mota.sistema_pdv.product.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;


public record UpdateProductRequest(
        @NotBlank(message = "Informe o nome do produto.")
        @Size(max = 120, message = "O nome do produto deve ter no máximo 120 caracteres.")
        String name,

        @NotNull(message = "Informe o preço.")
        @Positive(message = "O preço deve ser maior que zero.")
        Long priceInCents,

        @NotNull(message = "Informe o estoque mínimo.")
        @PositiveOrZero(message = "O estoque mínimo não pode ser negativo.")
        Integer minStock,

        @NotNull(message = "Informe a versão do produto.")
        Long version
) {}
