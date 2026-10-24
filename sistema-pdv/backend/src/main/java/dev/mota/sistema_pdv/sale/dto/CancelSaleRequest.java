package dev.mota.sistema_pdv.sale.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CancelSaleRequest(
        @NotBlank(message = "Informe o motivo do cancelamento.")
        @Size(min = 3, max = 200, message = "O motivo deve ter de 3 a 200 caracteres.")
        String reason) {
}
