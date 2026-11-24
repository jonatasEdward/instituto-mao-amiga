create table outbox_eventos (
    id             uuid         not null,
    topico         varchar(120) not null,
    chave          varchar(120) not null,
    tipo           varchar(60)  not null,
    payload        text         not null,
    criado_em      timestamp with time zone not null,
    publicado_em   timestamp with time zone,
    tentativas     integer      not null default 0,
    ultimo_erro    varchar(500),
    constraint pk_outbox_eventos primary key (id)
);

-- O publicador só lê o que falta publicar, na ordem em que foi gravado.
create index idx_outbox_pendentes on outbox_eventos (criado_em) where publicado_em is null;
