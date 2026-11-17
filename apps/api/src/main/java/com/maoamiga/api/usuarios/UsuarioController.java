package com.maoamiga.api.usuarios;

import com.maoamiga.api.shared.seguranca.UsuarioLogado;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/usuarios")
class UsuarioController {

    private final UsuarioService service;

    UsuarioController(UsuarioService service) {
        this.service = service;
    }

    @GetMapping("/me")
    UsuarioResponse eu(@AuthenticationPrincipal Jwt jwt) {
        return UsuarioResponse.de(service.buscar(UsuarioLogado.id(jwt)));
    }
}
