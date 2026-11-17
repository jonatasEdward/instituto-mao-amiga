package com.maoamiga.api.auth;

import com.maoamiga.api.usuarios.Usuario;
import com.maoamiga.api.usuarios.UsuarioService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
class AuthController {

    private final UsuarioService usuarioService;
    private final TokenService tokenService;

    AuthController(UsuarioService usuarioService, TokenService tokenService) {
        this.usuarioService = usuarioService;
        this.tokenService = tokenService;
    }

    @PostMapping("/cadastro")
    @ResponseStatus(HttpStatus.CREATED)
    TokenResponse cadastrar(@Valid @RequestBody CadastroRequest request) {
        Usuario usuario = usuarioService.cadastrar(request.nome(), request.email(), request.senha(), request.papel());
        return tokenService.emitir(usuario);
    }

    @PostMapping("/login")
    TokenResponse login(@Valid @RequestBody LoginRequest request) {
        return tokenService.emitir(usuarioService.autenticar(request.email(), request.senha()));
    }
}
