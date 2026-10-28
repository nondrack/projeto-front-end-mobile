# Planejamento e condução do ciclo de vida do Cinema

## 1. Objetivo e abordagem

Este plano orienta a evolução do Cinema, sistema com frontend web e mobile,
API, MySQL, Redis e Nginx/Docker Compose. A arquitetura e o contexto Cynefin
estão descritos em [Análise Cynefin](./analise-cynefin.md): o produto apresenta
incerteza de integração e feedback, embora partes técnicas sejam previsíveis.

**Abordagem escolhida: híbrida.** Usar governança preditiva leve para definir
objetivo, escopo, riscos, marcos e critérios de release; usar Scrum e entregas
incrementais para implementar, testar e reordenar o backlog. O PM Canvas
funciona como alinhamento inicial e referência para decisões, não como plano
imutável.

**Objetivo do projeto:** entregar uma experiência de cinema em que clientes
consultem filmes e sessões e possam concluir os fluxos de conta e compra com
confiabilidade, enquanto administradores mantêm o catálogo. O sistema deve ser
operável por Compose, observável por logs correlacionáveis e verificável por
testes.

**Escopo considerado:** validar e evoluir os fluxos web/mobile e API, persistência
e cache/eventos, proxy/deploy local, qualidade e documentação. Hospedagem
produtiva, operação 24x7, escala comercial, custos aprovados e requisitos legais
específicos não foram confirmados; não são assumidos neste plano e precisam de
decisão dos stakeholders antes de uma release pública.

## 2. PM Canvas do projeto

| Bloco | Definição inicial |
|---|---|
| **Por quê? (justificativa)** | Oferecer um fluxo digital coerente para descobrir filmes, consultar sessões, autenticar clientes e administrar o catálogo; reduzir falhas de integração e facilitar a evolução do produto. |
| **Benefícios** | Catálogo acessível nos clientes web/mobile; alterações do catálogo refletidas sem servir cache obsoleto; operação local reproduzível; falhas rastreáveis por request ID; releases parciais demonstráveis. |
| **Produto** | Aplicação Cinema composta por web, mobile, API TypeScript/Express, MySQL, Redis e Nginx, executável em ambiente local via Docker Compose. |
| **Requisitos / entregas** | Jornadas de catálogo, conta e compra com critérios testáveis; contratos de API; cache TTL e invalidação; eventos Pub/Sub; logs e erros padronizados; proxy e healthchecks; testes e instruções de release. |
| **Stakeholders / usuários** | Clientes de cinema; administradores/funcionários que mantêm filmes, salas e sessões; equipe de desenvolvimento e QA; responsável pelo produto; responsável pela operação/infra. Pessoas e patrocinador não foram identificados no repositório. |
| **Equipe / papéis** | Product Owner (valor e prioridade); Scrum Master/gerente de projeto (fluxo, riscos e impedimentos); equipe de desenvolvimento (web, mobile e API); QA/analista (critérios, testes e evidências); responsável de infraestrutura (Compose, proxy e ambientes). Uma pessoa pode acumular papéis se isso for acordado; nomes e disponibilidade devem ser definidos pela equipe. |
| **Premissas** | O repositório é a fonte atual de implementação; equipe consegue executar Node/npm; releases iniciais são incrementais e não produtivas; as configurações externas reais (Jira, usuários e ambiente de produção) serão fornecidas pelos responsáveis. |
| **Restrições** | Dependência entre frontend, API, banco, Redis e proxy; certificado atual é local; credenciais devem vir de ambiente seguro e não ser versionadas; Pub/Sub Redis não guarda nem reenvia mensagens perdidas. |
| **Riscos** | Diferença entre ambiente local e implantação; integração Compose ainda precisa de validação real; inconsistência percebida em fluxos assíncronos; credenciais/configuração incorretas; escopo e critérios de compra ainda podem precisar de confirmação. Mitigações: spikes, testes integrados, secrets fora do Git, critérios de aceite e decisão explícita sobre durabilidade de eventos. |
| **Marcos** | M0: objetivo, stakeholders, escopo e critérios acordados; M1: fluxo essencial demonstrável; M2: cache/eventos integrados e observáveis; M3: stack completa validada; M4: release aprovada com notas e riscos residuais. |
| **Custos / duração** | A estimativa de orçamento, tamanho da equipe, capacidade e calendário não consta do repositório. PO e patrocinador devem aprovar esses dados; não se inventam valores ou datas neste plano. Planejar em sprints de uma semana como cadência inicial, revisável após a primeira retrospectiva. |
| **Métricas de sucesso** | Histórias de release cumprem todos os critérios de aceite; build e testes passam; stack Compose fica saudável; chamadas web chegam à API pelo proxy; cache mostra HIT/MISS e invalida em mutação; eventos publicados são observados pelo consumidor; erros inesperados retornam request ID sem detalhes internos. |

