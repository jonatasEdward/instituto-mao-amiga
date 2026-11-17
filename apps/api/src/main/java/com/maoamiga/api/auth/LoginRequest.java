package com.maoamiga.api.auth;

import jakarta.validation.constraints.NotBlank;

record LoginRequest(@NotBlank String email, @NotBlank String senha) {
}
