package dev.mota.sistema_pdv.movements;

import dev.mota.sistema_pdv.product.dto.ProductMovementResponse;
import org.springframework.stereotype.Component;

/** Converte um item de movimentação em uma linha do histórico do produto. */
@Component
public class ProductMovementItemsMapper {

    public ProductMovementResponse toResponse(MovementItems movementItems) {
        StockMovement movement = movementItems.getMovement();

        return new ProductMovementResponse(
                movement.getId(),
                movement.getType(),
                movement.getDate(),
                movement.getObservation(),
                movementItems.getQuantity(),
                movementItems.getBalanceAfter());
    }
}
