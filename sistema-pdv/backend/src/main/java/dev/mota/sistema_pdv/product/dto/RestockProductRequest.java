package dev.mota.sistema_pdv.product.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;


public record RestockProductRequest(
        @NotNull(message = "Informe a quantidade.")
        @Positive(message = "A quantidade deve ser maior que zero.")
        Integer quantity
) {}
