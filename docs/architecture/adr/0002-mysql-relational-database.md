# ADR-0002: MySQL como banco transacional principal

- **Status:** Proposto para ratificar a escolha já implementada.
- **Data:** 2026-10-22

## Contexto

O domínio persiste usuários, clientes, filmes, salas, assentos, sessões,
ingressos e pagamentos. Existem referências entre registros e operações que
precisam preservar integridade; o Compose já provisiona MySQL e Sequelize usa
`mysql2`. O repositório também contém dependências PostgreSQL não usadas pela
configuração atual, então a decisão deve ser explícita.

## Decisão

Usar **MySQL** como fonte transacional principal do estágio atual. Usar Redis
somente para cache efêmero e Pub/Sub não durável, não como fonte de verdade.

## Alternativas

- **PostgreSQL:** alternativa relacional válida, mas trocar exige motivação
  específica e migração de schema/driver/testes não presente.
- **NoSQL documental:** menos alinhado às referências e invariantes relacionais
  atuais, salvo mudança de domínio comprovada.

## Consequências

- Aproveita modelos, SQL de bootstrap e Compose já existentes.
- Integridade de assento/venda precisa de constraints/transações explicitamente
  verificadas; o schema atual não prova exclusividade de assento por sessão.
- Fazer backup e testar restore antes de release relevante; aplicar mudanças de
  schema como migrações versionadas e compatíveis.
- O SQL do Compose inicializa volume novo apenas; não é mecanismo de migração.
- Remover dependências PostgreSQL somente em mudança separada, após confirmar
  que nenhum script/ambiente as utiliza.
