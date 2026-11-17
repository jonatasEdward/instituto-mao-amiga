package com.maoamiga.api.doacoes;

import com.maoamiga.api.pontos.Ponto;
import com.maoamiga.api.pontos.PontoService;
import com.maoamiga.api.shared.seguranca.UsuarioLogado;
import com.maoamiga.api.shared.web.PaginaResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
class DoacaoController {

    private static final Sort MAIS_RECENTES = Sort.by(Sort.Direction.DESC, "criadaEm");

    private final DoacaoService service;
    private final PontoService pontoService;

    DoacaoController(DoacaoService service, PontoService pontoService) {
        this.service = service;
        this.pontoService = pontoService;
    }

    @PostMapping("/api/v1/doacoes")
    @ResponseStatus(HttpStatus.CREATED)
    DoacaoResponse registrar(@Valid @RequestBody DoacaoRequest request, @AuthenticationPrincipal Jwt jwt) {
        Doacao doacao = service.registrar(UsuarioLogado.id(jwt), request.pontoId(), request.tipoItem(),
                request.quantidade(), request.observacao());
        return DoacaoResponse.de(doacao, pontoService.buscar(doacao.getPontoId()));
    }

    @GetMapping("/api/v1/doacoes/minhas")
    PaginaResponse<DoacaoResponse> minhas(
            @RequestParam(defaultValue = "0") @Min(0) int pagina,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int tamanho,
            @AuthenticationPrincipal Jwt jwt) {
        return comNomesDosPontos(service.doDoador(UsuarioLogado.id(jwt), pagina(pagina, tamanho)));
    }

    @PostMapping("/api/v1/doacoes/{id}/cancelar")
    DoacaoResponse cancelar(@PathVariable UUID id, @AuthenticationPrincipal Jwt jwt) {
        Doacao doacao = service.cancelar(id, UsuarioLogado.id(jwt));
        return DoacaoResponse.de(doacao, pontoService.buscarPorIds(Set.of(doacao.getPontoId())).get(doacao.getPontoId()));
    }

    @GetMapping("/api/v1/pontos/{pontoId}/doacoes")
    PaginaResponse<DoacaoResponse> doPonto(
            @PathVariable UUID pontoId,
            @RequestParam(defaultValue = "0") @Min(0) int pagina,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int tamanho,
            @AuthenticationPrincipal Jwt jwt) {
        return comNomesDosPontos(service.doPonto(pontoId, UsuarioLogado.id(jwt), pagina(pagina, tamanho)));
    }

    @PostMapping("/api/v1/doacoes/{id}/confirmar-recebimento")
    DoacaoResponse confirmarRecebimento(@PathVariable UUID id, @AuthenticationPrincipal Jwt jwt) {
        Doacao doacao = service.confirmarRecebimento(id, UsuarioLogado.id(jwt));
        return DoacaoResponse.de(doacao, pontoService.buscarPorIds(Set.of(doacao.getPontoId())).get(doacao.getPontoId()));
    }

    private PaginaResponse<DoacaoResponse> comNomesDosPontos(Page<Doacao> doacoes) {
        Set<UUID> ids = doacoes.getContent().stream().map(Doacao::getPontoId).collect(Collectors.toSet());
        Map<UUID, Ponto> pontos = pontoService.buscarPorIds(ids);
        return PaginaResponse.de(doacoes, doacao -> DoacaoResponse.de(doacao, pontos.get(doacao.getPontoId())));
    }

    private static Pageable pagina(int pagina, int tamanho) {
        return PageRequest.of(pagina, tamanho, MAIS_RECENTES);
    }
}
