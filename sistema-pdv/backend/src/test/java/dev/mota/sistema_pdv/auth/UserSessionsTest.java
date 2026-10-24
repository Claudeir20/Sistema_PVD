package dev.mota.sistema_pdv.auth;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.security.core.session.SessionRegistry;
import org.springframework.security.core.session.SessionRegistryImpl;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;

class UserSessionsTest {

    @Test
    void expiresOnlyTheSessionsOfThatUser() {
        SessionRegistry registry = new SessionRegistryImpl();
        registry.registerNewSession("s1", userDetails("caixa@loja.com"));
        registry.registerNewSession("s2", userDetails("caixa@loja.com"));
        registry.registerNewSession("s3", userDetails("admin@loja.com"));

        new UserSessions(registry).expireAll("caixa@loja.com");

        assertThat(registry.getSessionInformation("s1").isExpired()).isTrue();
        assertThat(registry.getSessionInformation("s2").isExpired()).isTrue();
        assertThat(registry.getSessionInformation("s3").isExpired()).isFalse();
    }

    @Test
    void userWithoutSessionsDoesNothing() {
        SessionRegistry registry = new SessionRegistryImpl();
        registry.registerNewSession("s1", userDetails("admin@loja.com"));

        new UserSessions(registry).expireAll("caixa@loja.com");

        assertThat(registry.getSessionInformation("s1").isExpired()).isFalse();
    }

    private static UserDetails userDetails(String email) {
        return User.withUsername(email).password("x").roles("CAIXA").build();
    }
}
