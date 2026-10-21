package dev.mota.sistema_pdv.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import dev.mota.sistema_pdv.user.Role;

public record CreateUserRequest(
        @NotBlank(message = "Informe o nome.")
        @Size(max = 100, message = "O nome deve ter no máximo 100 caracteres.")
        String name,

        @NotNull(message = "Informe o perfil.")
        Role role,

        @NotBlank(message = "Informe o e-mail.")
        @Email(message = "Informe um e-mail válido.")
        @Size(max = 150, message = "O e-mail deve ter no máximo 150 caracteres.")
        String email,

        // 72 é o limite do BCrypt: o que passar disso seria ignorado no hash.
        @NotBlank(message = "Informe a senha.")
        @Size(min = 6, max = 72, message = "A senha deve ter de 6 a 72 caracteres.")
        String password
) {}
