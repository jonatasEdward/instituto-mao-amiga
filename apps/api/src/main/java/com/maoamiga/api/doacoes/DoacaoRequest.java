package com.maoamiga.api.doacoes;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

record DoacaoRequest(
        @NotNull UUID pontoId,
        @NotBlank @Size(max = 120) String tipoItem,
        @NotNull @Min(1) @Max(10_000) Integer quantidade,
        @Size(max = 300) String observacao) {
}
