package dev.mota.sistema_pdv.user;

import org.springframework.stereotype.Component;
import dev.mota.sistema_pdv.user.dto.UserResponse;

@Component
public class UserMapper {

    public UserResponse toResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole().name(),
                user.isActive(),
                user.getCreatedAt());
    }
}
