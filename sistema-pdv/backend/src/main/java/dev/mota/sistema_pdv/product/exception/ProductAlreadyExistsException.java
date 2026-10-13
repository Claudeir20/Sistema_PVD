package dev.mota.sistema_pdv.product.exception;

import dev.mota.sistema_pdv.shared.error.ConflictException;

/**
 * Já existe um produto com o código de barras informado. Vira HTTP 409.
 * Por herdar de ConflictException, o ApiExceptionHandler já trata esta exceção sem nenhuma alteração.
 */
public class ProductAlreadyExistsException extends ConflictException {

    public ProductAlreadyExistsException(String barcode) {
        super("Já existe um produto com o código de barras " + barcode + ".");
    }
}
