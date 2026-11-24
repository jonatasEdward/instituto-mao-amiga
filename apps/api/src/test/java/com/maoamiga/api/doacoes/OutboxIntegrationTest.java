package com.maoamiga.api.doacoes;

import com.jayway.jsonpath.JsonPath;
import com.maoamiga.api.ApiTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Sem Kafka neste contexto: o teste olha só o que fica gravado no outbox. */
class OutboxIntegrationTest extends ApiTest {

    @Autowired
    private JdbcTemplate jdbc;

    @Test
    void registrarEConfirmarGravamEventosNaMesmaTransacaoDaDoacao() throws Exception {
        String responsavel = cadastrar("Lia", emailUnico("lia"), "RESPONSAVEL");
        String pontoId = criarPonto(responsavel, "Recebe");
        String doador = cadastrar("Rui", emailUnico("rui"), "DOADOR");

        String doacaoId = JsonPath.read(mockMvc.perform(comToken(post("/api/v1/doacoes"), doador)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"pontoId\": \"%s\", \"tipoItem\": \"Arroz 5kg\", \"quantidade\": 2}".formatted(pontoId)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString(), "$.id");

        mockMvc.perform(comToken(post("/api/v1/doacoes/{id}/confirmar-recebimento", doacaoId), responsavel))
                .andExpect(status().isOk());

        List<Map<String, Object>> eventos = jdbc.queryForList(
                "select topico, chave, tipo, payload from outbox_eventos where chave = ? order by criado_em", doacaoId);

        assertThat(eventos).extracting(e -> e.get("tipo")).containsExactly("DonationRegistered", "DonationReceived");
        assertThat(eventos).allSatisfy(e -> assertThat(e.get("topico")).isEqualTo("maoamiga.donations.v1"));

        String payload = (String) eventos.getFirst().get("payload");
        assertThat((String) JsonPath.read(payload, "$.donation.id")).isEqualTo(doacaoId);
        assertThat((String) JsonPath.read(payload, "$.donation.pointId")).isEqualTo(pontoId);
        assertThat((String) JsonPath.read(payload, "$.donation.item")).isEqualTo("Arroz 5kg");
        assertThat((Integer) JsonPath.read(payload, "$.donation.quantity")).isEqualTo(2);
        assertThat((String) JsonPath.read(payload, "$.eventId")).isNotBlank();
        assertThat((String) JsonPath.read(payload, "$.occurredAt")).contains("T");
    }

    @Test
    void doacaoRecusadaNaoDeixaEventoNoOutbox() throws Exception {
        String responsavel = cadastrar("Ivo", emailUnico("ivo"), "RESPONSAVEL");
        String pontoId = criarPonto(responsavel, null);
        String doador = cadastrar("Edu", emailUnico("edu"), "DOADOR");

        mockMvc.perform(comToken(post("/api/v1/doacoes"), doador)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"pontoId\": \"%s\", \"tipoItem\": \"Arroz\", \"quantidade\": 1}".formatted(pontoId)))
                .andExpect(status().is(422));

        Integer eventosDoPonto = jdbc.queryForObject(
                "select count(*) from outbox_eventos where payload like ?", Integer.class, "%" + pontoId + "%");
        assertThat(eventosDoPonto).isZero();
    }

    private String criarPonto(String token, String recebe) throws Exception {
        String campoRecebe = recebe == null ? "null" : "\"" + recebe + "\"";
        String corpo = mockMvc.perform(comToken(post("/api/v1/pontos"), token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"nome": "Ponto Outbox", "endereco": "Rua 1", "bairro": "Centro", "cidade": "Goiânia",
                                 "diasHorarios": "Sábados", "recebe": %s, "distribui": "Cestas"}
                                """.formatted(campoRecebe)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return JsonPath.read(corpo, "$.id");
    }
}
