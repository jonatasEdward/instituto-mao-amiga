package com.maoamiga.api.pontos;

import com.maoamiga.api.shared.erro.RegraDeNegocioException;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Version;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "pontos")
public class Ponto {

    @Id
    private UUID id;

    @Column(nullable = false, length = 120)
    private String nome;

    @Column(nullable = false, length = 200)
    private String endereco;

    @Column(nullable = false, length = 80)
    private String bairro;

    @Column(nullable = false, length = 80)
    private String cidade;

    @Column(name = "dias_horarios", nullable = false, length = 120)
    private String diasHorarios;

    @Column(length = 300)
    private String recebe;

    @Column(length = 300)
    private String distribui;

    @Column(name = "responsavel_id", nullable = false, updatable = false)
    private UUID responsavelId;

    @Column(nullable = false)
    private boolean ativo;

    @Column(name = "criado_em", nullable = false, updatable = false)
    private Instant criadoEm;

    @Version
    @Column(nullable = false)
    private Long versao;

    protected Ponto() {
    }

    Ponto(DadosPonto dados, UUID responsavelId, Instant criadoEm) {
        this.id = UUID.randomUUID();
        this.responsavelId = responsavelId;
        this.ativo = true;
        this.criadoEm = criadoEm;
        aplicar(dados);
    }

    void atualizar(DadosPonto dados) {
        aplicar(dados);
    }

    boolean pertenceA(UUID usuarioId) {
        return responsavelId.equals(usuarioId);
    }

    public boolean aceitaDoacoes() {
        return ativo && recebe != null;
    }

    private void aplicar(DadosPonto dados) {
        if (dados.recebe() == null && dados.distribui() == null) {
            throw new RegraDeNegocioException("o ponto precisa receber ou distribuir doações");
        }
        this.nome = dados.nome();
        this.endereco = dados.endereco();
        this.bairro = dados.bairro();
        this.cidade = dados.cidade();
        this.diasHorarios = dados.diasHorarios();
        this.recebe = dados.recebe();
        this.distribui = dados.distribui();
    }

    public UUID getId() {
        return id;
    }

    public String getNome() {
        return nome;
    }

    public String getEndereco() {
        return endereco;
    }

    public String getBairro() {
        return bairro;
    }

    public String getCidade() {
        return cidade;
    }

    public String getDiasHorarios() {
        return diasHorarios;
    }

    public String getRecebe() {
        return recebe;
    }

    public String getDistribui() {
        return distribui;
    }

    public UUID getResponsavelId() {
        return responsavelId;
    }

    public boolean isAtivo() {
        return ativo;
    }
}
