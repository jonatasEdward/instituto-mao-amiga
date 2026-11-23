package com.maoamiga.api.eventos;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;

/**
 * Só existe com app.eventos.publicar-no-kafka=true. Sem Kafka (desenvolvimento, testes que não
 * precisam dele), os eventos continuam sendo gravados no outbox e ficam esperando.
 */
@Configuration
@EnableScheduling
@ConditionalOnProperty(name = "app.eventos.publicar-no-kafka", havingValue = "true")
class AgendamentoDoOutbox {

    private static final Logger log = LoggerFactory.getLogger(AgendamentoDoOutbox.class);

    private final PublicadorDoOutbox publicador;

    AgendamentoDoOutbox(PublicadorDoOutbox publicador) {
        this.publicador = publicador;
    }

    @Scheduled(fixedDelayString = "${app.eventos.intervalo}")
    void publicarPendentes() {
        int publicados;
        do {
            publicados = publicador.publicarLote();
        } while (publicados > 0 && !Thread.currentThread().isInterrupted());
    }

    @Scheduled(fixedDelayString = "PT1H", initialDelayString = "PT1M")
    void limpar() {
        int apagados = publicador.apagarPublicadosAntigos();
        if (apagados > 0) {
            log.info("{} eventos já publicados foram removidos do outbox", apagados);
        }
    }
}
