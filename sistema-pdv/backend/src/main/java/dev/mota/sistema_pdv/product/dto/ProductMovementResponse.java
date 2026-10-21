package dev.mota.sistema_pdv.product.dto;

import dev.mota.sistema_pdv.movements.StockMovementType;


import java.time.Instant;
import java.util.UUID;

public record ProductMovementResponse(

        UUID movementId,
        StockMovementType type,
        Instant date,
        String observation,
        int quantity,
        int balanceAfter

) {
}
