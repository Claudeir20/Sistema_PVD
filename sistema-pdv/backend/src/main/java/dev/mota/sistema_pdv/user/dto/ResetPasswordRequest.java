package dev.mota.sistema_pdv.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ResetPasswordRequest(
        @NotBlank (message = "Informe a nova senha")
        @Size(min = 8, max = 72,  message = "A senha deve ter de 6 a 72 caracteres.") 
        String newPassword) {

}
