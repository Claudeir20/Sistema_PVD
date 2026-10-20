package dev.mota.sistema_pdv.user;

import jakarta.persistence.*;
import lombok.Getter;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Getter
@Table(name = "users")
public class User {

    @Id
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private Role role;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private boolean isActive;

    @Column(nullable = false)
    private Instant createdAt;

    protected User() {}

    private User(String name, Role role, String email, String password) {
        this.id = UUID.randomUUID();
        this.name = name;
        this.role = role;
        this.email = email;
        this.password = password;
        this.isActive = true;
    }

    public static User createUser(
            String name,
            Role role,
            String email,
            String password
    ){
        if (name == null ||name.isBlank()) {
            throw new IllegalArgumentException("Informe o nome");
        }

        if (role == null){
            throw new IllegalArgumentException("Informe a permissão");
        }
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Informe o email");
        }
        if (password == null || password.isBlank()) {
            throw new IllegalArgumentException("Informe a senha");
        }

        return new User(name, role, email, password);
    }

    public static User  createAdministrator(
            String name,
            String email,
            String passwordHash
    ){
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Informe o nome.");
        }
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Informe o e-mail.");
        }
        if (passwordHash == null || passwordHash.isBlank()) {
            throw new IllegalArgumentException("Informe a senha.");
        }

        return createUser(name, Role.ADMIN, email, passwordHash);


    }

    public void changeRole(Role newRole){
        if (role !=  Role.ADMIN ){
            throw new IllegalArgumentException("Apenas usuários ADMIN tem essa permissão");
        }
        this.role = newRole;

    }

}
