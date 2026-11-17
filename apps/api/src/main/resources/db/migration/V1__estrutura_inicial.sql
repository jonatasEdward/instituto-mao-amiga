create table usuarios (
    id          uuid         not null,
    nome        varchar(120) not null,
    email       varchar(160) not null,
    senha_hash  varchar(100) not null,
    papel       varchar(20)  not null,
    criado_em   timestamp with time zone not null,
    constraint pk_usuarios primary key (id),
    constraint uk_usuarios_email unique (email),
    constraint ck_usuarios_papel check (papel in ('DOADOR', 'RESPONSAVEL'))
);

create table pontos (
    id              uuid         not null,
    nome            varchar(120) not null,
    endereco        varchar(200) not null,
    bairro          varchar(80)  not null,
    cidade          varchar(80)  not null,
    dias_horarios   varchar(120) not null,
    recebe          varchar(300),
    distribui       varchar(300),
    responsavel_id  uuid         not null,
    ativo           boolean      not null default true,
    criado_em       timestamp with time zone not null,
    versao          bigint       not null default 0,
    constraint pk_pontos primary key (id),
    constraint fk_pontos_responsavel foreign key (responsavel_id) references usuarios (id),
    constraint ck_pontos_finalidade check (recebe is not null or distribui is not null)
);

create index idx_pontos_responsavel on pontos (responsavel_id);
create index idx_pontos_ativo_nome on pontos (ativo, nome);

create table doacoes (
    id              uuid         not null,
    doador_id       uuid         not null,
    ponto_id        uuid         not null,
    tipo_item       varchar(120) not null,
    quantidade      integer      not null,
    observacao      varchar(300),
    status          varchar(20)  not null,
    criada_em       timestamp with time zone not null,
    atualizada_em   timestamp with time zone not null,
    versao          bigint       not null default 0,
    constraint pk_doacoes primary key (id),
    constraint fk_doacoes_doador foreign key (doador_id) references usuarios (id),
    constraint fk_doacoes_ponto foreign key (ponto_id) references pontos (id),
    constraint ck_doacoes_quantidade check (quantidade > 0),
    constraint ck_doacoes_status check (status in ('REGISTRADA', 'RECEBIDA', 'CANCELADA'))
);

create index idx_doacoes_doador_criada on doacoes (doador_id, criada_em desc);
create index idx_doacoes_ponto_criada on doacoes (ponto_id, criada_em desc);
