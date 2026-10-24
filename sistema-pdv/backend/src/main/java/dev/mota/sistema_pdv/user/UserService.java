package dev.mota.sistema_pdv.user;

import java.util.Locale;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import dev.mota.sistema_pdv.shared.error.ConflictException;
import dev.mota.sistema_pdv.user.dto.CreateUserRequest;
import dev.mota.sistema_pdv.user.dto.ResetPasswordRequest;
import dev.mota.sistema_pdv.user.dto.UserResponse;
import dev.mota.sistema_pdv.user.exception.EmailAlreadyExistsException;
import dev.mota.sistema_pdv.user.exception.UserNotFoundException;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public UserResponse create(CreateUserRequest request) {
        // A entidade valida e normaliza o e-mail; a checagem de duplicado usa o valor
        // já limpo.
        User user = User.createUser(
                request.name(),
                request.role(),
                request.email(),
                passwordEncoder.encode(request.password()));

        if (userRepository.existsByEmail(user.getEmail())) {
            throw new EmailAlreadyExistsException(user.getEmail());
        }

        try {
            return userMapper.toResponse(userRepository.saveAndFlush(user));
        } catch (DataIntegrityViolationException e) {
            // Dois cadastros com o mesmo e-mail ao mesmo tempo: o UNIQUE do banco barra o
            // segundo.
            if (isEmailUniqueViolation(e)) {
                throw new EmailAlreadyExistsException(user.getEmail());
            }
            throw e;
        }
    }

    @Transactional(readOnly = true)
    public List<UserResponse> findAll() {
        return userRepository.findAll(Sort.by("name")).stream()
                .map(userMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public UserResponse findByEmail(String email) {
        return userRepository.findByEmail(email)
                .map(userMapper::toResponse)
                .orElseThrow(() -> new UserNotFoundException());
    }

    @Transactional(readOnly = true)
    public UserResponse findById(UUID id) {
        return userMapper.toResponse(getUser(id));
    }

    private boolean isEmailUniqueViolation(DataIntegrityViolationException exception) {
        String message = exception.getMostSpecificCause().getMessage();
        return message != null && message.toLowerCase(Locale.ROOT).contains("uk_users_email");
    }

    @Transactional
    public void resetPassword(UUID userId, ResetPasswordRequest request, String loggedEmail) {
        User user = getUser(userId);
        if (user.getEmail().equals(loggedEmail)) {
            throw new ConflictException("Para trocar a própria senha, use a opção Trocar minha senha.");
        }
        user.changePasswordHash(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
    }

    @Transactional
    public UserResponse changeRole(UUID id, Role role, String loggedEmail) {

        User user = getUser(id);

        if (user.getEmail().equals(loggedEmail)) {
            throw new ConflictException(loggedEmail)
        }

        user.changeRole(role);
        return userMapper.toResponse(userRepository.saveAndFlush(user));
    }

    @Transactional
    public UserResponse deactivate(UUID id, String loggedEmail) {
        User user = getUser(id);
        if (user.getEmail().equals(loggedEmail)) {
            throw new ConflictException("Você não pode desativar o próprio usuário");
        }
        user.deactivate();
        return userMapper.toResponse(userRepository.saveAndFlush(user));
    }

    @Transactional
    public UserResponse reactivate(UUID id) {
        User user = getUser(id);
        user.reactivate();
        return userMapper.toResponse(userRepository.saveAndFlush(user));
    }

    private User getUser(UUID id) {
        return userRepository.findById(id).orElseThrow(() -> new UserNotFoundException());
    }
}
