# ADR-0003: Redis para cache-aside e Pub/Sub não durável

- **Status:** Proposto; Redis está configurado no backend/Compose.
- **Data:** 2026-10-22

## Contexto

Listagens de catálogo podem ser consultadas repetidamente. Também há necessidade
de demonstrar circulação de eventos após alterações de filmes e sessões. Cache
é recuperável do MySQL; Pub/Sub pode perder mensagens se não houver consumidor
ativo ou se a publicação falhar entre commit e envio.

## Decisão

Usar Redis para cache-aside de consultas de catálogo com TTL e invalidação por
versão. Usar canal Pub/Sub para eventos observáveis no estágio atual, sem
prometer entrega garantida, persistência ou replay.

## Consequências

- Cache é descartável; MySQL continua sendo fonte de verdade.
- Cache BYPASS em falha Redis só é seguro enquanto o MySQL suportar a carga
  adicional.
- Publicação após persistência não é atômica; pode haver evento perdido.
- Se integração de eventos passar a ser requisito de negócio, usar outbox
  transacional e consumidor idempotente com broker durável (Redis Streams ou
  equivalente), com retry/ack/reconciliação.
- Monitorar falhas, taxa de bypass, subscriber count e discrepâncias.
