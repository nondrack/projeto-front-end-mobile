# ADR-0004: Docker Compose e deploy controlado simples

- **Status:** Proposto; Compose está no repositório, execução real ainda não
  validada neste ambiente.
- **Data:** 2026-10-22

## Contexto

O sistema contém poucos serviços, compartilha ciclo de evolução e precisa de
ambiente local repetível. Não há cluster, autoscaling ou requisitos de alta
disponibilidade demonstrados.

## Decisão

Manter Docker Compose como orquestração inicial e usar deploy manual
controlado com validação de healthchecks e rollback pela revisão anterior.
Não implementar blue/green enquanto não houver múltiplas instâncias upstream,
provisionamento e estratégia compatível de migração de schema.

## Consequências

- Reduz complexidade operacional para ambiente de desenvolvimento/demonstração.
- Um host e containers permanecem pontos de falha; Compose não é plataforma HA.
- Segredos, certificados confiáveis, backup e runner de deploy precisam ser
  provisionados fora do repositório.
- Fazer teste integrado e ensaio de rollback antes de anunciar implantação
  operacional.
