package com.maoamiga.api.eventos;

import io.opentelemetry.api.trace.Span;
import io.opentelemetry.api.trace.SpanContext;
import io.opentelemetry.api.trace.TraceFlags;
import io.opentelemetry.api.trace.TraceState;
import io.opentelemetry.context.Context;
import io.opentelemetry.context.Scope;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class ContextoDeTraceTest {

    private static final String TRACE_ID = "4bf92f3577b34da6a3ce929d0e0e4736";
    private static final String SPAN_ID = "00f067aa0ba902b7";

    @Test
    void semSpanAtivoNaoGuardaNada() {
        assertThat(ContextoDeTrace.capturar(Context.root())).isNull();
    }

    @Test
    void guardaOTraceparentDoSpanAtivo() {
        Context contexto = Context.root().with(Span.wrap(
                SpanContext.create(TRACE_ID, SPAN_ID, TraceFlags.getSampled(), TraceState.getDefault())));

        assertThat(ContextoDeTrace.capturar(contexto)).isEqualTo("00-" + TRACE_ID + "-" + SPAN_ID + "-01");
    }

    @Test
    void restauraOContextoNaHoraDePublicar() {
        try (Scope ignorado = ContextoDeTrace.restaurar("00-" + TRACE_ID + "-" + SPAN_ID + "-01")) {
            SpanContext ativo = Span.current().getSpanContext();
            assertThat(ativo.getTraceId()).isEqualTo(TRACE_ID);
            assertThat(ativo.getSpanId()).isEqualTo(SPAN_ID);
            assertThat(ativo.isRemote()).isTrue();
        }
        assertThat(Span.current().getSpanContext().isValid()).isFalse();
    }

    @Test
    void eventoSemTraceparentPublicaSemContexto() {
        try (Scope ignorado = ContextoDeTrace.restaurar(null)) {
            assertThat(Span.current().getSpanContext().isValid()).isFalse();
        }
    }
}
