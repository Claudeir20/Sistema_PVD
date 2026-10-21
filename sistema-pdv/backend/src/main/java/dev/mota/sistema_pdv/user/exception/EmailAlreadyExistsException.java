package dev.mota.sistema_pdv.user.exception;

import dev.mota.sistema_pdv.shared.error.ConflictException;

public class EmailAlreadyExistsException extends ConflictException {
    public EmailAlreadyExistsException(String email){
        super("E-mail já cadastrado: " + email);
    }
    
}
