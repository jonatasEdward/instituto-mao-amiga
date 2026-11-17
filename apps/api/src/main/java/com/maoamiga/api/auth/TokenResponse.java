package com.maoamiga.api.auth;

import com.maoamiga.api.usuarios.UsuarioResponse;

import java.time.Instant;

record TokenResponse(String token, Instant expiraEm, UsuarioResponse usuario) {
}
