# Documentação arquitetural

Este índice reúne os artefatos da rubrica e diferencia fatos observados no
repositório de decisões propostas. Diagramas e SLOs são documentos de projeto,
não evidência de operação em produção.

## Artefatos e estado

| Entrega | Arquivo | Estado |
|---|---|---|
| C4 Contexto | [c4-context.mmd](./c4-context.mmd) | Modelo inicial baseado no escopo conhecido; integrações externas não confirmadas estão assinaladas. |
| C4 Containers | [c4-containers.mmd](./c4-containers.mmd) | Modelo inicial dos clientes, API, MySQL, Redis e proxy Compose. |
| ADRs | [adr/](./adr/) | Registra decisão proposta/atual e alternativas; precisa de aprovação dos responsáveis. |
| Quality scenarios, SLOs/SLIs, resiliência e observabilidade | [quality-resilience.md](./quality-resilience.md) | Metas propostas, ainda não medidas; separa controles implementados de lacunas. |
| Context map e DDD | [context-map.md](./context-map.md) | Mapeamento conceitual do domínio a validar com PO; reconhece que o código atual é um monólito sem módulos DDD isolados. |
| Contrato HTTP | [OpenAPI](../../Projeto-back-end/openapi.yaml) | Especifica endpoints principais observados em `src/app.ts`; validar respostas reais antes de tratá-lo como contrato estável. |
| CI/CD | [workflow CI](../../.github/workflows/ci.yml) | Executa build/testes e valida o OpenAPI em push e PR; deploy manual requer runner self-hosted `cinema-compose`, environment `compose`, secrets MySQL e certificados disponíveis no host. |
| Estratégia de deploy e runbook | [deployment-runbook.md](./deployment-runbook.md) | Procedimento inicial de deploy Compose e resposta a incidentes; ensaio ainda pendente. |

## Validar para aceite da rubrica

### Evidências no repositório

- [x] Diagramas iniciais C4 de contexto e containers.
- [x] ADRs para estilo arquitetural, banco relacional, Redis e deploy.
- [x] Cenários de qualidade, SLI/SLOs propostos, resiliência e observabilidade.
- [x] Context Map, subdomínios, Bounded Contexts e modelo Entity/Value
  Object/Aggregate para Venda de Ingressos.
- [x] OpenAPI dos endpoints principais observados.
- [x] Pipeline CI de build/testes e job de deploy manual esqueleto.
- [x] Estratégia Compose simples e runbook inicial.

Os checkboxes significam que o artefato está versionado no repositório, não que
as decisões foram ratificadas, metas medidas, o deploy executado ou o runbook
ensaiado.

1. Pedir ao PO/equipe que aprovem Context Map, limites dos contextos e modelo
   conceitual de entidades.
2. Comparar o OpenAPI com respostas reais e completar schemas conforme as
   regras de negócio confirmadas. O CI agora valida a estrutura e compara os
   caminhos/métodos documentados com as rotas de `src/app.ts`.
3. Medir os SLIs num ambiente representativo antes de declarar SLO cumprido.
4. Configurar secrets, environments e runner GitHub Actions; executar o fluxo
   manual de deploy e ensaiar rollback.
5. Guardar links/evidências de execução do CI e do teste do runbook. A presença
   dos arquivos não significa integração Jira, deploy ou SLO em funcionamento.
