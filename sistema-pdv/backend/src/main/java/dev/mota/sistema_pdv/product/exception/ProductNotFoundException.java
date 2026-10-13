package dev.mota.sistema_pdv.product.exception;

import dev.mota.sistema_pdv.shared.error.NotFoundException;

/** Nenhum produto com o id ou código de barras informado. Vira HTTP 404. */
public class ProductNotFoundException extends NotFoundException {

    public ProductNotFoundException() {
        super("Produto não encontrado.");
    }
}
