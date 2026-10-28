# Cache distribuído com Redis

A API usa cache-aside para as consultas de catálogo de filmes e sessões. Na
primeira consulta, os dados são carregados do MySQL e gravados no Redis por 60
segundos. Leituras seguintes reutilizam o valor até a expiração.

Os endpoints de leitura informam o resultado no cabeçalho `X-Cache`:

- `MISS`: consulta ao MySQL e gravação no Redis.
- `HIT`: resposta carregada do Redis.
- `BYPASS`: Redis indisponível; a consulta é atendida pelo MySQL.

Criações, atualizações e exclusões de filmes ou sessões incrementam a versão do
cache do catálogo correspondente. Assim, as próximas leituras não reutilizam
entradas anteriores; respostas de gravação confirmam a invalidação por meio de
`X-Cache-Invalidated: true`. Entradas antigas expiram pelo TTL.

## Executar

Com Docker Compose, Redis é iniciado junto com os demais serviços:

```bash
docker compose up --build
```

Para executar a API fora do Compose, configure `REDIS_URL` (padrão:
`redis://127.0.0.1:6379`) e mantenha uma instância Redis acessível antes de
iniciar o servidor.

## Demonstrar invalidação

Faça duas leituras do catálogo; a primeira deve retornar `X-Cache: MISS` e a
segunda `X-Cache: HIT`:

```bash
curl -i http://localhost:3000/catalogo/filmes
curl -i http://localhost:3000/catalogo/filmes
```

## Mensageria e assinatura de eventos

O backend publica eventos `filme.created|updated|deleted` e
`sessao.created|updated|deleted` no canal Redis Pub/Sub `cinema:events` depois
de persistir a alteração e invalidar o cache. O consumidor assina o canal antes
de a API começar a aceitar requisições. Cada mensagem contém `eventId`, tipo,
entidade, ID da entidade e data/hora ISO.

Para demonstrar a circulação, crie, atualize ou remova um filme ou sessão e
acompanhe os logs do backend:

```text
{"component":"redis-event-publisher","action":"published","channel":"cinema:events","subscriberCount":1,"event":{"eventId":"...","type":"filme.updated","entity":"filme","entityId":1,"occurredAt":"..."}}
{"component":"redis-event-consumer","action":"received","event":{"eventId":"...","type":"filme.updated","entity":"filme","entityId":1,"occurredAt":"..."}}
```

O mesmo `eventId` nos registros `published` e `received` comprova a entrega
Pub/Sub ao consumidor ativo. Redis Pub/Sub não mantém histórico nem reenvia
mensagens para consumidores que estavam desconectados.

Atualize um filme com um token de administrador e consulte o catálogo outra vez.
A atualização retorna `X-Cache-Invalidated: true` e a próxima leitura retorna
`X-Cache: MISS`:

```bash
export ADMIN_TOKEN="<token-admin>"
curl -i -X PUT http://localhost:3000/filmes/1 \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"titulo":"Filme atualizado"}'
curl -i http://localhost:3000/catalogo/filmes
```

## Organização, logs e erros

Os controllers tratam HTTP e delegam cache/eventos aos serviços; os tipos de
entrada ficam em `src/dtos`, validações reutilizáveis em `src/utils` e os
middlewares transversais em `src/middlewares`.

Cada requisição recebe `X-Request-Id`. O log JSON `http.request.completed`
registra ID, método, rota, status e duração, sem query string, cabeçalhos de
autenticação ou corpo. Erros não tratados são registrados com o mesmo ID e
respondem com mensagem segura, código estável e ID para correlação. Erros de
JSON, validação/constraints do Sequelize e upload recebem status HTTP adequado.

Para visualizar a trilha de uma requisição:

```powershell
docker compose logs -f backend
```
