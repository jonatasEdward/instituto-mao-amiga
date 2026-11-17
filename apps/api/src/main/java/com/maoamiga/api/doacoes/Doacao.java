package com.maoamiga.api.doacoes;

import com.maoamiga.api.shared.erro.RegraDeNegocioException;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Version;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "doacoes")
public class Doacao {

    @Id
    private UUID id;

    @Column(name = "doador_id", nullable = false, updatable = false)
    private UUID doadorId;

    @Column(name = "ponto_id", nullable = false, updatable = false)
    private UUID pontoId;

    @Column(name = "tipo_item", nullable = false, length = 120)
    private String tipoItem;

    @Column(nullable = false)
    private int quantidade;

    @Column(length = 300)
    private String observacao;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatusDoacao status;

    @Column(name = "criada_em", nullable = false, updatable = false)
    private Instant criadaEm;

    @Column(name = "atualizada_em", nullable = false)
    private Instant atualizadaEm;

    @Version
    @Column(nullable = false)
    private Long versao;

    protected Doacao() {
    }

    Doacao(UUID doadorId, UUID pontoId, String tipoItem, int quantidade, String observacao, Instant agora) {
        if (quantidade <= 0) {
            throw new RegraDeNegocioException("a quantidade precisa ser maior que zero");
        }
        this.id = UUID.randomUUID();
        this.doadorId = doadorId;
        this.pontoId = pontoId;
        this.tipoItem = tipoItem.trim();
        this.quantidade = quantidade;
        this.observacao = observacao == null || observacao.isBlank() ? null : observacao.trim();
        this.status = StatusDoacao.REGISTRADA;
        this.criadaEm = agora;
        this.atualizadaEm = agora;
    }

    void cancelar(Instant agora) {
        exigirRegistrada("cancelada");
        this.status = StatusDoacao.CANCELADA;
        this.atualizadaEm = agora;
    }

    void confirmarRecebimento(Instant agora) {
        exigirRegistrada("recebida");
        this.status = StatusDoacao.RECEBIDA;
        this.atualizadaEm = agora;
    }

    boolean foiFeitaPor(UUID usuarioId) {
        return doadorId.equals(usuarioId);
    }

    private void exigirRegistrada(String acao) {
        if (status != StatusDoacao.REGISTRADA) {
            throw new RegraDeNegocioException(
                    "só uma doação registrada pode ser " + acao + "; status atual: " + status);
        }
    }

    public UUID getId() {
        return id;
    }

    public UUID getDoadorId() {
        return doadorId;
    }

    public UUID getPontoId() {
        return pontoId;
    }

    public String getTipoItem() {
        return tipoItem;
    }

    public int getQuantidade() {
        return quantidade;
    }

    public String getObservacao() {
        return observacao;
    }

    public StatusDoacao getStatus() {
        return status;
    }

    public Instant getCriadaEm() {
        return criadaEm;
    }

    public Instant getAtualizadaEm() {
        return atualizadaEm;
    }
}
