package dev.mota.sistema_pdv.product.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

public record AdjustStockRequest(
        @NotNull(message = "Informe a quantidade contada.")
        @PositiveOrZero(message = "A quantidade contada não pode ser negativa.")
        Integer countedQuantity,

        @NotBlank(message = "Informe o motivo do ajuste.")
        @Size(max = 150, message = "O motivo deve ter no máximo 150 caracteres.")
        String reason
) {}