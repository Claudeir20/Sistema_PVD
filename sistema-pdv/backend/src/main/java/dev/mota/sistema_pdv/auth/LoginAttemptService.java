package dev.mota.sistema_pdv.auth;

import org.springframework.stereotype.Service;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import dev.mota.sistema_pdv.auth.exception.TooManyLoginAttemptsException;

/**
 * Conta os erros de login por e-mail e por IP. Passou do limite dentro da janela,
 * bloqueia por um tempo. Fica em memória: basta para um servidor só (zera ao reiniciar).
 */

@Service
class LoginAttemptService {

    static final int MAX_FAILURES_PER_EMAIL = 5;
    static final int MAX_FAILURES_PER_IP = 20; // a loja inteira sai pelo mesmo IP
    static final Duration WINDOW = Duration.ofMinutes(15);
    static final Duration LOCK = Duration.ofMinutes(15);

    private record Attempts(int failures,
            Instant windowStart, Instant lockedUntil) {
    }

    private final Map<String, Attempts> byEmail = new ConcurrentHashMap<>();
    private final Map<String, Attempts> byIp = new ConcurrentHashMap<>();
    private final Clock clock;

    public LoginAttemptService() {
        this(Clock.systemUTC());
    }

    LoginAttemptService(Clock clock) {
        this.clock = clock;
    }

    public void checkAllowed(String email, String ip) {
        Instant now = clock.instant();
        long waitSeconds = Math.max(
                secondsLocked(byEmail.get(normalize(email)), now),
                secondsLocked(byIp.get(ip), now));
        if (waitSeconds > 0) {
            throw new TooManyLoginAttemptsException(waitSeconds);
        }
    }

    public void registerFailure(String email, String ip) {
        Instant now = clock.instant();
        byEmail.compute(normalize(email), (key, current) -> addFailure(current, now, MAX_FAILURES_PER_EMAIL));
        byIp.compute(ip, (key, current) -> addFailure(current, now, MAX_FAILURES_PER_IP));
    }

    public void registerSuccess(String email) {
        byEmail.remove(normalize(email));
    }

    private Attempts addFailure(Attempts current, Instant now, int maxFailures) {
        // Sem registro, ou a janela de 15 minutos já passou: começa a contar de novo.
        if (current == null || current.windowStart().plus(WINDOW).isBefore(now)) {
            current = new Attempts(0, now, null);
        }
        int failures = current.failures() + 1;
        Instant lockedUntil = failures >= maxFailures ? now.plus(LOCK) : current.lockedUntil();
        return new Attempts(failures, current.windowStart(), lockedUntil);
    }

    private static long secondsLocked(Attempts attempts, Instant now) {
        if (attempts == null || attempts.lockedUntil() == null || !attempts.lockedUntil().isAfter(now)) {
            return 0;
        }
        return Duration.between(now, attempts.lockedUntil()).toSeconds();
    }

    private static String normalize(String email) {
        return email == null ? "" : email.strip().toLowerCase(Locale.ROOT);
    }

}
