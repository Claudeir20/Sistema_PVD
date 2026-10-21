package dev.mota.sistema_pdv.auth;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import dev.mota.sistema_pdv.user.UserService;
import dev.mota.sistema_pdv.user.dto.UserResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * Login com sessão: depois do login, o navegador guarda o cookie da sessão e o envia sozinho.
 * O logout fica no SecurityConfig (POST /api/auth/logout).
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserService userService;

    /** Guarda "quem está logado" na sessão. Criado aqui, então não é injetado pelo construtor. */
    private final SecurityContextRepository securityContextRepository = new HttpSessionSecurityContextRepository();

    @PostMapping("/login")
    public UserResponse login(@Valid @RequestBody LoginRequest request,
                              HttpServletRequest httpRequest, HttpServletResponse httpResponse) {
        // 1. Conferir: senha errada ou usuário desativado lançam AuthenticationException (vira 401).
        Authentication authentication = authenticationManager.authenticate(
                UsernamePasswordAuthenticationToken.unauthenticated(request.email(), request.password()));

        // 2. Trocar o id da sessão: um id que alguém já conhecia deixa de valer (fixação de sessão).
        httpRequest.getSession(true);
        httpRequest.changeSessionId();

        // 3. Lembrar: salva o usuário na sessão; é isso que o cookie passa a representar.
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(authentication);
        securityContextRepository.saveContext(context, httpRequest, httpResponse);

        // 4. Responder com os dados do usuário (nunca a senha).
        return userService.findByEmail(authentication.getName());
    }

    /** Quem está logado agora. Sem sessão válida, o SecurityConfig responde 401 antes de chegar aqui. */
    @GetMapping("/me")
    public UserResponse me(Authentication authentication) {
        return userService.findByEmail(authentication.getName());
    }
}
