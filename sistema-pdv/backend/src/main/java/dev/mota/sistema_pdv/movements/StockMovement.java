package dev.mota.sistema_pdv.movements;

import dev.mota.sistema_pdv.product.Product;
import jakarta.persistence.*;
import lombok.Getter;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Entity
@Getter
@Table(name = "movements")
public class StockMovement {

    @Id
    private UUID id;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private StockMovementType type;

    @Column(nullable = false)
    private Instant date;

    private String observation;

    @OneToMany(mappedBy = "movement", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MovementItems> items = new ArrayList<>();

    protected StockMovement() {
    }

    private StockMovement(StockMovementType type, String observation) {
        this.id = UUID.randomUUID();
        this.type = type;
        this.observation = observation;
        this.date = Instant.now();
    }

    public static StockMovement create(StockMovementType type, String observation) {
        if (type == null) {
            throw new IllegalArgumentException("Informe o tipo da movimentação.");
        }

        String cleanObservation = observation == null || observation.isBlank() ? null : observation.strip();
        if (type == StockMovementType.ADJUSTMENT && cleanObservation == null) {
            throw new IllegalArgumentException("Informe o motivo do ajuste.");
        }

        return new StockMovement(type, cleanObservation);
    }

    /** Entrada ou saída: a direção vem do tipo da movimentação. */
    public void addProduct(Product product, int quantity) {
        if (product == null) {
            throw new IllegalArgumentException("Informe o produto.");
        }
        if (quantity <= 0) {
            throw new IllegalArgumentException("A quantidade deve ser maior que zero.");
        }

        // switch como expressão: se um tipo novo for criado e não for tratado aqui, não
        // compila
        int signedQuantity = switch (type) {
            case ENTRY -> {
                product.restock(quantity);
                yield quantity;
            }
            case EXIT -> {
                product.decreaseStock(quantity);
                yield -quantity;
            }
            case ADJUSTMENT -> throw new IllegalArgumentException(
                    "Em uma movimentação de ajuste, informe a quantidade contada.");
            case SALE -> {
                product.decreaseStock(quantity);
                yield -quantity;
            }
            case SALE_CANCELLATION -> {
                product.returnStock(quantity);
                yield quantity;
            }
        };

        items.add(MovementItems.create(this, product, signedQuantity, product.getStockQuantity()));
    }

    public void addCountedProduct(Product product, int countedQuantity) {
        if (type != StockMovementType.ADJUSTMENT) {
            throw new IllegalArgumentException("Contagem só pode ser lançada em uma movimentação de ajuste.");
        }
        if (product == null) {
            throw new IllegalArgumentException("Informe o produto.");
        }

        int difference = countedQuantity - product.getStockQuantity();
        product.adjustStock(countedQuantity);
        items.add(MovementItems.create(this, product, difference, product.getStockQuantity()));
    }



    public List<MovementItems> getItems() {
        return Collections.unmodifiableList(items);
    }

}
