package com.maoamiga.api.eventos;

import com.jayway.jsonpath.JsonPath;
import com.maoamiga.api.TestcontainersConfig;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.support.TransactionTemplate;
import org.testcontainers.kafka.KafkaContainer;

import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicReference;

import static org.assertj.core.api.Assertions.assertThat;
import static org.awaitility.Awaitility.await;

@SpringBootTest(properties = {"app.eventos.publicar-no-kafka=true", "app.eventos.intervalo=PT0.2S"})
@Import({TestcontainersConfig.class, PublicacaoNoKafkaIntegrationTest.ComKafka.class})
class PublicacaoNoKafkaIntegrationTest {

    @TestConfiguration(proxyBeanMethods = false)
    static class ComKafka {

        @Bean
        @ServiceConnection
        KafkaContainer kafka() {
            // O Kafka 3.9+ recusa o listener 0.0.0.0 que este container anuncia.
            return new KafkaContainer("apache/kafka:3.8.1");
        }
    }

    @Autowired
    private Eventos eventos;

    @Autowired
    private TransactionTemplate transacao;

    @Autowired
    private JdbcTemplate jdbc;

    @Autowired
    private KafkaContainer kafka;

    @Test
    void eventoGravadoNoOutboxChegaAoTopicoComAChaveCertaEFicaMarcadoComoPublicado() {
        UUID idDoEvento = UUID.randomUUID();
        String chave = UUID.randomUUID().toString();

        transacao.executeWithoutResult(status -> eventos.registrar(idDoEvento, "maoamiga.donations.v1", chave,
                "DonationRegistered", Map.of("eventId", idDoEvento.toString(), "eventType", "DonationRegistered")));

        AtomicReference<ConsumerRecord<String, String>> recebido = new AtomicReference<>();
        try (KafkaConsumer<String, String> consumidor = new KafkaConsumer<>(Map.of(
                ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, kafka.getBootstrapServers(),
                ConsumerConfig.GROUP_ID_CONFIG, "teste-" + UUID.randomUUID(),
                ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest",
                ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class,
                ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class))) {
            consumidor.subscribe(List.of("maoamiga.donations.v1"));
            await().atMost(Duration.ofSeconds(30)).until(() -> {
                for (ConsumerRecord<String, String> registro : consumidor.poll(Duration.ofMillis(500))) {
                    if (chave.equals(registro.key())) {
                        recebido.set(registro);
                        return true;
                    }
                }
                return false;
            });
        }

        assertThat((String) JsonPath.read(recebido.get().value(), "$.eventId")).isEqualTo(idDoEvento.toString());
        await().atMost(Duration.ofSeconds(10)).until(() -> jdbc.queryForObject(
                "select publicado_em is not null from outbox_eventos where id = ?", Boolean.class, idDoEvento));
    }
}
