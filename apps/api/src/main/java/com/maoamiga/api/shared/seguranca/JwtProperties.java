package com.maoamiga.api.shared.seguranca;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.time.Duration;

/**
 * @param chavePrivada         chave RSA em PEM (PKCS#8). Em produção vem de JWT_PRIVATE_KEY.
 * @param idDaChave            "kid" publicado no JWKS; trocar quando a chave for rotacionada.
 * @param gerarChaveTemporaria sem chave configurada, gera uma em memória (só para desenvolvimento e testes).
 */
@ConfigurationProperties("app.jwt")
public record JwtProperties(String chavePrivada, String idDaChave, boolean gerarChaveTemporaria, Duration expiracao) {

    public JwtProperties {
        boolean semChave = chavePrivada == null || chavePrivada.isBlank();
        if (semChave && !gerarChaveTemporaria) {
            throw new IllegalStateException("app.jwt.chave-privada é obrigatória (JWT_PRIVATE_KEY)");
        }
        if (idDaChave == null || idDaChave.isBlank()) {
            throw new IllegalStateException("app.jwt.id-da-chave é obrigatório");
        }
        if (expiracao == null || expiracao.isNegative() || expiracao.isZero()) {
            throw new IllegalStateException("app.jwt.expiracao precisa ser positiva");
        }
    }

    boolean temChaveConfigurada() {
        return chavePrivada != null && !chavePrivada.isBlank();
    }
}
