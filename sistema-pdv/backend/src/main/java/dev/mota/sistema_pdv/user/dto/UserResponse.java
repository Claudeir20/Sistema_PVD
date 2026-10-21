package dev.mota.sistema_pdv.user.dto;

import java.time.Instant;
import java.util.UUID;

/** Nunca inclui o hash da senha. */
public record UserResponse(
        UUID id,
        String name,
        String email,
        String role,
        boolean active,
        Instant createdAt
) {}
