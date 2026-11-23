package com.maoamiga.api.auth;

import com.maoamiga.api.ApiTest;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class AuthIntegrationTest extends ApiTest {

    @Test
    void cadastraFazLoginEConsultaOProprioPerfil() throws Exception {
        String email = emailUnico("maria");
        cadastrar("Maria Souza", email, "DOADOR");

        String corpo = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email": "%s", "senha": "senha-forte-123"}
                                """.formatted(email.toUpperCase())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.usuario.papel").value("DOADOR"))
                .andReturn().getResponse().getContentAsString();

        String token = com.jayway.jsonpath.JsonPath.read(corpo, "$.token");

        mockMvc.perform(comToken(get("/api/v1/usuarios/me"), token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nome").value("Maria Souza"))
                .andExpect(jsonPath("$.email").value(email));
    }

    @Test
    void recusaEmailJaCadastradoIgnorandoMaiusculas() throws Exception {
        String email = emailUnico("joao");
        cadastrar("João", email, "DOADOR");

        mockMvc.perform(post("/api/v1/auth/cadastro")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"nome": "Outro João", "email": "%s", "senha": "senha-forte-123", "papel": "DOADOR"}
                                """.formatted(email.toUpperCase())))
                .andExpect(status().isConflict());
    }

    @Test
    void recusaSenhaErradaSemDizerQualCampoFalhou() throws Exception {
        String email = emailUnico("ana");
        cadastrar("Ana", email, "DOADOR");

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email": "%s", "senha": "senha-errada"}
                                """.formatted(email)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.detail").value("e-mail ou senha inválidos"));
    }

    @Test
    void validaOsCamposDoCadastro() throws Exception {
        mockMvc.perform(post("/api/v1/auth/cadastro")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"nome": "", "email": "nao-e-email", "senha": "curta", "papel": "DOADOR"}
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.erros.length()").value(3));
    }

    @Test
    void publicaSomenteAChavePublicaNoJwks() throws Exception {
        mockMvc.perform(get("/.well-known/jwks.json"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.keys[0].kty").value("RSA"))
                .andExpect(jsonPath("$.keys[0].alg").value("RS256"))
                .andExpect(jsonPath("$.keys[0].kid").value("mao-amiga-1"))
                .andExpect(jsonPath("$.keys[0].n").isNotEmpty())
                .andExpect(jsonPath("$.keys[0].d").doesNotExist())
                .andExpect(jsonPath("$.keys[0].p").doesNotExist());
    }

    @Test
    void exigeTokenParaRotasProtegidas() throws Exception {
        mockMvc.perform(get("/api/v1/usuarios/me"))
                .andExpect(status().isUnauthorized());
    }
}
