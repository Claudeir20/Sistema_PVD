package dev.mota.sistema_pdv.sale.exception;

import dev.mota.sistema_pdv.shared.error.NotFoundException;

/** Nenhuma venda com o id informado. Vira HTTP 404. */
public class SaleNotFoundException extends NotFoundException {

    public SaleNotFoundException() {
        super("Venda não encontrada.");
    }
}
