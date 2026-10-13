package dev.mota.sistema_pdv.shared.error;

import java.util.Comparator;
import java.util.Objects;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * Converte as exceções em respostas {"message": "..."} em português.
 * <ul>
 *   <li>400 – IllegalArgumentException e validação: dados inválidos ou regra de negócio violada
 *       (ex.: estoque insuficiente).</li>
 *   <li>404 – NotFoundException: o registro indicado na URL não existe.</li>
 *   <li>409 – ConflictException e conflitos do banco: duplicado, alterado por outra operação,
 *       possui histórico, já arquivado.</li>
 * </ul>
 */
@RestControllerAdvice
public class ApiExceptionHandler {

    private static final String INVALID_DATA = "Dados inválidos. Confira os campos enviados.";

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> badRequest(IllegalArgumentException ex) {
        return error(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> invalidFields(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .map(error -> error.getDefaultMessage())
                .filter(Objects::nonNull)
                .min(Comparator.naturalOrder())
                .orElse(INVALID_DATA);
        return error(HttpStatus.BAD_REQUEST, message);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> unreadable() {
        return error(HttpStatus.BAD_REQUEST, INVALID_DATA);
    }

    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<ErrorResponse> notFound(NotFoundException ex) {
        return error(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    @ExceptionHandler(ConflictException.class)
    public ResponseEntity<ErrorResponse> conflict(ConflictException ex) {
        return error(HttpStatus.CONFLICT, ex.getMessage());
    }

    @ExceptionHandler({DataIntegrityViolationException.class, OptimisticLockingFailureException.class})
    public ResponseEntity<ErrorResponse> concurrentChange() {
        return error(HttpStatus.CONFLICT,
                "Registro duplicado ou alterado por outra operação. Atualize os dados e tente novamente.");
    }

    private static ResponseEntity<ErrorResponse> error(HttpStatus status, String message) {
        return ResponseEntity.status(status).body(new ErrorResponse(message));
    }
}
