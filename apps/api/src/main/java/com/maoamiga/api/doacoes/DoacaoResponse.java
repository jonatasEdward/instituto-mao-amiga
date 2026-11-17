package com.maoamiga.api.doacoes;

import com.maoamiga.api.pontos.Ponto;

import java.time.Instant;
import java.util.UUID;

record DoacaoResponse(UUID id, UUID pontoId, String pontoNome, String tipoItem, int quantidade,
                      String observacao, StatusDoacao status, Instant criadaEm, Instant atualizadaEm) {

    static DoacaoResponse de(Doacao doacao, Ponto ponto) {
        return new DoacaoResponse(doacao.getId(), doacao.getPontoId(), ponto == null ? null : ponto.getNome(),
                doacao.getTipoItem(), doacao.getQuantidade(), doacao.getObservacao(), doacao.getStatus(),
                doacao.getCriadaEm(), doacao.getAtualizadaEm());
    }
}
