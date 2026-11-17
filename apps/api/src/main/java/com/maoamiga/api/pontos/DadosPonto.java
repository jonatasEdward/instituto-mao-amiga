package com.maoamiga.api.pontos;

record DadosPonto(String nome, String endereco, String bairro, String cidade,
                  String diasHorarios, String recebe, String distribui) {

    DadosPonto {
        recebe = vazioComoNulo(recebe);
        distribui = vazioComoNulo(distribui);
    }

    private static String vazioComoNulo(String valor) {
        return valor == null || valor.isBlank() ? null : valor.trim();
    }
}
