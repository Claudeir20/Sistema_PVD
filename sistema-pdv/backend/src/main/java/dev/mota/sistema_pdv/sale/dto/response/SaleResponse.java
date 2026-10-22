package dev.mota.sistema_pdv.sale.dto.response;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record SaleResponse(
                UUID id,
                String number,
                String status,
                String paymentMethod,
                long subtotalInCents,
                long discountInCents,
                long totalInCents,
                Long cashReceivedInCents,
                Long changeInCents,
                String customerCpf,
                String sellerName,
                Instant createdAt,
                List<SaleItemResponse> items) {
}