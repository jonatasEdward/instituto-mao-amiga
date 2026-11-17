package com.maoamiga.api.shared.seguranca;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.nio.charset.StandardCharsets;
import java.time.Duration;

@ConfigurationProperties("app.jwt")
public record JwtProperties(String secret, Duration expiracao) {

    private static final int TAMANHO_MINIMO_SEGREDO = 32;

    public JwtProperties {
        if (secret == null || secret.getBytes(StandardCharsets.UTF_8).length < TAMANHO_MINIMO_SEGREDO) {
            throw new IllegalStateException("app.jwt.secret precisa ter pelo menos 32 bytes");
        }
        if (expiracao == null || expiracao.isNegative() || expiracao.isZero()) {
            throw new IllegalStateException("app.jwt.expiracao precisa ser positiva");
        }
    }
}
