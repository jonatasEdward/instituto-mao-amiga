package com.maoamiga.api.shared.seguranca;

import org.springframework.security.oauth2.jwt.Jwt;

import java.util.UUID;

public final class UsuarioLogado {

    private UsuarioLogado() {
    }

    public static UUID id(Jwt jwt) {
        return UUID.fromString(jwt.getSubject());
    }
}
