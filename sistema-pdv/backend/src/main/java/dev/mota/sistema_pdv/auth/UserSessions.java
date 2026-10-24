package dev.mota.sistema_pdv.auth;

import org.springframework.security.core.session.SessionInformation;
import org.springframework.security.core.session.SessionRegistry;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;

/**
 * Encerra as sessões abertas de um usuário: a próxima requisição dele recebe
 * 401.
 */

@Component
@RequiredArgsConstructor
public class UserSessions {

    private final SessionRegistry sessionRegistry;

    public void expireAll(String email) {
        sessionRegistry.getAllPrincipals().stream()
                .filter(principal -> principal instanceof UserDetails user
                        && user.getUsername().equals(email))
                .flatMap(principal -> sessionRegistry.getAllSessions(principal, false).stream())
                .forEach(SessionInformation::expireNow);
    }

}
