package com.maoamiga.api.usuarios;

import java.util.UUID;

public record UsuarioResponse(UUID id, String nome, String email, Papel papel) {

    public static UsuarioResponse de(Usuario usuario) {
        return new UsuarioResponse(usuario.getId(), usuario.getNome(), usuario.getEmail(), usuario.getPapel());
    }
}
