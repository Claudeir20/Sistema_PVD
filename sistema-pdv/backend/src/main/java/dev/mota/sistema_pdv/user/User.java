package dev.mota.sistema_pdv.user;

import dev.mota.sistema_pdv.shared.error.ConflictException;
import jakarta.persistence.*;
import lombok.Getter;

import java.time.Instant;
import java.util.Locale;
import java.util.UUID;

@Entity
@Getter
@Table(name = "users")
public class User {

    static final int NAME_MAX_LENGTH = 100;
    static final int EMAIL_MAX_LENGTH = 150;

    @Id
    private UUID id;

    @Column(nullable = false, length = NAME_MAX_LENGTH)
    private String name;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private Role role;

    @Column(nullable = false, unique = true, length = EMAIL_MAX_LENGTH)
    private String email;

    /** Hash BCrypt da senha. A senha pura nunca chega à entidade. */
    @Column(nullable = false)
    private String passwordHash;

    @Column(nullable = false)
    private boolean active;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    protected User() {
    }

    private User(String name, Role role, String email, String passwordHash) {
        this.id = UUID.randomUUID();
        this.name = name;
        this.role = role;
        this.email = email;
        this.passwordHash = passwordHash;
        this.active = true;
    }

    /** Recebe a senha já transformada em hash pelo service (PasswordEncoder). */
    public static User createUser(String name, Role role, String email, String passwordHash) {
        return new User(validName(name), validRole(role), validEmail(email), validPasswordHash(passwordHash));
    }

    public static User createAdministrator(String name, String email, String passwordHash) {
        return createUser(name, Role.ADMIN, email, passwordHash);
    }

    /**
     * Quem pode mudar o perfil (só ADMIN) é decidido na segurança do endpoint, não
     * aqui.
     */
    public void changeRole(Role newRole) {
        this.role = validRole(newRole);
    }

    /**
     * Impede o login sem apagar o usuário, que continua aparecendo no histórico.
     */
    public void deactivate() {
        if (!active) {
            throw new ConflictException("Este usuário já está desativado.");
        }
        this.active = false;
    }

    public void reactivate() {
        if (active) {
            throw new ConflictException("Este usuário já está ativo.");
        }
        this.active = true;
    }

    public void changePasswordHash(String newHash) {

        validPasswordHash(newHash);

        this.passwordHash = newHash;
    }

    @PrePersist
    void onCreate() {
        this.createdAt = Instant.now();
    }

    private static String validName(String name) {
        String value = name == null ? "" : name.strip();
        if (value.isEmpty()) {
            throw new IllegalArgumentException("Informe o nome.");
        }
        if (value.length() > NAME_MAX_LENGTH) {
            throw new IllegalArgumentException("O nome deve ter no máximo " + NAME_MAX_LENGTH + " caracteres.");
        }
        return value;
    }

    private static Role validRole(Role role) {
        if (role == null) {
            throw new IllegalArgumentException("Informe o perfil.");
        }
        return role;
    }

    /** O e-mail é o login: guardado sempre sem espaços e em minúsculas. */
    private static String validEmail(String email) {
        String value = email == null ? "" : email.strip().toLowerCase(Locale.ROOT);
        if (value.isEmpty()) {
            throw new IllegalArgumentException("Informe o e-mail.");
        }
        if (value.length() > EMAIL_MAX_LENGTH) {
            throw new IllegalArgumentException("O e-mail deve ter no máximo " + EMAIL_MAX_LENGTH + " caracteres.");
        }
        return value;
    }

    private static String validPasswordHash(String passwordHash) {
        if (passwordHash == null || passwordHash.isBlank()) {
            throw new IllegalArgumentException("Informe a senha.");
        }
        return passwordHash;
    }

    @Override
    public boolean equals(Object other) {
        return this == other || (other instanceof User user && id.equals(user.id));
    }

    @Override
    public int hashCode() {
        return id.hashCode();
    }
}
