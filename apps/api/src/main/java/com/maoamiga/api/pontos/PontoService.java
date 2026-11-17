package com.maoamiga.api.pontos;

import com.maoamiga.api.shared.erro.AcessoNegadoException;
import com.maoamiga.api.shared.erro.RecursoNaoEncontradoException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class PontoService {

    private final PontoRepository repository;
    private final Clock clock;

    PontoService(PontoRepository repository, Clock clock) {
        this.repository = repository;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public Page<Ponto> listar(String busca, Pageable pageable) {
        String termo = busca == null || busca.isBlank() ? null : busca.trim();
        return repository.buscarAtivos(termo, pageable);
    }

    @Transactional(readOnly = true)
    public Ponto buscar(UUID id) {
        return repository.findById(id)
                .filter(Ponto::isAtivo)
                .orElseThrow(() -> new RecursoNaoEncontradoException("ponto não encontrado"));
    }

    @Transactional(readOnly = true)
    public List<Ponto> doResponsavel(UUID responsavelId) {
        return repository.findByResponsavelIdOrderByNome(responsavelId);
    }

    @Transactional(readOnly = true)
    public Map<UUID, Ponto> buscarPorIds(Collection<UUID> ids) {
        if (ids.isEmpty()) {
            return Map.of();
        }
        return repository.findByIdIn(ids).stream()
                .collect(Collectors.toMap(Ponto::getId, Function.identity()));
    }

    @Transactional(readOnly = true)
    public Ponto exigirResponsavel(UUID pontoId, UUID usuarioId) {
        Ponto ponto = repository.findById(pontoId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("ponto não encontrado"));
        if (!ponto.pertenceA(usuarioId)) {
            throw new AcessoNegadoException("apenas o responsável pelo ponto pode fazer isso");
        }
        return ponto;
    }

    @Transactional
    Ponto criar(DadosPonto dados, UUID responsavelId) {
        return repository.save(new Ponto(dados, responsavelId, clock.instant()));
    }

    @Transactional
    Ponto atualizar(UUID id, DadosPonto dados, UUID usuarioId) {
        Ponto ponto = exigirResponsavel(id, usuarioId);
        ponto.atualizar(dados);
        return repository.saveAndFlush(ponto);
    }
}
