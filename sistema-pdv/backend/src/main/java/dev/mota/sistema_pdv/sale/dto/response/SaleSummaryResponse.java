package dev.mota.sistema_pdv.sale.dto.response;

import java.time.Instant;
import java.util.UUID;

public record SaleSummaryResponse(
        UUID id,
        String number,
        String status,
        String paymentMethod,
        long totalInCents,
        Instant createdAt) {
}
