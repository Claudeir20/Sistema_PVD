package dev.mota.sistema_pdv.user;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import dev.mota.sistema_pdv.user.dto.ChangeRoleRequest;
import dev.mota.sistema_pdv.user.dto.CreateUserRequest;
import dev.mota.sistema_pdv.user.dto.ResetPasswordRequest;
import dev.mota.sistema_pdv.user.dto.UserResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponse create(@Valid @RequestBody CreateUserRequest request) {
        return userService.create(request);
    }

    @GetMapping
    public List<UserResponse> finfAll() {
        return userService.findAll();
    }

    @GetMapping("/{id}")
    public UserResponse findById(@PathVariable UUID id) {
        return userService.findById(id);
    }

    @PutMapping("/{id}/role")
    public UserResponse changeRole(@PathVariable UUID id, @Valid @RequestBody ChangeRoleRequest request) {
        return userService.changeRole(id, request.role());
    }

    @PostMapping("/{id}/deactivate")
    public UserResponse deactivate(@PathVariable UUID id, Authentication authentication) {
        return userService.deactivate(id, authentication.getName());
    }

    @PostMapping("/{id}/reactivate")
    public UserResponse reactivate(@PathVariable UUID id) {
        return userService.reactivate(id);
    }

    @PostMapping("/{id}/password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void changePasswordHash(@PathVariable UUID id, @Valid @RequestBody ResetPasswordRequest request,
            Authentication authentication) {
        userService.resetPassword(id, request, authentication.getName());
    }

}
