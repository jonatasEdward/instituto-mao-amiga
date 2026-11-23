package com.maoamiga.api.eventos;

import io.opentelemetry.api.trace.Span;
import io.opentelemetry.api.trace.propagation.W3CTraceContextPropagator;
import io.opentelemetry.context.Context;
import io.opentelemetry.context.Scope;
import io.opentelemetry.context.propagation.TextMapGetter;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * O outbox separa a requisição HTTP do envio ao Kafka: quem publica é outra thread, mais tarde.
 * Guardar o traceparent junto do evento e restaurá-lo na hora de publicar mantém tudo num trace só,
 * da requisição que registrou a doação até o consumidor do outro serviço.
 * Sem o agente do OpenTelemetry, não há span ativo e as duas operações viram no-op.
 */
final class ContextoDeTrace {

    private static final W3CTraceContextPropagator W3C = W3CTraceContextPropagator.getInstance();

    private static final TextMapGetter<Map<String, String>> LEITOR = new TextMapGetter<>() {
        @Override
        public Iterable<String> keys(Map<String, String> portador) {
            return List.copyOf(portador.keySet());
        }

        @Override
        public String get(Map<String, String> portador, String chave) {
            return portador == null ? null : portador.get(chave);
        }
    };

    private ContextoDeTrace() {
    }

    static String capturar() {
        return capturar(Context.current());
    }

    static String capturar(Context contexto) {
        if (!Span.fromContext(contexto).getSpanContext().isValid()) {
            return null;
        }
        Map<String, String> portador = new HashMap<>();
        W3C.inject(contexto, portador, Map::put);
        return portador.get("traceparent");
    }

    static Scope restaurar(String traceparent) {
        if (traceparent == null || traceparent.isBlank()) {
            return Scope.noop();
        }
        return W3C.extract(Context.current(), Map.of("traceparent", traceparent), LEITOR).makeCurrent();
    }
}
