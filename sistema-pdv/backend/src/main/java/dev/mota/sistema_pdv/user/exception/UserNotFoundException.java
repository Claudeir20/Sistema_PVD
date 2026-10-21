package dev.mota.sistema_pdv.user.exception;

import dev.mota.sistema_pdv.shared.error.NotFoundException;

public class UserNotFoundException extends NotFoundException {
    public UserNotFoundException() {
        super("Usuário não encontrado");
    }

}
