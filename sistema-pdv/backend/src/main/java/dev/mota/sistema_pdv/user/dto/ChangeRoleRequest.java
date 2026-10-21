package dev.mota.sistema_pdv.user.dto;

import dev.mota.sistema_pdv.user.Role;

import jakarta.validation.constraints.NotNull;

public record ChangeRoleRequest(
    @NotNull(message = "Informe o perfil")
    Role role
) {
    
}
