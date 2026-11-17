package com.maoamiga.api.pontos;

import com.maoamiga.api.shared.seguranca.UsuarioLogado;
import com.maoamiga.api.shared.web.PaginaResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/pontos")
class PontoController {

    private static final Sort ORDEM_PADRAO = Sort.by("nome");

    private final PontoService service;

    PontoController(PontoService service) {
        this.service = service;
    }

    @GetMapping
    PaginaResponse<PontoResponse> listar(
            @RequestParam(required = false) String busca,
            @RequestParam(defaultValue = "0") @Min(0) int pagina,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int tamanho) {
        return PaginaResponse.de(service.listar(busca, PageRequest.of(pagina, tamanho, ORDEM_PADRAO)), PontoResponse::de);
    }

    @GetMapping("/meus")
    List<PontoResponse> meus(@AuthenticationPrincipal Jwt jwt) {
        return service.doResponsavel(UsuarioLogado.id(jwt)).stream().map(PontoResponse::de).toList();
    }

    @GetMapping("/{id}")
    PontoResponse buscar(@PathVariable UUID id) {
        return PontoResponse.de(service.buscar(id));
    }

    @PostMapping
    ResponseEntity<PontoResponse> criar(@Valid @RequestBody PontoRequest request, @AuthenticationPrincipal Jwt jwt) {
        Ponto ponto = service.criar(request.paraDados(), UsuarioLogado.id(jwt));
        URI local = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(ponto.getId())
                .toUri();
        return ResponseEntity.created(local).body(PontoResponse.de(ponto));
    }

    @PutMapping("/{id}")
    PontoResponse atualizar(@PathVariable UUID id, @Valid @RequestBody PontoRequest request,
                            @AuthenticationPrincipal Jwt jwt) {
        return PontoResponse.de(service.atualizar(id, request.paraDados(), UsuarioLogado.id(jwt)));
    }
}