## 3. Ciclo de vida e gates de decisão

| Fase | Aplicação ao Cinema | Responsável primário | Saída / condição para avançar |
|---|---|---|---|
| **Iniciação** | Confirmar problema, usuários, patrocinador/PO, objetivos, escopo mínimo, stakeholders e viabilidade. Identificar decisões abertas (ambiente alvo, compra, durabilidade de eventos). | PO e gerente de projeto; stakeholders aprovam objetivo e limites. | Termo de abertura leve com objetivo, benefício, escopo, premissas, riscos iniciais e responsáveis. Gate M0: PO/stakeholders aprovam o que significa MVP. |
| **Planejamento** | Construir e priorizar o backlog; escrever histórias e aceite; mapear dependências, releases, testes, riscos, capacidade e critérios de pronto. Completar PM Canvas com equipe e estimativas reais. | PO prioriza; equipe estima; gerente facilita plano e riscos; QA define evidências. | Backlog ordenado, release inicial candidata, plano de sprint, Definition of Ready/Done e estratégia de teste. Gate: objetivo do incremento e capacidade acordados. |
| **Execução** | Em cada sprint, construir histórias pequenas; revisar código; executar testes e atualizar documentação. Fazer spike curto quando integrações forem incertas. | Equipe de desenvolvimento entrega; Scrum Master remove impedimentos; PO esclarece valor/aceite. | Incremento integrado, testável e potencialmente liberável; issues atualizadas com evidências. |
| **Monitoramento e controle** | Comparar aceite, qualidade e riscos com o plano; verificar build/testes/healthchecks/logs; revisar bloqueios e mudanças de escopo; reordenar backlog sem perder histórico das decisões. | Gerente/Scrum Master acompanha fluxo; QA verifica evidências; PO decide prioridade; equipe trata defeitos. | Status e riscos atualizados; ações corretivas ou mudança aprovada; decisões registradas no Jira. Um status visual não substitui demonstração executável. |
| **Encerramento** | Revisar incremento/release com stakeholders; confirmar aceite, notas, versão/tag, limitações, riscos, pendências e operação/rollback aplicável; registrar lições aprendidas. | PO aceita produto; gerente encerra marco; equipe e QA fornecem evidências. | Release aprovada ou rejeitada com motivos; backlog residual priorizado; documentação e responsáveis por operação definidos. Gate M4: aceite e plano de suporte/retorno aprovados. |

Mudança que altere objetivo, segurança, dados, custo ou data de marco precisa de
análise de impacto pelo gerente e decisão do PO/patrocinador. Mudanças de
prioridade dentro do escopo podem ser refletidas diretamente na ordenação do
backlog.

## 4. Papéis e responsabilidades

Os papéis abaixo são funções do processo, não nomes atribuídos: pessoas reais
precisam ser definidas pela equipe.

