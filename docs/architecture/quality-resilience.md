# Cenários de qualidade, SLOs e observabilidade

## Estado

Os alvos abaixo são **propostas iniciais para validação com PO/operação**.
Ainda não há baseline de produção nem carga medida; nenhum SLO é declarado
atingido. As estratégias distinguem o que está no código/Compose do que ainda
precisa ser construído.

## Quality scenarios

| Atributo | Estímulo e contexto | Resposta esperada | Medida / aceite |
|---|---|---|---|
| Desempenho | Leitura repetida de catálogo com Redis disponível e cache aquecido | API responde do cache sem consulta ao MySQL | p95 de GET de catálogo ≤ 300 ms em ambiente de referência; registrar HIT/MISS e latência. Medir com carga representativa antes de fixar SLO. |
| Disponibilidade degradada | Redis fica indisponível durante consulta de catálogo | Cache reporta BYPASS, API tenta banco e registra falha Redis; não retorna sucesso inventado | ≥ 99.5% de sucesso mensal para leituras de catálogo excluindo manutenção acordada, condicionado à disponibilidade do MySQL/API. Meta proposta; ainda sem monitoramento de SLI. |
| Consistência percebida | Filme/sessão é alterado enquanto entradas de catálogo estão cacheadas | Nova versão de cache é usada nas próximas leituras; entradas antigas expiram em até 60 s | Após mutação confirmada, leitura seguinte deve ser MISS para novo namespace e refletir a gravação; cobrir por teste e integração Redis. |
| Integridade de venda | Duas requisições tentam vender o mesmo assento da mesma sessão | No máximo uma venda é confirmada; outra recebe conflito | Zero duplicidade em teste concorrente com banco; requisito ainda precisa de constraint/transação end-to-end demonstrada. |
| Segurança de erro | Dependência/handler falha inesperadamente | Cliente recebe mensagem genérica e request ID; detalhe fica apenas no log interno | 100% de erros inesperados levam código/requestId; teste automatizado verifica ausência de detalhe sensível na resposta. |
| Recuperabilidade | API/container falha durante operação/deploy | Container volta segundo restart policy; estado MySQL persiste; versão anterior pode ser reimplantada conforme runbook | Recuperação e rollback exercitados em ambiente controlado; RTO/RPO não definidos até validação do ambiente e requisito de negócio. |
| Pub/Sub | Consumidor está conectado durante mutação bem-sucedida | Publicação e consumo são registrados com mesmo eventId | Logs correlacionáveis; não existe garantia de entrega quando consumidor está desconectado. |

## SLI/SLOs propostos

| SLI | Definição | Alvo candidato | Como medir / lacuna atual |
|---|---|---|---|
| Disponibilidade da API | Proporção de probes HTTP de saúde que respondem sucesso | 99.5% por mês | Compose tem healthcheck do endpoint `/`; falta coleta persistente e cálculo de janela/error budget. |
| Latência de catálogo | Percentil 95 de GET `/catalogo/filmes` e `/catalogo/sessoes` | p95 ≤ 300 ms | Logs registram duração; não há backend de métricas/histogramas. Medir sob carga antes de assumir alvo. |
| Sucesso de requisições | Respostas 5xx / total de requisições excluindo cancelamentos do cliente | < 1% por mês | Logs estruturados permitem análise manual; falta agregação/alerta automático. |
| Atualização de cache | Tempo entre gravação concluída e resposta de leitura refletindo nova versão | ≤ 1 s em operação normal; TTL máximo 60 s como limite de fallback | Invalidação usa versão Redis; validar integração concorrente e comportamento se Redis estiver indisponível na mutação. |
| Integridade de compra | Compras duplicadas para `(sessão, assento)` | 0 duplicatas confirmadas | Ainda não há evidência de constraint/transaction de ponta a ponta; não publicar como SLO atingido. |

## Estratégias de resiliência

### Já presentes no código/configuração

- Cache-aside tenta atender ao MySQL se a leitura do Redis falha (`BYPASS`); falha
  de escrita no cache é registrada e não impede a resposta obtida do banco.
- Redis e MySQL têm healthchecks no Compose; dependências aguardam estado
  saudável. Serviços usam restart policy `unless-stopped`.
- Handler central mapeia erros de upload, JSON e constraints Sequelize, mantém
  status coerente e evita expor mensagens de falha inesperada.
- Redis Pub/Sub usa publisher e subscriber dedicados, pois uma conexão em modo
  subscribe não é reutilizada para comandos gerais.

### Não implementadas ou ainda não comprovadas

- **Retry:** não há política de retry/backoff de aplicação para MySQL/Redis.
  Para gravações e publicação de eventos, retries cegos podem duplicar efeitos;
  qualquer retry deve ser limitado, com jitter, timeout e idempotência.
- **Timeouts:** não há timeout de request/dependência documentado/validado como
  budget. Definir por endpoint após medir; proteger proxy e cliente de conexões
  penduradas.
- **Circuit breaker:** não está implementado. BYPASS de cache é degradação
  controlada para leitura, não circuit breaker. Considerar breaker apenas com
  métricas e política de recuperação claras.
- **Entrega garantida de eventos:** Redis Pub/Sub não persiste, não repete e não
  garante consumo. Para semântica durável, adotar outbox + Redis Streams ou
  broker apropriado, consumer idempotente, ack/retry/DLQ e reconciliação.
- **Consistência MySQL/Redis:** commit no MySQL e invalidação no Redis não são
  uma transação distribuída. Medir falhas e definir repair/fallback antes de
  alegar consistência forte.
- **Limites e proteção de carga:** quotas/rate limiting, pool budgets e back
  pressure devem ser definidos conforme perfil de tráfego; não há sizing
  validado.

## Plano de observabilidade

1. **Logs:** emitir JSON com timestamp, level, message, `requestId`, método,
   rota sem query string, status e duração. Nunca registrar tokens, senhas,
   dados completos de pagamento ou corpo pessoal. Logs atuais são stdout/stderr;
   o ambiente precisa coletá-los e definir retenção/acesso.
2. **Métricas a coletar:** contagem e latência HTTP por rota/status; 4xx/5xx;
   estado/tempo de conexão MySQL e Redis; taxa cache HIT/MISS/BYPASS e erro de
   invalidação; eventos publicados/consumidos e subscriber count; erros de
   upload; reinícios e health status de cada container.
3. **Alertas iniciais:** API unhealthy; 5xx acima do limite candidato por janela
   sustentada; p95 acima do alvo; MySQL/Redis indisponível; cache continuamente
   em BYPASS; aumento de eventos publicados com zero subscriber. Ajustar ruído e
   limiares depois da baseline.
4. **Correlação distribuída:** propagar `X-Request-Id` via Nginx; eventos têm
   `eventId`. Relacionar IDs sem guardar credenciais ou dados pessoais.
5. **Dashboards e revisão:** dashboard por serviço/rota e revisão semanal de
   tendências, incidentes e error budget. Não existe fornecedor de métricas
   configurado no repositório; escolher e provisionar como decisão operacional.
