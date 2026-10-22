package dev.mota.sistema_pdv.movements;

public enum StockMovementType {

    /** Entrada de mercadoria (reposição). */
    ENTRY,
    /** Saída manual (perda, uso interno). */
    EXIT,
    /** Contagem física: a diferença pode ser positiva ou negativa. */
    ADJUSTMENT,
    /** Saída por venda no PDV. */
    SALE,
    /** Devolução ao estoque pelo cancelamento de uma venda; vale mesmo para produto arquivado. */
    SALE_CANCELLATION
}