| Papel | Responsabilidades | Não deve ser confundido com |
|---|---|---|
| **Patrocinador / responsável de negócio** | Aprovar objetivo, limites, recursos e decisões de release; resolver conflitos de prioridade de negócio. | Dono das decisões técnicas diárias. |
| **Product Owner (PO)** | Representar usuários; manter o Product Goal; ordenar backlog por valor/risco; detalhar histórias; aceitar ou rejeitar critérios concluídos. | Gerente que atribui tarefas individualmente. |
| **Gerente de projeto / Scrum Master** | Na governança híbrida, acompanhar marcos, riscos, dependências e comunicação; facilitar cerimônias; tornar impedimentos visíveis e ajudar o time a removê-los. | Autoridade para alterar critérios de produto unilateralmente ou microgerenciar a equipe. |
| **Analista de negócio / requisitos** | Esclarecer jornadas e regras; mapear fluxo atual/futuro; documentar requisitos, regras e critérios; manter rastreabilidade entre necessidade, história e teste. Pode ser função acumulada pelo PO/equipe. | Responsável por aprovar prioridades sem PO. |
| **Equipe de desenvolvimento** | Projetar, implementar, revisar, testar e integrar código; dividir histórias em tarefas; estimar esforço; sinalizar riscos e manter incremento pronto. Inclui competências web, mobile, backend e infraestrutura conforme necessidade. | Um grupo que só transfere código para QA no fim. |
| **QA / analista de testes** | Desafiar ambiguidades; preparar testes de unidade, integração e jornada; registrar evidências e defeitos; verificar critérios sem ser o único responsável pela qualidade. | Fase final isolada do ciclo. |
| **Responsável por infraestrutura/operação** | Manter Compose, Nginx, configuração de ambientes, certificados/secrets, healthchecks, logs e instruções de implantação/retorno. | Repositório de credenciais ou dono único da operação. |

Uma pessoa pode acumular funções em equipe pequena, mas a decisão de prioridade
e a validação de aceite devem continuar explícitas.

## 5. Método de execução: Scrum com governança híbrida

- **Cadência inicial proposta:** sprint de uma semana; revisar duração depois da
  primeira retrospectiva conforme capacidade real.
- **Planejamento:** PO apresenta objetivo e itens prioritários; equipe confirma
  entendimento, dependências e capacidade, e seleciona um Sprint Goal.
- **Daily:** reunião curta da equipe para sincronizar progresso e impedimentos;
  não é relatório individual ao gerente.
- **Refinement:** dividir itens grandes, refinar critérios e dependências antes
  de entrarem na sprint.
- **Review:** demonstrar incremento executável a stakeholders e recolher
  feedback; atualizar aceite/backlog.
- **Retrospectiva:** escolher uma melhoria concreta do processo e acompanhar na
  sprint seguinte.
- **Quadro:** `Backlog → Ready → In Progress → Review/Test → Done`; limitar
  trabalho simultâneo em andamento conforme capacidade. Bloqueios são rotulados
  e acompanhados, não escondidos em “In Progress”.
- **Transparência:** Jira é fonte de status e decisão do trabalho quando
  configurado; commits/branches/PRs devem referenciar a chave real da issue.
  Enquanto Jira não estiver conectado, o CSV é apenas artefato de importação,
  não prova de atribuição ou transição real.

### Definition of Ready

Uma história entra em sprint quando tem usuário/valor, critério de aceite
observável, dependências e riscos conhecidos, tamanho que a equipe considera
entregável na sprint e decisão de prioridade do PO. Incerteza grande vira spike
com pergunta, limite de tempo e resultado esperado.

### Definition of Done

Código revisado e integrado; critérios de aceite verificados; testes relevantes
passam; build passa; erros/logs/documentação atualizados; sem segredo no
repositório; evidências e status registrados. Para história de infraestrutura,
healthchecks e configuração do ambiente alvo também precisam ser demonstrados.

## 6. Product Backlog inicial

Itens ordenados por valor e risco de integração. Os IDs `PB-xx` são referências
locais deste documento, não chaves Jira. A ordem e as versões são propostas para
refinamento com o PO e a equipe. “Pronto” significa que o código foi adicionado
ao repositório; ainda deve ser distinguido de aceite de produto e validação no
ambiente-alvo.

### PB-01 — Consultar catálogo confiável (P0)

**User Story:** Como cliente, quero consultar filmes e sessões disponíveis para
decidir o que assistir e quando ir ao cinema.

**Critérios de aceite**

1. Dado que a API e o banco estão saudáveis, quando consulto os catálogos, então
   recebo filmes/sessões em JSON com HTTP 200.
2. Dado um ID existente, quando solicito o detalhe, então recebo o registro
   correspondente; dado um ID inexistente, recebo HTTP 404.
