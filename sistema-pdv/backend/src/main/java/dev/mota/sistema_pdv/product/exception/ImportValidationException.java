package dev.mota.sistema_pdv.product.exception;

import java.util.List;

public class ImportValidationException extends RuntimeException {
    public record LineError(int line, String message) {
    }

    private final List<LineError> errors;

    public ImportValidationException(List<LineError> errors){
        super("Nenhum produto foi importado. Corrija as linhas indicadas e tente de novo");
        this.errors = errors;
    }

    public List<LineError> getErrors() {
        return errors;
    }
    
}

