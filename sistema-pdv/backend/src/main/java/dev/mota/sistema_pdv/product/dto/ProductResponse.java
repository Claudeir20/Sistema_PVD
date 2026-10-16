package dev.mota.sistema_pdv.product.dto;

import java.time.Instant;
import java.util.UUID;

public record ProductResponse(
        UUID id,
        String barcode,
        String name,
        long priceInCents,
        int stockQuantity,
        int minStock,
        boolean active,
        Long version,
        boolean belowMinStock,
        Instant createdAt,
        Instant updatedAt


) {
}