3. Se a consulta falha por indisponibilidade inesperada, a API retorna erro
   seguro com `requestId`, sem stack trace ou dados internos na resposta.
4. Testes automatizados cobrem lista e consulta por ID; a equipe demonstra os
   catálogos nos clientes que estiverem no escopo da release.

**Release candidata:** `0.1.0`.

### PB-02 — Autenticar e administrar catálogo (P0)

**User Story:** Como administrador, quero autenticar e manter filmes e sessões
para que o catálogo reflita a programação aprovada.

**Critérios de aceite**

1. Credenciais válidas recebem token; credenciais inválidas recebem HTTP 401
   com mensagem genérica.
2. Rotas protegidas rejeitam ausência/invalidez de token e usuário sem papel
   administrativo.
3. Criar, atualizar e excluir registro permitido altera o banco e devolve o
   status esperado; registro ausente devolve 404 e conflito relacional devolve
   409.
4. Respostas de usuário não expõem senha ou hash; testes verificam autorização,
   sucesso e erro.

**Release candidata:** `0.1.0`.

### PB-03 — Concluir uma compra de ingresso (P1)

**User Story:** Como cliente autenticado, quero escolher sessão e assento e
concluir a compra para receber um registro da minha ida ao cinema.

**Critérios de aceite**

1. Uma compra aceita somente sessão, cliente e assento existentes e retorna
   confirmação com identificador e dados persistidos.
2. Assento já ocupado não pode ser vendido novamente; a operação concorrente
   não gera duas compras confirmadas para o mesmo assento/sessão.
3. Pagamento deve referenciar ingresso válido e valor correspondente ao
   contrato aprovado pelo PO.
4. Um erro de validação ou persistência não pode responder sucesso; transação e
   consistência entre ingresso/pagamento devem ser demonstradas por teste.
5. O cliente só consulta as próprias compras, salvo papel explicitamente
   autorizado.

**Dependência:** regras de preço, estados de pagamento e política de reserva
precisam ser confirmadas com o PO antes de estimar/priorizar a implementação.
**Release candidata:** `0.2.0`.

### PB-04 — Reutilizar cache de catálogos (P1)

**User Story:** Como cliente do catálogo, quero que consultas frequentes sejam
atendidas rapidamente pelo Redis sem exibir dados obsoletos após alterações.

**Critérios de aceite**

1. Primeira leitura sem entrada informa `X-Cache: MISS`; repetição dentro do TTL
   retorna `X-Cache: HIT`.
2. TTL é 60 segundos e controla a expiração das entradas.
3. Criação, atualização ou exclusão bem-sucedida de filme/sessão invalida o
   namespace relacionado; leitura seguinte não retorna a versão antiga.
4. Redis indisponível permite consulta ao banco com `X-Cache: BYPASS`, registra
   erro operacional e não produz resposta falsa de cache.
5. Testes cobrem miss, hit, TTL configurado, bypass e invalidação.

**Dependência:** PB-01. **Release candidata:** `0.2.0`.

### PB-05 — Propagar eventos do catálogo (P1)

**User Story:** Como serviço consumidor, quero receber eventos de mudanças de
filmes e sessões para reagir às atualizações do domínio.

**Critérios de aceite**

1. Gravações bem-sucedidas publicam `filme|sessao.created|updated|deleted` no
   canal acordado, com `eventId`, entidade, identificador e timestamp.
2. Consumidor assina o canal e registra recebimento correlacionável ao log de
   publicação pelo mesmo `eventId`.
3. Mutação que falha não publica evento de sucesso.
4. Testes verificam payload e publicação/consumo; documentação declara que
   Redis Pub/Sub não oferece persistência/replay.
5. Caso o negócio exija entrega garantida, a equipe registra decisão e estima
   migração para Redis Streams ou broker durável antes de prometer esse SLA.

**Dependência:** PB-04 para ordenar junto da invalidação. **Release candidata:**
`0.2.0`.

### PB-06 — Usar o sistema web pelo proxy (P1)

**User Story:** Como cliente web, quero acessar frontend e API pelo mesmo host
com HTTPS para não depender de endereços internos dos containers.

**Critérios de aceite**

