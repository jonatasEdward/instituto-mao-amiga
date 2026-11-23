package com.maoamiga.api.eventos;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.time.Duration;

@ConfigurationProperties("app.eventos")
public record EventosProperties(boolean publicarNoKafka, String topicoDoacoes, Duration intervalo,
                                int tamanhoDoLote, Duration reterPublicadosPor) {
}
