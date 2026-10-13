package dev.mota.sistema_pdv.product;

import dev.mota.sistema_pdv.shared.error.ConflictException;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import java.time.Instant;
import java.util.UUID;
import lombok.Getter;


@Entity
@Table(name = "products")
@Getter
public class Product {

    static final int BARCODE_MAX_LENGTH = 50;
    static final int NAME_MAX_LENGTH = 120;

    @Id
    private UUID id;

    @Column(nullable = false, unique = true, length = BARCODE_MAX_LENGTH)
    private String barcode;

    @Column(nullable = false, length = NAME_MAX_LENGTH)
    private String name;

    @Column(nullable = false)
    private long priceInCents;

    @Column(nullable = false)
    private int stockQuantity;

    @Column(nullable = false)
    private int minStock;

    @Column(nullable = false)
    private boolean active;


    @Version
    private Long version;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;


    protected Product() {
    }

    private Product(String barcode, String name, long priceInCents, int minStock) {
        this.id = UUID.randomUUID();
        this.barcode = barcode;
        this.name = name;
        this.priceInCents = priceInCents;
        this.minStock = minStock;
        this.stockQuantity = 0;
        this.active = true;
    }

    public static Product create(String barcode, String name, long priceInCents, int minStock) {
        return new Product(
                validBarcode(barcode),
                validName(name),
                validPrice(priceInCents),
                validMinStock(minStock));
    }


    public void updateDetails(String name, long priceInCents, int minStock) {
        String newName = validName(name);
        long newPrice = validPrice(priceInCents);
        int newMinStock = validMinStock(minStock);

        this.name = newName;
        this.priceInCents = newPrice;
        this.minStock = newMinStock;
    }


    public void restock(int quantity) {
        requireActive();
        requirePositiveQuantity(quantity);
        this.stockQuantity = Math.addExact(this.stockQuantity, quantity);
    }


    public void decreaseStock(int quantity) {
        requireActive();
        requirePositiveQuantity(quantity);
        if (quantity > stockQuantity) {
            throw new IllegalArgumentException(
                    "Estoque insuficiente para " + name + ". Disponível: " + stockQuantity + ".");
        }
        this.stockQuantity -= quantity;
    }


    public boolean isBelowMinStock() {
        return stockQuantity <= minStock;
    }


    public void archive() {
        if (!active) {
            throw new ConflictException("Este produto já está arquivado.");
        }
        this.active = false;
    }

    public void reactivate() {
        if (active) {
            throw new ConflictException("Este produto já está ativo.");
        }
        this.active = true;
    }

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        this.updatedAt = Instant.now();
    }

    private void requireActive() {
        if (!active) {
            throw new IllegalArgumentException("O produto " + name + " está arquivado.");
        }
    }

    private static void requirePositiveQuantity(int quantity) {
        if (quantity <= 0) {
            throw new IllegalArgumentException("A quantidade deve ser maior que zero.");
        }
    }

    private static String validBarcode(String barcode) {
        String value = barcode == null ? "" : barcode.strip();
        if (value.isEmpty()) {
            throw new IllegalArgumentException("Informe o código de barras.");
        }
        if (value.length() > BARCODE_MAX_LENGTH) {
            throw new IllegalArgumentException(
                    "O código de barras deve ter no máximo " + BARCODE_MAX_LENGTH + " caracteres.");
        }
        if (value.chars().anyMatch(Character::isWhitespace)) {
            throw new IllegalArgumentException("O código de barras não pode ter espaços.");
        }
        return value;
    }

    private static String validName(String name) {
        String value = name == null ? "" : name.strip();
        if (value.isEmpty()) {
            throw new IllegalArgumentException("Informe o nome do produto.");
        }
        if (value.length() > NAME_MAX_LENGTH) {
            throw new IllegalArgumentException(
                    "O nome do produto deve ter no máximo " + NAME_MAX_LENGTH + " caracteres.");
        }
        return value;
    }

    private static long validPrice(long priceInCents) {
        if (priceInCents <= 0) {
            throw new IllegalArgumentException("O preço deve ser maior que zero.");
        }
        return priceInCents;
    }

    private static int validMinStock(int minStock) {
        if (minStock < 0) {
            throw new IllegalArgumentException("O estoque mínimo não pode ser negativo.");
        }
        return minStock;
    }

    /** Dois objetos são o mesmo produto quando têm o mesmo id (gerado na criação). */
    @Override
    public boolean equals(Object other) {
        return this == other || (other instanceof Product product && id.equals(product.id));
    }

    @Override
    public int hashCode() {
        return id.hashCode();
    }
}
