package dev.mota.sistema_pdv.user.dto;

import jakarta.validation.constraints.Size;

public record ResetPasswordRequest(
        @Size(min = 8, max = 72) String newPassword) {

}
