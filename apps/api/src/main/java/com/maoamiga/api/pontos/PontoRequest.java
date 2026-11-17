package com.maoamiga.api.pontos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

record PontoRequest(
        @NotBlank @Size(max = 120) String nome,
        @NotBlank @Size(max = 200) String endereco,
        @NotBlank @Size(max = 80) String bairro,
        @NotBlank @Size(max = 80) String cidade,
        @NotBlank @Size(max = 120) String diasHorarios,
        @Size(max = 300) String recebe,
        @Size(max = 300) String distribui) {

    DadosPonto paraDados() {
        return new DadosPonto(nome.trim(), endereco.trim(), bairro.trim(), cidade.trim(),
                diasHorarios.trim(), recebe, distribui);
    }
}
