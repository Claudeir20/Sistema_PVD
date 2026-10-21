package dev.mota.sistema_pdv.auth;

import jakarta.validation.constraints.NotBlank;

/** Sem limite de tamanho da senha: no login, a pessoa só digita a senha que já tem. */
public record LoginRequest(
        @NotBlank(message = "Informe o e-mail.")
        String email,

        @NotBlank(message = "Informe a senha.")
        String password
) {}
