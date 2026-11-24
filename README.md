# Instituto Mão Amiga

[![API](https://github.com/jonatasEdward/instituto-mao-amiga/actions/workflows/api.yml/badge.svg)](https://github.com/jonatasEdward/instituto-mao-amiga/actions/workflows/api.yml)
[![Mobile](https://github.com/jonatasEdward/instituto-mao-amiga/actions/workflows/mobile.yml/badge.svg)](https://github.com/jonatasEdward/instituto-mao-amiga/actions/workflows/mobile.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

App mobile e API para conectar quem quer doar aos pontos de coleta de Goiânia. O doador encontra um ponto, registra o que vai levar e acompanha se a doação chegou. Quem cuida do ponto vê o que está a caminho e confirma o recebimento.

**Demo:** [jonatasedward.github.io/instituto-mao-amiga](https://jonatasedward.github.io/instituto-mao-amiga/). Entre como `doador@maoamiga.dev` ou `responsavel@maoamiga.dev`, senha `maoamiga123`. A API roda no plano gratuito do Render e dorme quando fica parada, então o primeiro acesso pode levar um ou dois minutos.

| Pontos de coleta | Detalhe do ponto | Registrar doação |
| :---: | :---: | :---: |
| <img src="docs/telas/lista-de-pontos.png" width="220" alt="Lista de pontos de coleta com busca"> | <img src="docs/telas/detalhe-do-ponto.png" width="220" alt="Detalhe do ponto com endereço, horários e o que recebe"> | <img src="docs/telas/nova-doacao.png" width="220" alt="Formulário de nova doação"> |
| **Minhas doações (doador)** | **Doações do ponto (responsável)** | **Recebimento confirmado** |
| <img src="docs/telas/minhas-doacoes.png" width="220" alt="Doação aguardando entrega com opção de cancelar"> | <img src="docs/telas/doacoes-do-ponto.png" width="220" alt="Responsável vê a doação e confirma o recebimento"> | <img src="docs/telas/recebimento-confirmado.png" width="220" alt="Doação marcada como recebida"> |

> **English summary.** A mobile app and API that connect people who want to donate with donation drop-off points in Goiânia, Brazil. Donors find a point, register what they will bring and follow its status; the person running the point sees incoming donations and confirms receipt. It is a monorepo with a Spring Boot 4 API (Java 21, PostgreSQL, Flyway, JWT with roles, Problem Details errors, optimistic locking, Testcontainers integration tests, ArchUnit rules) and an Expo app in strict TypeScript (React Query, SecureStore, Testing Library). Both have CI, the API runs on Render with Neon PostgreSQL, and the web build is live at the demo link above. The API is organized by feature rather than with hexagonal architecture on purpose; the section "Por que camadas por feature e não hexagonal" explains the trade-off. The rest of this README is in Portuguese.

O repositório é um monorepo com as duas pontas do produto:

```
apps/
├── api/      Java 21, Spring Boot 4, PostgreSQL
└── mobile/   Expo (React Native) com TypeScript
```

## Funcionalidades

**Doador**
- busca pontos por nome ou bairro, com paginação infinita
- vê endereço, horários e o que cada ponto recebe ou distribui
- registra uma doação (item, quantidade, observação) num ponto que aceita doações
- acompanha o status: aguardando entrega, recebida ou cancelada
- cancela uma doação que ainda não foi entregue

**Responsável pelo ponto**
- cadastra o próprio ponto de coleta
- vê os pontos que administra
- lista as doações registradas para cada ponto
- confirma o recebimento de cada doação

## Arquitetura

```mermaid
flowchart LR
    App["App Expo<br/>React Query + SecureStore"] -- "HTTPS + JWT" --> API["API Spring Boot<br/>camadas por feature"]
    API -- "JPA + Flyway" --> DB[("PostgreSQL")]
```

### API

O código é organizado por feature, não por camada técnica. Cada pacote junta controller, serviço, repositório, entidade e DTOs do seu assunto:

```
com.maoamiga.api
├── auth/       cadastro, login e emissão do JWT
├── usuarios/   conta e perfil
├── pontos/     pontos de coleta
├── doacoes/    registro e ciclo de vida das doações
└── shared/     segurança, tratamento de erros, paginação
```

Três regras mantêm essa organização de pé, e o `ArquiteturaTest` (ArchUnit) quebra o build se alguma delas for violada:

1. Um repositório só é usado dentro da própria feature. Se `doacoes` precisa de dados de um ponto, pergunta ao `PontoService`, nunca ao `PontoRepository`.
2. Não existe dependência circular entre features.
3. `shared` não conhece nenhuma feature.

### App

```
apps/mobile/src
├── api/         cliente HTTP tipado, endpoints e chaves de cache
├── auth/        contexto de sessão e armazenamento seguro do token
├── navegacao/   pilhas e abas, que mudam conforme o perfil
├── telas/       uma tela por arquivo
├── componentes/ botão, campo, estados de carregando/erro/vazio
└── validacao/   regras dos formulários, sem dependência de React
```

Estado de servidor fica no React Query (cache, refetch, paginação, invalidação depois de mutações). Estado local fica nos componentes. Não há biblioteca de estado global porque o único estado realmente global é a sessão, e um Context resolve.

## Decisões que vale conhecer

**Por que camadas por feature e não hexagonal.** O domínio aqui é pequeno e as regras moram em poucas entidades. Isolar o núcleo com portas e adaptadores dobraria a quantidade de classes sem proteger nada importante. Quando o isolamento compensa, uso hexagonal, como no [hexagonal-architecture-template](https://github.com/jonatasEdward/hexagonal-architecture-template). Aqui, organizar por feature deixa cada assunto num lugar só e facilita navegar pelo código.

**JWT stateless com papéis.** O token leva o id do usuário e o papel (`DOADOR` ou `RESPONSAVEL`). As rotas são protegidas por papel na configuração do Spring Security, e as regras de posse (só o dono do ponto confirma, só quem registrou cancela) ficam nos serviços. O segredo vem de variável de ambiente, precisa ter pelo menos 32 bytes e, no perfil `prod`, não tem valor padrão: sem `JWT_SECRET` a aplicação não sobe.

**Erros no padrão Problem Details (RFC 9457).** 400 com a lista de campos inválidos, 401, 403, 404, 409 para e-mail duplicado ou atualização concorrente, 422 para regra de negócio. O app lê esse formato num lugar só (`ApiError`) e mostra a mensagem certa em cada tela.

**Lock otimista.** Ponto e doação têm `@Version`. Se o responsável confirma o recebimento no mesmo instante em que o doador cancela, uma operação passa e a outra recebe 409, em vez de uma sobrescrever a outra.

**Ciclo de vida da doação no próprio modelo.** `Doacao.cancelar()` e `Doacao.confirmarRecebimento()` validam a transição. Uma doação recebida não pode ser cancelada, e uma cancelada não pode ser confirmada.

**Sem N+1 nas listagens.** As listas de doações trazem o nome do ponto buscando todos os pontos da página numa consulta só, em vez de um por linha.

**Token no Keychain/Keystore.** No celular a sessão fica no `expo-secure-store`. Uma resposta 401 da API encerra a sessão e limpa o cache, e o app volta para o login.

## Como rodar

Requisitos: JDK 21, Maven 3.9+, Node 22 e Docker.

### API

```bash
docker compose up -d postgres
cd apps/api
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

O perfil `dev` cria duas contas e sete pontos de coleta de exemplo. A API fica em `http://localhost:8080` e a documentação interativa em `http://localhost:8080/swagger-ui.html`.

Para subir banco e API juntos em containers:

```bash
docker compose --profile api up --build
```

### App

```bash
cd apps/mobile
npm install
EXPO_PUBLIC_API_URL=http://SEU_IP_NA_REDE:8080 npx expo start
```

No celular, use o IP da máquina na rede local, porque `localhost` aponta para o próprio aparelho. No emulador Android, use `http://10.0.2.2:8080`. Para abrir no navegador, rode `npx expo start --web`.

### Contas de demonstração (perfis dev e demo)

| Perfil | E-mail | Senha |
| --- | --- | --- |
| Doador | `doador@maoamiga.dev` | `maoamiga123` |
| Responsável | `responsavel@maoamiga.dev` | `maoamiga123` |

## Deploy

| Parte | Onde roda | Como |
| --- | --- | --- |
| Banco | Neon (PostgreSQL gerenciado) | conexão com SSL; o schema é criado pelo Flyway na subida da API |
| API | Render, a partir do `apps/api/Dockerfile` | descrita em [`render.yaml`](render.yaml); novo deploy a cada push na `main` |
| App web | GitHub Pages | workflow [`deploy-web.yml`](.github/workflows/deploy-web.yml), que gera o build web do Expo |

A API roda com os perfis `prod,demo`. O `prod` desliga o Swagger e exige `JWT_SECRET`, que o próprio Render gera na criação do serviço. O `demo` carrega os pontos e as contas de demonstração. Os dados de conexão do banco são preenchidos no painel do Render e nunca entram no repositório.

A instância gratuita do Render dorme depois de 15 minutos sem tráfego. Por isso, a primeira requisição depois de um tempo parado pode levar um ou dois minutos. As seguintes respondem normalmente.

## Testes

```bash
cd apps/api && mvn verify        # unitários, integração com Testcontainers e ArchUnit
cd apps/mobile && npm test       # Jest + Testing Library
cd apps/mobile && npm run typecheck
```

Os testes de integração da API sobem um PostgreSQL real com Testcontainers, então precisam de Docker. Eles cobrem o fluxo completo: cadastro, login, criação de ponto, registro de doação, permissões entre perfis e confirmação de recebimento.

No app, as regras de validação e o cliente HTTP são testados isoladamente, e a tela de nova doação é testada como o usuário a usa: preenchendo campos e tocando no botão.

## Endpoints

| Método | Caminho | Quem pode |
| --- | --- | --- |
| POST | `/api/v1/auth/cadastro` | qualquer pessoa |
| POST | `/api/v1/auth/login` | qualquer pessoa |
| GET | `/api/v1/usuarios/me` | autenticado |
| GET | `/api/v1/pontos?busca=&pagina=&tamanho=` | qualquer pessoa |
| GET | `/api/v1/pontos/{id}` | qualquer pessoa |
| GET | `/api/v1/pontos/meus` | responsável |
| POST | `/api/v1/pontos` | responsável |
| PUT | `/api/v1/pontos/{id}` | responsável pelo ponto |
| GET | `/api/v1/pontos/{id}/doacoes` | responsável pelo ponto |
| POST | `/api/v1/doacoes` | doador |
| GET | `/api/v1/doacoes/minhas` | doador |
| POST | `/api/v1/doacoes/{id}/cancelar` | doador que registrou |
| POST | `/api/v1/doacoes/{id}/confirmar-recebimento` | responsável pelo ponto |

## Limitações conhecidas e próximos passos

- **Sem refresh token.** O token vale 8 horas e depois o usuário entra de novo. O próximo passo é um refresh token rotativo guardado no servidor, o que também permite revogar sessões.
- **Login sem limite de tentativas.** Antes de ir para produção, o endpoint de login precisa de rate limiting por IP e por conta.
- **Edição de ponto só pela API.** O app cadastra pontos, mas ainda não tem a tela de edição. O endpoint `PUT /api/v1/pontos/{id}` já existe.
- **Sem notificações.** O doador descobre que a doação chegou abrindo o app. Push notifications com Expo resolveriam isso.
- **Busca só por texto.** Ordenar os pontos pela distância do usuário exige latitude e longitude no cadastro e o uso de geolocalização no app.

## Licença

Distribuído sob a licença MIT. Veja o arquivo [LICENSE](LICENSE).
