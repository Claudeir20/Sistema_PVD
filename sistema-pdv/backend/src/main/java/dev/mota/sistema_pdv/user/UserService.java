package dev.mota.sistema_pdv.user;

import java.util.Locale;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import dev.mota.sistema_pdv.user.dto.CreateUserRequest;
import dev.mota.sistema_pdv.user.dto.UserResponse;
import dev.mota.sistema_pdv.user.exception.EmailAlreadyExistsException;
import dev.mota.sistema_pdv.user.exception.UserNotFoundException;

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
    public UserResponse findByEmail(String email) {
        return userRepository.findByEmail(email)
                .map(userMapper::toResponse)
                .orElseThrow(() -> new UserNotFoundException());
    }

    private boolean isEmailUniqueViolation(DataIntegrityViolationException exception) {
        String message = exception.getMostSpecificCause().getMessage();
        return message != null && message.toLowerCase(Locale.ROOT).contains("uk_users_email");
    }
}
