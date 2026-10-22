package dev.mota.sistema_pdv.sale;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

import dev.mota.sistema_pdv.movements.StockMovement;
import dev.mota.sistema_pdv.movements.StockMovementType;
import dev.mota.sistema_pdv.product.Product;
import dev.mota.sistema_pdv.sale.enums.PaymentMethod;
import dev.mota.sistema_pdv.sale.enums.SaleStatus;
import dev.mota.sistema_pdv.shared.error.ConflictException;
import dev.mota.sistema_pdv.user.User;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Getter;

/**
 * Venda do PDV. O estoque nunca é alterado direto por aqui: cada item passa
 * pela
 * StockMovement da venda, que baixa o estoque e registra no histórico.
 * <ul>
 * <li>Preço: vem do produto (banco) no momento do addItem, nunca do
 * frontend.</li>
 * <li>Totais: calculados pela própria venda a partir dos itens.</li>
 * <li>Cancelamento: operação da venda inteira; devolve todos os itens ao
 * estoque.</li>
 * </ul>
 */
@Entity
@Getter
@Table(name = "sales")
public class Sale {

    @Id
    private UUID id;

    /** Número para o cliente e o caixa (V-0042). Vem de uma sequence do banco. */
    @Column(nullable = false, unique = true, updatable = false)
    private long number;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SaleStatus status;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentMethod paymentMethod;

    @Column(nullable = false)
    private long subtotalInCents;

    @Column(nullable = false)
    private long discountInCents;

    @Column(nullable = false)
    private long totalInCents;

    /**
     * Opcional: só os 11 dígitos. A validação do CPF entra na seção de Clientes.
     */
    @Column(length = 11)
    private String customerCpf;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "seller_id", nullable = false, updatable = false)
    private User seller;

    /** Saída de estoque desta venda. */
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "stock_movement_id", nullable = false, unique = true, updatable = false)
    private StockMovement stockMovement;

    /**
     * Entrada que devolveu os itens ao estoque; só existe se a venda foi cancelada.
     */
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cancellation_movement_id", unique = true)
    private StockMovement cancellationMovement;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @OneToMany(mappedBy = "sale", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SaleItem> items = new ArrayList<>();

    protected Sale() {

    }

    private Sale(long number, User seller, PaymentMethod paymentMethod, String customerCpf,
            StockMovement stockMovement) {
        this.id = UUID.randomUUID();
        this.number = number;
        this.status = SaleStatus.COMPLETED;
        this.paymentMethod = paymentMethod;
        this.customerCpf = customerCpf;
        this.seller = seller;
        this.stockMovement = stockMovement;
        this.createdAt = Instant.now();
    }

    /** Cria a venda vazia. Os produtos entram depois, com addItem. */
    public static Sale create(long number, User seller, PaymentMethod paymentMethod, String customerCpf,
            StockMovement stockMovement) {
        if (number <= 0) {
            throw new IllegalArgumentException("Número da venda inválido.");
        }
        if (seller == null) {
            throw new IllegalArgumentException("Informe o vendedor.");
        }
        if (paymentMethod == null) {
            throw new IllegalArgumentException("Informe a forma de pagamento.");
        }
        if (stockMovement == null || stockMovement.getType() != StockMovementType.SALE) {
            throw new IllegalArgumentException("A venda precisa de uma movimentação de estoque do tipo venda.");
        }
        return new Sale(number, seller, paymentMethod, validCpf(customerCpf), stockMovement);
    }

    /**
     * Baixa o estoque (pela movimentação) e registra o item com o preço atual do
     * produto.
     */
    public void addItem(Product product, int quantity) {
        requireNotCanceled();
        if (product == null) {
            throw new IllegalArgumentException("Informe o produto.");
        }
        if (quantity <= 0) {
            throw new IllegalArgumentException("A quantidade deve ser maior que zero.");
        }

        stockMovement.addProduct(product, quantity); // único lugar que mexe no estoque
        items.add(SaleItem.create(this, product, quantity, product.getPriceInCents()));
        recalculateTotals();
    }

    /** Desconto em centavos sobre o subtotal. Nunca maior que o subtotal. */
    public void applyDiscount(long discountInCents) {
        requireNotCanceled();
        if (discountInCents < 0) {
            throw new IllegalArgumentException("O desconto não pode ser negativo.");
        }
        if (discountInCents > subtotalInCents) {
            throw new IllegalArgumentException("O desconto não pode ser maior que o subtotal.");
        }
        this.discountInCents = discountInCents;
        recalculateTotals();
    }

    /**
     * Cancela a venda inteira: todos os itens voltam ao estoque por uma
     * movimentação de entrada,
     * que fica registrada junto da venda.
     */
    public void cancel(StockMovement cancellationMovement) {
        requireNotCanceled();
        if (cancellationMovement == null || cancellationMovement.getType() != StockMovementType.SALE_CANCELLATION) {
            throw new IllegalArgumentException("O cancelamento precisa de uma movimentação de cancelamneto de venda.");
        }

        for (SaleItem item : items) {
            cancellationMovement.addProduct(item.getProduct(), item.getQuantity());
        }
        this.cancellationMovement = cancellationMovement;
        this.status = SaleStatus.CANCELED;
    }

    public boolean isCanceled() {
        return status == SaleStatus.CANCELED;
    }

    public List<SaleItem> getItems() {
        return Collections.unmodifiableList(items);
    }

    private void recalculateTotals() {
        long subtotal = 0;
        for (SaleItem item : items) {
            subtotal = Math.addExact(subtotal, item.getTotalInCents());
        }
        this.subtotalInCents = subtotal;
        this.totalInCents = subtotal - discountInCents;
    }

    private void requireNotCanceled() {
        if (isCanceled()) {
            throw new ConflictException("Esta venda já está cancelada.");
        }
    }

    private static String validCpf(String customerCpf) {
        if (customerCpf == null || customerCpf.isBlank()) {
            return null;
        }
        String digits = customerCpf.replaceAll("\\D", "");
        if (digits.length() != 11) {
            throw new IllegalArgumentException("O CPF deve ter 11 dígitos.");
        }
        return digits;
    }

    @Override
    public boolean equals(Object other) {
        return this == other || (other instanceof Sale sale && id.equals(sale.id));
    }

    @Override
    public int hashCode() {
        return id.hashCode();
    }
}
