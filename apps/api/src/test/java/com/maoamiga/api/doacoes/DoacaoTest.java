package com.maoamiga.api.doacoes;

import com.maoamiga.api.shared.erro.RegraDeNegocioException;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class DoacaoTest {

    private static final Instant CRIADA = Instant.parse("2026-03-01T10:00:00Z");
    private static final Instant DEPOIS = Instant.parse("2026-03-02T15:30:00Z");

    @Test
    void nasceRegistradaComObservacaoVaziaComoNula() {
        Doacao doacao = novaDoacao(3, "   ");

        assertThat(doacao.getStatus()).isEqualTo(StatusDoacao.REGISTRADA);
        assertThat(doacao.getObservacao()).isNull();
        assertThat(doacao.getAtualizadaEm()).isEqualTo(CRIADA);
    }

    @Test
    void recusaQuantidadeZeroOuNegativa() {
        assertThatThrownBy(() -> novaDoacao(0, null))
                .isInstanceOf(RegraDeNegocioException.class);
    }

    @Test
    void confirmaRecebimentoDeDoacaoRegistrada() {
        Doacao doacao = novaDoacao(1, null);

        doacao.confirmarRecebimento(DEPOIS);

        assertThat(doacao.getStatus()).isEqualTo(StatusDoacao.RECEBIDA);
        assertThat(doacao.getAtualizadaEm()).isEqualTo(DEPOIS);
    }

    @Test
    void naoCancelaDoacaoJaRecebida() {
        Doacao doacao = novaDoacao(1, null);
        doacao.confirmarRecebimento(DEPOIS);

        assertThatThrownBy(() -> doacao.cancelar(DEPOIS))
                .isInstanceOf(RegraDeNegocioException.class)
                .hasMessageContaining("RECEBIDA");
    }

    @Test
    void naoConfirmaDoacaoCancelada() {
        Doacao doacao = novaDoacao(1, null);
        doacao.cancelar(DEPOIS);

        assertThatThrownBy(() -> doacao.confirmarRecebimento(DEPOIS))
                .isInstanceOf(RegraDeNegocioException.class);
    }

    private static Doacao novaDoacao(int quantidade, String observacao) {
        return new Doacao(UUID.randomUUID(), UUID.randomUUID(), "Arroz 5kg", quantidade, observacao, CRIADA);
    }
}
