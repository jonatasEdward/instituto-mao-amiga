package com.maoamiga.api.eventos;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.springframework.data.domain.Persistable;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "outbox_eventos")
class EventoPendente implements Persistable<UUID> {

    private static final int TAMANHO_MAXIMO_DO_ERRO = 500;

    @Id
    private UUID id;

    @Column(nullable = false, length = 120, updatable = false)
    private String topico;

    @Column(nullable = false, length = 120, updatable = false)
    private String chave;

    @Column(nullable = false, length = 60, updatable = false)
    private String tipo;

    @Column(nullable = false, updatable = false, columnDefinition = "text")
    private String payload;

    @Column(name = "criado_em", nullable = false, updatable = false)
    private Instant criadoEm;

    @Column(name = "publicado_em")
    private Instant publicadoEm;

    @Column(nullable = false)
    private int tentativas;

    @Column(name = "ultimo_erro", length = TAMANHO_MAXIMO_DO_ERRO)
    private String ultimoErro;

    protected EventoPendente() {
    }

    EventoPendente(UUID id, String topico, String chave, String tipo, String payload, Instant criadoEm) {
        this.id = id;
        this.topico = topico;
        this.chave = chave;
        this.tipo = tipo;
        this.payload = payload;
        this.criadoEm = criadoEm;
    }

    void marcarPublicado(Instant agora) {
        this.publicadoEm = agora;
        this.tentativas++;
        this.ultimoErro = null;
    }

    void registrarFalha(String erro) {
        this.tentativas++;
        this.ultimoErro = erro == null ? null : erro.substring(0, Math.min(erro.length(), TAMANHO_MAXIMO_DO_ERRO));
    }

    @Override
    public UUID getId() {
        return id;
    }

    /** O id nasce na aplicação; sem isso o save() faria um SELECT antes de cada INSERT. */
    @Override
    public boolean isNew() {
        return publicadoEm == null && tentativas == 0;
    }

    String getTopico() {
        return topico;
    }

    String getChave() {
        return chave;
    }

    String getPayload() {
        return payload;
    }
}
