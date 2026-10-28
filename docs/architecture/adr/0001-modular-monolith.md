# ADR-0001: manter um monólito modular

- **Status:** Proposto; a implementação observada é um único backend. Validar
  aprovação com a equipe responsável.
- **Data:** 2026-10-22

## Contexto

O backend é uma aplicação Express/TypeScript com controllers por recurso,
Sequelize e um único processo/entrega. O domínio tem áreas distintas (catálogo,
identidade, venda e pagamento), mas volume, equipes independentes e requisitos
de escala por domínio não estão demonstrados. Redis cache e Pub/Sub não
transformam por si só a aplicação em microservices.

## Decisão

Manter **monólito modular** como direção: uma API e um deploy, com dependências
organizadas por domínio/serviço/DTO e limites explícitos. Evoluir fronteiras
incrementalmente; não separar serviços até que um requisito real justifique o
custo operacional.

## Alternativas consideradas

- **Monólito sem fronteiras:** simples inicialmente, mas aumenta acoplamento e
  dificulta mudanças por domínio.
- **Microservices agora:** separação e escala independentes, porém adiciona
  deploys, rede, observabilidade, consistência distribuída e on-call sem
  necessidade comprovada.

## Consequências

- Mantém baixo custo de operação e transações locais acessíveis.
- Exige disciplina para impedir controllers/ORM de virarem contratos entre
  domínios; preferir DTOs e serviços.
- Processos compartilham falha e ciclo de release.
- Reavaliar quando ownership de equipe, escala, isolamento de falha ou cadence
  de release independente forem requisitos medidos.
