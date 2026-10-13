package dev.mota.sistema_pdv.shared.error;

/** O registro indicado na URL não existe. Vira HTTP 404. */
public class NotFoundException extends RuntimeException {

    public NotFoundException(String message) {
        super(message);
    }
}
