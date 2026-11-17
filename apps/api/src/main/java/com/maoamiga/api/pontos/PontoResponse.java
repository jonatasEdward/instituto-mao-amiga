package com.maoamiga.api.pontos;

import java.util.UUID;

record PontoResponse(UUID id, String nome, String endereco, String bairro, String cidade,
                     String diasHorarios, String recebe, String distribui, boolean aceitaDoacoes) {

    static PontoResponse de(Ponto ponto) {
        return new PontoResponse(ponto.getId(), ponto.getNome(), ponto.getEndereco(), ponto.getBairro(),
                ponto.getCidade(), ponto.getDiasHorarios(), ponto.getRecebe(), ponto.getDistribui(),
                ponto.aceitaDoacoes());
    }
}
