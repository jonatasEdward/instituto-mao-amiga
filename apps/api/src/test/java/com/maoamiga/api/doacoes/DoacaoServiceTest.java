package com.maoamiga.api.doacoes;

import com.maoamiga.api.eventos.Eventos;
import com.maoamiga.api.eventos.EventosProperties;
import com.maoamiga.api.pontos.Ponto;
import com.maoamiga.api.pontos.PontoService;
import com.maoamiga.api.shared.erro.AcessoNegadoException;
import com.maoamiga.api.shared.erro.RegraDeNegocioException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

class DoacaoServiceTest {

    private static final Instant AGORA = Instant.parse("2026-03-01T10:00:00Z");

    private final DoacaoRepository repository = mock(DoacaoRepository.class);
    private final PontoService pontoService = mock(PontoService.class);
    private final Eventos eventos = mock(Eventos.class);
    private DoacaoService service;

    @BeforeEach
    void configurar() {
        service = new DoacaoService(repository, pontoService, eventos,
                new EventosProperties(false, "maoamiga.donations.v1", Duration.ofSeconds(1), 50, Duration.ofDays(7)),
                Clock.fixed(AGORA, ZoneOffset.UTC));
        given(repository.save(any(Doacao.class))).willAnswer(chamada -> chamada.getArgument(0));
        given(repository.saveAndFlush(any(Doacao.class))).willAnswer(chamada -> chamada.getArgument(0));
    }

    @Test
    void registraDoacaoComODoadorEOHorarioAtual() {
        UUID doadorId = UUID.randomUUID();
        UUID pontoId = UUID.randomUUID();
        Ponto ponto = pontoQueAceitaDoacoes(true);
        given(pontoService.buscar(pontoId)).willReturn(ponto);

        Doacao doacao = service.registrar(doadorId, pontoId, "Leite", 6, null);

        assertThat(doacao.getDoadorId()).isEqualTo(doadorId);
        assertThat(doacao.getCriadaEm()).isEqualTo(AGORA);
        verify(eventos).registrar(any(UUID.class), eq("maoamiga.donations.v1"), eq(doacao.getId().toString()),
                eq("DonationRegistered"), any(EventoDeDoacaoV1.class));
    }

    @Test
    void recusaPontoQueNaoRecebeDoacoes() {
        UUID pontoId = UUID.randomUUID();
        Ponto ponto = pontoQueAceitaDoacoes(false);
        given(pontoService.buscar(pontoId)).willReturn(ponto);

        assertThatThrownBy(() -> service.registrar(UUID.randomUUID(), pontoId, "Leite", 6, null))
                .isInstanceOf(RegraDeNegocioException.class);
        verify(repository, never()).save(any());
        verify(eventos, never()).registrar(any(), any(), any(), any(), any());
    }

    @Test
    void soQuemRegistrouPodeCancelar() {
        Doacao doacao = new Doacao(UUID.randomUUID(), UUID.randomUUID(), "Leite", 1, null, AGORA);
        given(repository.findById(doacao.getId())).willReturn(Optional.of(doacao));

        assertThatThrownBy(() -> service.cancelar(doacao.getId(), UUID.randomUUID()))
                .isInstanceOf(AcessoNegadoException.class);
        assertThat(doacao.getStatus()).isEqualTo(StatusDoacao.REGISTRADA);
    }

    private static Ponto pontoQueAceitaDoacoes(boolean aceita) {
        Ponto ponto = mock(Ponto.class);
        given(ponto.aceitaDoacoes()).willReturn(aceita);
        return ponto;
    }
}
