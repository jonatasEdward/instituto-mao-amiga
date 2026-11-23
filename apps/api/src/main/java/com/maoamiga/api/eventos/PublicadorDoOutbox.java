package com.maoamiga.api.eventos;

import io.opentelemetry.context.Scope;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.util.List;
import java.util.concurrent.TimeUnit;

/**
 * Lê o outbox e envia ao Kafka. A entrega é "pelo menos uma vez": se o envio der certo e o commit
 * falhar, o evento sai de novo na próxima rodada, e o consumidor descarta a repetição pelo eventId.
 */
@Component
class PublicadorDoOutbox {

    private static final Logger log = LoggerFactory.getLogger(PublicadorDoOutbox.class);
    private static final long TEMPO_MAXIMO_DE_ENVIO_SEGUNDOS = 10;

    private final EventoPendenteRepository repository;
    private final KafkaTemplate<String, String> kafka;
    private final EventosProperties propriedades;
    private final Clock clock;

    PublicadorDoOutbox(EventoPendenteRepository repository, KafkaTemplate<String, String> kafka,
                       EventosProperties propriedades, Clock clock) {
        this.repository = repository;
        this.kafka = kafka;
        this.propriedades = propriedades;
        this.clock = clock;
    }

    @Transactional
    int publicarLote() {
        List<EventoPendente> pendentes = repository.travarPendentes(propriedades.tamanhoDoLote());
        int publicados = 0;
        for (EventoPendente evento : pendentes) {
            try (Scope ignorado = ContextoDeTrace.restaurar(evento.getTraceparent())) {
                // Com o contexto da requisição original ativo, o envio vira um span filho dela e o
                // traceparent segue nos headers da mensagem até o consumidor.
                kafka.send(evento.getTopico(), evento.getChave(), evento.getPayload())
                        .get(TEMPO_MAXIMO_DE_ENVIO_SEGUNDOS, TimeUnit.SECONDS);
                evento.marcarPublicado(clock.instant());
                publicados++;
            } catch (Exception ex) {
                if (ex instanceof InterruptedException) {
                    Thread.currentThread().interrupt();
                }
                evento.registrarFalha(ex.getMessage());
                log.warn("não foi possível publicar o evento {}; tenta de novo na próxima rodada", evento.getId(), ex);
                // Para no primeiro erro: publicar os seguintes quebraria a ordem dos eventos de uma mesma doação.
                break;
            }
        }
        return publicados;
    }

    @Transactional
    int apagarPublicadosAntigos() {
        return repository.apagarPublicadosAntesDe(clock.instant().minus(propriedades.reterPublicadosPor()));
    }
}
