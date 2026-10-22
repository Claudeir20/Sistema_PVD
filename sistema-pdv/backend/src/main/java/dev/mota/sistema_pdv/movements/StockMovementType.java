package dev.mota.sistema_pdv.movements;

public enum StockMovementType {

    /** Entrada de mercadoria (reposição ou devolução por cancelamento de venda). */
    ENTRY,
    /** Saída manual (perda, uso interno). */
    EXIT,
    /** Contagem física: a diferença pode ser positiva ou negativa. */
    ADJUSTMENT,
    /** Saída por venda no PDV. */
    SALE
}
