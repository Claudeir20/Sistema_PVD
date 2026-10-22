package dev.mota.sistema_pdv.sale;

import java.util.UUID;

import dev.mota.sistema_pdv.product.Product;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;

/**
 * Um produto vendido. Guarda o preço do momento da venda: se o preço do produto mudar depois,
 * a venda continua com o valor que o cliente pagou (importante para trocas e relatórios).
 */
@Entity
@Getter
@Table(name = "sale_items")
public class SaleItem {

    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "sale_id", nullable = false)
    private Sale sale;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    /** Cópia do nome no momento da venda: se o produto for renomeado, o recibo não muda. */
    @Column(nullable = false, length = 120) // mesmo tamanho do nome no Product
    private String productName;

    @Column(nullable = false)
    private int quantity;

    @Column(nullable = false)
    private long unitPriceInCents;

    @Column(nullable = false)
    private long totalInCents;

    protected SaleItem() {
    }

    private SaleItem(Sale sale, Product product, int quantity, long unitPriceInCents) {
        this.id = UUID.randomUUID();
        this.sale = sale;
        this.product = product;
        this.productName = product.getName();
        this.quantity = quantity;
        this.unitPriceInCents = unitPriceInCents;
        this.totalInCents = Math.multiplyExact(unitPriceInCents, (long) quantity);
    }

    /** Só a Sale cria itens (sem public), então não existe item solto, sem venda. */
    static SaleItem create(Sale sale, Product product, int quantity, long unitPriceInCents) {
        return new SaleItem(sale, product, quantity, unitPriceInCents);
    }
}
