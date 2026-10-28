# Estratégia de deploy e runbook inicial

## Estratégia

Para o estágio atual, usar **deploy simples e controlado pelo Docker Compose**,
não blue/green. O Nginx aponta para um único backend e frontend; Compose local
não define balanceamento entre versões, então declarar blue/green seria
enganoso.

- CI executa build, testes e validação OpenAPI em todo pull request e push para
  `master`.
- Deploy é manual (`workflow_dispatch`) por runner self-hosted autorizado no
  host de implantação; o workflow só permite deploy de `master`.
- O workflow usa a tag de runner `cinema-compose` e environment `compose`; o
  runner precisa ter Docker Compose v2, acesso ao host, secrets
  `MYSQL_ROOT_PASSWORD` e `MYSQL_PASSWORD` cadastrados no environment e
  certificados provisionados fora do Git. O workflow cria `.env` temporário com
  permissão restrita e o remove ao terminar.
- Antes de atualizar, revisar mudanças de schema/configuração e assegurar backup
  recuperável do MySQL.
- Executar `docker compose up --build --detach --wait`; conferir health e rotas por
  Nginx; observar logs antes de declarar sucesso.
- Rollback inicial: voltar à revisão Git anterior e reconstruir/reimplantar
  imagens Compose. Restaurar backup do banco somente se houver migração de dados
  incompatível; rollback de aplicação não reverte schema automaticamente.
- Antes de usar o workflow, configurar runner, acesso mínimo, environment
  protection e secrets no host; o workflow não instala segredos nem certificados.

## Runbook: API ou site indisponível

### 1. Confirmar e delimitar

1. Registrar horário, quem reportou, impacto, ambiente e URL/rota afetada.
2. Distinguir falha de DNS/TLS/Nginx, frontend, API, MySQL ou Redis.
3. Não coletar nem compartilhar tokens, senhas, dados de cartão ou dados
   pessoais em tickets/logs.

### 2. Inspecionar saúde e logs

```powershell
docker compose ps
docker compose logs --since 15m nginx backend frontend database redis
```

Verificar respostas e IDs de correlação:

```powershell
curl.exe -k -i https://cinema.local/
curl.exe -k -i https://cinema.local/api/catalogo/filmes
```

`-k` só é aceitável para diagnóstico local com certificado de desenvolvimento;
não use como configuração de cliente/produção. Correlacione `X-Request-Id` com
log JSON. Procure `http.request.failed`, `server.startup.failed`,
`redis.cache.*`, `redis.event.*` e status de healthcheck.

### 3. Mitigar com segurança

- **Nginx unhealthy/TLS:** confirmar certificados e montagem `nginx.conf`, então
  `docker compose restart nginx`. Validar `docker compose logs nginx` e HTTPS.
- **API unhealthy:** verificar conexão/migração MySQL e conexão Redis no log.
  Se Redis falhar, a API atualmente não inicia porque conexão/event bus são
  obrigatórios no startup; restaurar Redis e então reiniciar `backend`.
- **MySQL unhealthy:** não remover volume nem recriar dados. Verificar espaço,
  credenciais e log do serviço. Restaurar de backup aprovado se necessário.
- **Redis indisponível:** restaurar o serviço e confirmar assinatura do canal.
  Leituras cacheadas podem degradar para banco quando API está ativa, mas
  eventos Pub/Sub perdidos não podem ser recuperados.
- **Regressão após deploy:** interromper novas mudanças, coletar logs/versão,
  voltar à revisão anterior através do procedimento controlado e confirmar
  schema compatibility. Não fazer downgrade destrutivo de banco sem aprovação.

### 4. Verificar recuperação e encerrar

```powershell
docker compose ps
curl.exe -k -i https://cinema.local/
curl.exe -k -i https://cinema.local/api/catalogo/filmes
```

Confirmar saúde de serviços, comportamento das rotas e ausência de novos erros.
Registrar causa provável, linha do tempo, mitigação, perda de mensagens (se
houver), impacto e follow-ups. Encerrar incidente só após responsável validar
recuperação e comunicar stakeholders.

## Limitações e preparação necessária

- Este runbook é inicial e ainda não foi ensaiado com Docker neste ambiente.
- Definir owners de on-call, severidades, canal de comunicação e autoridade de
  rollback antes de operação real.
- Definir e testar backup/restore MySQL, retenção de logs e RTO/RPO com o PO e a
  operação. Não há garantia de recuperação até esses ensaios existirem.
- Pub/Sub não oferece replay; se evento perdido afetar consistência de negócio,
  pausar declarações de recuperação até reconciliar dados e priorizar transporte
  durável.
