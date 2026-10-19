package dev.mota.sistema_pdv.movements;

import dev.mota.sistema_pdv.product.Product;
import jakarta.persistence.*;
import lombok.Getter;

import java.util.UUID;

@Entity
@Getter
@Table(name = "movement_items")
public class MovementItems {

    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "movement_id", nullable = false)
    private StockMovement movement;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    /** Com sinal: positivo entrou, negativo saiu. */
    @Column(nullable = false)
    private int quantity;

    /** Estoque do produto logo depois desta movimentação. */
    @Column(nullable = false)
    private int balanceAfter;

    protected MovementItems() {}

    private MovementItems(StockMovement movement, Product product, int quantity, int balanceAfter) {
        this.id = UUID.randomUUID();
        this.movement = movement;
        this.product = product;
        this.quantity = quantity;
        this.balanceAfter = balanceAfter;
    }

    static MovementItems create(StockMovement movement, Product product, int quantity, int balanceAfter) {
        return new MovementItems(movement, product, quantity, balanceAfter);
    }
}
