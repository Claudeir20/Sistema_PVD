package dev.mota.sistema_pdv.sale.dto.response;


import java.util.UUID;

public record SaleItemResponse(
        UUID productId,
        String productName,
        int quantity,
        long unitPriceInCents,
        long totalInCents
) {}