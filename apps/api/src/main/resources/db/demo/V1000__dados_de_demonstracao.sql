-- Dados usados apenas no perfil dev. Senha das duas contas: maoamiga123

insert into usuarios (id, nome, email, senha_hash, papel, criado_em) values
    ('00000000-0000-0000-0000-000000000001', 'Coordenação Mão Amiga', 'responsavel@maoamiga.dev',
     '$2a$10$3LmGII1bLUZxji0dvcT1/.b3XcLn8ZpBNpEgRcPS7nH5jErEMceXa', 'RESPONSAVEL', now()),
    ('00000000-0000-0000-0000-000000000002', 'Doador Demonstração', 'doador@maoamiga.dev',
     '$2a$10$3LmGII1bLUZxji0dvcT1/.b3XcLn8ZpBNpEgRcPS7nH5jErEMceXa', 'DOADOR', now());

insert into pontos (id, nome, endereco, bairro, cidade, dias_horarios, recebe, distribui, responsavel_id, criado_em) values
    ('10000000-0000-0000-0000-000000000001', 'Ponto Central', 'Rua T-30, Qd. 15', 'Setor Bueno', 'Goiânia',
     'Segunda a sexta, 8h às 12h', 'Alimentos não perecíveis, roupas em bom estado', 'Cestas básicas às quartas-feiras',
     '00000000-0000-0000-0000-000000000001', now()),
    ('10000000-0000-0000-0000-000000000002', 'Feira do Cerrado', 'Praça Joaquim Lúcio', 'Setor Campinas', 'Goiânia',
     'Sábados, 6h às 11h', 'Frutas e verduras doadas pelos feirantes ao final da feira', null,
     '00000000-0000-0000-0000-000000000001', now()),
    ('10000000-0000-0000-0000-000000000003', 'Escola Municipal Vila Nova', 'Rua 15, Qd. 22', 'Vila Nova', 'Goiânia',
     'Segunda a sexta, 13h às 17h', 'Material escolar e roupas infantis', 'Kits escolares no início de cada bimestre',
     '00000000-0000-0000-0000-000000000001', now()),
    ('10000000-0000-0000-0000-000000000004', 'Associação de Moradores Jardim América', 'Av. Perimetral Norte', 'Jardim América', 'Goiânia',
     'Terças e quintas, 14h às 18h', null, 'Cestas básicas e roupas de inverno para famílias cadastradas',
     '00000000-0000-0000-0000-000000000001', now()),
    ('10000000-0000-0000-0000-000000000005', 'Mercado Parceiro Bom Preço', 'Av. Anhanguera', 'Setor Central', 'Goiânia',
     'Diariamente, 18h às 19h', 'Alimentos próximos da validade, ainda próprios para consumo', null,
     '00000000-0000-0000-0000-000000000001', now()),
    ('10000000-0000-0000-0000-000000000006', 'Paróquia Nossa Senhora Aparecida', 'Rua das Flores, Qd. 8', 'Setor Pedro Ludovico', 'Goiânia',
     'Domingos, 9h às 12h', 'Roupas, calçados e cobertores', 'Kits de higiene e agasalho no inverno',
     '00000000-0000-0000-0000-000000000001', now()),
    ('10000000-0000-0000-0000-000000000007', 'Ponto Sul', 'Rua RC-4', 'Residencial Curitiba', 'Goiânia',
     'Segunda, quarta e sexta, 8h às 11h', 'Alimentos não perecíveis', 'Cestas básicas para famílias da região sul',
     '00000000-0000-0000-0000-000000000001', now());
