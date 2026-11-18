package com.maoamiga.api.doacoes;

import com.jayway.jsonpath.JsonPath;
import com.maoamiga.api.ApiTest;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class FluxoDeDoacaoIntegrationTest extends ApiTest {

    @Test
    void listaPontosSemBuscaESemToken() throws Exception {
        String responsavel = cadastrar("Vera", emailUnico("vera"), "RESPONSAVEL");
        criarPonto(responsavel, "Ponto Lista Geral", "Roupas");

        mockMvc.perform(get("/api/v1/pontos"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElementos").isNumber())
                .andExpect(jsonPath("$.conteudo").isNotEmpty());

        mockMvc.perform(get("/api/v1/pontos").param("busca", "   "))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.conteudo").isNotEmpty());
    }

    @Test
    void doadorRegistraEResponsavelConfirmaORecebimento() throws Exception {
        String responsavel = cadastrar("Carla", emailUnico("carla"), "RESPONSAVEL");
        String pontoId = criarPonto(responsavel, "Ponto Teste Bueno", "Alimentos não perecíveis");

        mockMvc.perform(get("/api/v1/pontos").param("busca", "teste bueno"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.conteudo[?(@.id == '%s')]".formatted(pontoId)).exists());

        String doador = cadastrar("Pedro", emailUnico("pedro"), "DOADOR");
        String doacaoId = registrarDoacao(doador, pontoId);

        mockMvc.perform(comToken(get("/api/v1/doacoes/minhas"), doador))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.conteudo[0].id").value(doacaoId))
                .andExpect(jsonPath("$.conteudo[0].pontoNome").value("Ponto Teste Bueno"));

        mockMvc.perform(comToken(post("/api/v1/doacoes/{id}/confirmar-recebimento", doacaoId), doador))
                .andExpect(status().isForbidden());

        mockMvc.perform(comToken(get("/api/v1/pontos/{id}/doacoes", pontoId), responsavel))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElementos").value(1));

        mockMvc.perform(comToken(post("/api/v1/doacoes/{id}/confirmar-recebimento", doacaoId), responsavel))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("RECEBIDA"));

        mockMvc.perform(comToken(post("/api/v1/doacoes/{id}/cancelar", doacaoId), doador))
                .andExpect(status().is(422));
    }

    @Test
    void doadorCancelaUmaDoacaoAindaNaoRecebida() throws Exception {
        String responsavel = cadastrar("Lucas", emailUnico("lucas"), "RESPONSAVEL");
        String pontoId = criarPonto(responsavel, "Ponto Cancelamento", "Roupas");
        String doador = cadastrar("Bia", emailUnico("bia"), "DOADOR");
        String doacaoId = registrarDoacao(doador, pontoId);

        mockMvc.perform(comToken(post("/api/v1/doacoes/{id}/cancelar", doacaoId), doador))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CANCELADA"));
    }

    @Test
    void responsavelNaoVeDoacoesDePontoDeOutraPessoa() throws Exception {
        String dono = cadastrar("Dono", emailUnico("dono"), "RESPONSAVEL");
        String pontoId = criarPonto(dono, "Ponto do Dono", "Material escolar");
        String outro = cadastrar("Outro", emailUnico("outro"), "RESPONSAVEL");

        mockMvc.perform(comToken(get("/api/v1/pontos/{id}/doacoes", pontoId), outro))
                .andExpect(status().isForbidden());
    }

    @Test
    void naoAceitaDoacaoEmPontoQueSoDistribui() throws Exception {
        String responsavel = cadastrar("Rita", emailUnico("rita"), "RESPONSAVEL");
        String pontoId = criarPonto(responsavel, "Ponto Só Distribui", null);
        String doador = cadastrar("Caio", emailUnico("caio"), "DOADOR");

        mockMvc.perform(comToken(post("/api/v1/doacoes"), doador)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"pontoId": "%s", "tipoItem": "Arroz", "quantidade": 2}
                                """.formatted(pontoId)))
                .andExpect(status().is(422))
                .andExpect(jsonPath("$.detail").value("este ponto não recebe doações"));
    }

    @Test
    void doadorNaoPodeCadastrarPonto() throws Exception {
        String doador = cadastrar("Gil", emailUnico("gil"), "DOADOR");

        mockMvc.perform(comToken(post("/api/v1/pontos"), doador)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpoDoPonto("Ponto Indevido", "Roupas")))
                .andExpect(status().isForbidden());
    }

    private String criarPonto(String token, String nome, String recebe) throws Exception {
        String corpo = mockMvc.perform(comToken(post("/api/v1/pontos"), token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpoDoPonto(nome, recebe)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return JsonPath.read(corpo, "$.id");
    }

    private String registrarDoacao(String token, String pontoId) throws Exception {
        String corpo = mockMvc.perform(comToken(post("/api/v1/doacoes"), token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"pontoId": "%s", "tipoItem": "Feijão 1kg", "quantidade": 5, "observacao": "entrego no sábado"}
                                """.formatted(pontoId)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("REGISTRADA"))
                .andReturn().getResponse().getContentAsString();
        return JsonPath.read(corpo, "$.id");
    }

    private static String corpoDoPonto(String nome, String recebe) {
        String campoRecebe = recebe == null ? "null" : "\"" + recebe + "\"";
        return """
                {
                  "nome": "%s",
                  "endereco": "Rua T-30, Qd. 15",
                  "bairro": "Setor Bueno",
                  "cidade": "Goiânia",
                  "diasHorarios": "Segunda a sexta, 8h às 12h",
                  "recebe": %s,
                  "distribui": "Cestas básicas às quartas"
                }
                """.formatted(nome, campoRecebe);
    }
}