1. `/` encaminha ao frontend e `/api/...` chega à rota correta do backend.
2. HTTP redireciona para HTTPS e o certificado é apropriado ao ambiente alvo.
3. Healthchecks e dependências só iniciam Nginx quando API/frontend estão
   saudáveis; falha é visível nos logs.
4. Teste integrado executado após `docker compose up --build` comprova a
   jornada e os status esperados; a configuração local não é apresentada como
   certificado de produção.

**Release candidata:** `0.3.0`.

### PB-07 — Diagnosticar requisições e falhas (P1)

**User Story:** Como pessoa de suporte/desenvolvimento, quero correlacionar
requisições e receber erros seguros para identificar problemas sem expor dados
internos.

**Critérios de aceite**

1. Cada requisição recebe `X-Request-Id`; log de conclusão contém ID, método,
   rota sem query string, status e duração.
2. Erro inesperado registra detalhe no log interno e responde com mensagem
   genérica, código e mesmo request ID.
3. JSON inválido, validação, conflito de banco e arquivo inválido/tamanho
   excedido recebem respostas/status documentados.
4. Testes verificam correlação, ausência de detalhe interno na resposta e
   status de erro.

**Release candidata:** `0.3.0`.

### PB-08 — Publicar incremento reproduzível (P1)

**User Story:** Como stakeholder, quero uma versão identificável e reproduzível
do software para validar uma entrega parcial e comunicar o que está incluído.

**Critérios de aceite**

1. Versão semântica, tag Git e notas de release usam a mesma versão.
2. Notas listam histórias incluídas, alterações incompatíveis, configuração,
   limitações e defeitos conhecidos.
3. CI/build e testes obrigatórios passam e o artefato pode ser iniciado segundo
   instruções atualizadas.
4. A release registra aceite do PO e riscos/rollback ou plano de correção.

**Dependências:** critérios aplicáveis da versão candidata e ambiente de
validação disponível. **Release candidata:** cada marco, culminando em `1.0.0`.

## 7. Versões e releases parciais

Adotar **Semantic Versioning** (`MAJOR.MINOR.PATCH`) após a primeira baseline.
As versões abaixo são metas propostas, não tags já publicadas. O PO pode ajustar
escopo na review; cada release mantém um conjunto explícito de histórias e
critérios.

| Versão proposta | Conteúdo candidato | Gate de release |
|---|---|---|
| `0.1.0` | Catálogo consultável e manutenção autenticada do catálogo (PB-01, PB-02) | Contratos e autorização testados; build e testes passam; demo para PO. |
| `0.2.0` | Fluxo de compra priorizado e catálogos com cache/eventos (PB-03, PB-04, PB-05) | Regras comerciais aprovadas; consistência de assento/compra testada; comportamento Redis observado. |
| `0.3.0` | Stack web/API integrada, Nginx/Compose e observabilidade (PB-06, PB-07) | Teste ponta a ponta em ambiente acordado; secrets e TLS revisados; healthchecks e logs verificados. |
| `1.0.0` | Baseline aceita do produto e documentação operacional (PB-08 + itens aceitos) | PO aprova escopo; riscos conhecidos aceitos; tag, notas, estratégia de suporte/rollback registradas. |

Enquanto não existir release formal, alterações compatíveis podem usar
`0.x.y` e prereleases como `0.3.0-rc.1`. Incrementar PATCH para correções
compatíveis, MINOR para capacidade compatível e MAJOR quando houver contrato
incompatível após `1.0.0`. Não criar tag nem marcar release como publicada até
que o gate de validação correspondente seja atendido.

## 8. Registro e comunicação do progresso

Para cada história, manter no Jira (ou no artefato de importação até a conexão
real existir): ID, user story, prioridade, responsável definido pela equipe,
release alvo, dependências, status, critérios de aceite, evidência e bloqueios.
Revisar o quadro diariamente pela equipe e em cada review com o PO.

No encerramento de uma sprint, comunicar: objetivo planejado vs. concluído,
demo/evidências, itens não concluídos e motivo, riscos novos, mudanças no
backlog e objetivo seguinte. Não atribuir nomes, datas de calendário, custos ou
status reais do Jira sem confirmação dos responsáveis.
