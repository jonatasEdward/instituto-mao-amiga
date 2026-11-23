package com.maoamiga.api.doacoes;

import com.maoamiga.api.pontos.Ponto;

import java.time.Instant;
import java.util.UUID;

/**
 * Contrato público do tópico maoamiga.donations.v1. Os nomes ficam em inglês de propósito: o
 * contrato é compartilhado com outros serviços (o notification-service, por exemplo), e mudar um
 * campo aqui é uma mudança de API. Mudança incompatível vira um tópico novo, ".v2".
 */
record EventoDeDoacaoV1(UUID eventId, String eventType, Instant occurredAt, Donation donation) {

    static final String REGISTRADA = "DonationRegistered";
    static final String RECEBIDA = "DonationReceived";
    static final String CANCELADA = "DonationCancelled";

    record Donation(UUID id, String item, int quantity, UUID pointId, String pointName,
                    UUID donorId, UUID responsibleId) {
    }

    static EventoDeDoacaoV1 de(String tipo, Doacao doacao, Ponto ponto, Instant agora) {
        return new EventoDeDoacaoV1(UUID.randomUUID(), tipo, agora, new Donation(
                doacao.getId(), doacao.getTipoItem(), doacao.getQuantidade(), ponto.getId(), ponto.getNome(),
                doacao.getDoadorId(), ponto.getResponsavelId()));
    }
}
