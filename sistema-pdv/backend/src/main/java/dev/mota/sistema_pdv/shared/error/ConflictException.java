package dev.mota.sistema_pdv.shared.error;

/**
 * Conflito com o estado atual do registro: duplicado, formulário desatualizado,
 * possui histórico, já arquivado. Vira HTTP 409.
 */
public class ConflictException extends RuntimeException {

    public ConflictException(String message) {
        super(message);
    }
}
