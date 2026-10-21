package dev.mota.sistema_pdv.auth;

import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
    @NotBlank(message = "Informe e-mail")
    String email,
    @NotBlank(message = "informe a senha")
    String password
) {
    
}
