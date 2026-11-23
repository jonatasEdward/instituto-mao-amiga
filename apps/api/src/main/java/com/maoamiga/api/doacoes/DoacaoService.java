package com.maoamiga.api.doacoes;

import com.maoamiga.api.eventos.Eventos;
import com.maoamiga.api.eventos.EventosProperties;
import com.maoamiga.api.pontos.Ponto;
import com.maoamiga.api.pontos.PontoService;
import com.maoamiga.api.shared.erro.AcessoNegadoException;
import com.maoamiga.api.shared.erro.RecursoNaoEncontradoException;
import com.maoamiga.api.shared.erro.RegraDeNegocioException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.util.Set;
import java.util.UUID;

@Service
class DoacaoService {

    private final DoacaoRepository repository;
    private final PontoService pontoService;
    private final Eventos eventos;
    private final String topico;
    private final Clock clock;

    DoacaoService(DoacaoRepository repository, PontoService pontoService, Eventos eventos,
                  EventosProperties propriedadesDeEventos, Clock clock) {
        this.repository = repository;
        this.pontoService = pontoService;
        this.eventos = eventos;
        this.topico = propriedadesDeEventos.topicoDoacoes();
        this.clock = clock;
    }

    @Transactional
    Doacao registrar(UUID doadorId, UUID pontoId, String tipoItem, int quantidade, String observacao) {
        Ponto ponto = pontoService.buscar(pontoId);
        if (!ponto.aceitaDoacoes()) {
            throw new RegraDeNegocioException("este ponto não recebe doações");
        }
        Doacao doacao = repository.save(new Doacao(doadorId, pontoId, tipoItem, quantidade, observacao, clock.instant()));
        publicar(EventoDeDoacaoV1.REGISTRADA, doacao, ponto);
        return doacao;
    }

    @Transactional(readOnly = true)
    Page<Doacao> doDoador(UUID doadorId, Pageable pageable) {
        return repository.findByDoadorId(doadorId, pageable);
    }

    @Transactional(readOnly = true)
    Page<Doacao> doPonto(UUID pontoId, UUID responsavelId, Pageable pageable) {
        pontoService.exigirResponsavel(pontoId, responsavelId);
        return repository.findByPontoId(pontoId, pageable);
    }

    @Transactional
    Doacao cancelar(UUID doacaoId, UUID doadorId) {
        Doacao doacao = buscar(doacaoId);
        if (!doacao.foiFeitaPor(doadorId)) {
            throw new AcessoNegadoException("apenas quem registrou a doação pode cancelar");
        }
        doacao.cancelar(clock.instant());
        Doacao salva = repository.saveAndFlush(doacao);
        Ponto ponto = pontoService.buscarPorIds(Set.of(salva.getPontoId())).get(salva.getPontoId());
        publicar(EventoDeDoacaoV1.CANCELADA, salva, ponto);
        return salva;
    }

    @Transactional
    Doacao confirmarRecebimento(UUID doacaoId, UUID responsavelId) {
        Doacao doacao = buscar(doacaoId);
        Ponto ponto = pontoService.exigirResponsavel(doacao.getPontoId(), responsavelId);
        doacao.confirmarRecebimento(clock.instant());
        Doacao salva = repository.saveAndFlush(doacao);
        publicar(EventoDeDoacaoV1.RECEBIDA, salva, ponto);
        return salva;
    }

    private void publicar(String tipo, Doacao doacao, Ponto ponto) {
        EventoDeDoacaoV1 evento = EventoDeDoacaoV1.de(tipo, doacao, ponto, clock.instant());
        // Chave = id da doação: todos os eventos de uma doação caem na mesma partição, em ordem.
        eventos.registrar(evento.eventId(), topico, doacao.getId().toString(), tipo, evento);
    }

    private Doacao buscar(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("doação não encontrada"));
    }
}
