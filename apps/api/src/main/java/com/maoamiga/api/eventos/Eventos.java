package com.maoamiga.api.eventos;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.json.JsonMapper;

import java.time.Clock;
import java.util.UUID;

/**
 * Porta de entrada do outbox. O evento é gravado na mesma transação da mudança que o originou:
 * se a doação não for salva, o evento também não existe, e se for salva, o evento não se perde
 * mesmo que o Kafka esteja fora do ar.
 */
@Service
public class Eventos {

    private static final JsonMapper JSON = JsonMapper.builder().build();

    private final EventoPendenteRepository repository;
    private final Clock clock;

    Eventos(EventoPendenteRepository repository, Clock clock) {
        this.repository = repository;
        this.clock = clock;
    }

    /** MANDATORY: chamar fora de uma transação é bug, e falhar alto é melhor que perder a garantia. */
    @Transactional(propagation = Propagation.MANDATORY)
    public void registrar(UUID idDoEvento, String topico, String chave, String tipo, Object payload) {
        repository.save(new EventoPendente(idDoEvento, topico, chave, tipo, JSON.writeValueAsString(payload),
                clock.instant(), ContextoDeTrace.capturar()));
    }
}
