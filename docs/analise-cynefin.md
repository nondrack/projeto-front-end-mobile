# Análise do projeto com o framework Cynefin

## Contexto analisado

O projeto Cinema reúne aplicações web e mobile, uma API em Node.js/TypeScript,
MySQL, Redis para cache e Pub/Sub, e Nginx/Docker Compose para execução local.
Há fluxos interdependentes, como alterações de filmes e sessões que precisam
atualizar o banco, invalidar o cache e publicar eventos. A interface também
depende da API e da configuração do proxy.

Esta classificação considera o sistema e o trabalho de evolução como um todo,
não afirma que toda tarefa individual tenha o mesmo nível de incerteza.

## Classificação: domínio Complexo

O domínio predominante é **Complexo**. Nesse domínio, relações de causa e efeito
não são totalmente previsíveis antes da implementação; tornam-se mais claras
por observação, feedback e experimentos. Isso não significa que o projeto seja
desorganizado ou que não possa ser planejado.

### Evidências no projeto

- A aplicação é distribuída entre cliente web, cliente mobile, backend, banco,
  Redis e proxy. Uma mudança em uma fronteira pode revelar efeitos em outras,
  como compatibilidade de rotas, rede, cache ou inicialização dos serviços.
- Cache-aside, invalidação e eventos Pub/Sub introduzem comportamento temporal
  e assíncrono. Testes unitários verificam regras locais, mas execução integrada
  ainda é necessária para observar o comportamento entre processos.
- Configurações de ambiente e execução variam entre desenvolvimento local,
  Compose e dispositivos mobile; o resultado efetivo depende da combinação
  dessas condições.
- Feedback de usuários, equipe e validação integrada pode alterar prioridades e
  critérios de aceite durante a evolução.

Há também trabalho **Complicado** dentro do projeto: por exemplo, configurar
corretamente TLS, healthchecks, contratos da API e a consistência de cache exige
conhecimento técnico e análise. Esses itens podem ser resolvidos por especialistas
e testes. Tarefas repetíveis, como executar testes e verificar logs, podem ser
tratadas no domínio **Simples** com procedimentos conhecidos. Não há evidência
de uma crise operacional que justifique classificar o projeto como **Caótico**.

## Abordagem recomendada: híbrida, com execução ágil

Recomenda-se uma abordagem **híbrida**:

- **Ágil na construção e descoberta:** desenvolver em incrementos pequenos,
  priorizar pelo valor e risco, validar cedo com testes e execução integrada e
  ajustar o backlog com base no feedback.
- **Preditiva na governança e nos marcos:** explicitar escopo mínimo, critérios
  de aceite, dependências, responsáveis, riscos, requisitos de segurança e
  condições para uma entrega/release. Esses controles dão transparência sem
  presumir que todos os detalhes técnicos podem ser previstos de antemão.

Uma abordagem puramente preditiva seria frágil para as integrações ainda sujeitas
a validação; uma abordagem sem planejamento ou critérios definidos também
deixaria riscos e progresso pouco visíveis. O modelo híbrido mantém direção e
controle, mas reserva espaço para aprender e corrigir a rota.

## Ciclo de trabalho proposto

1. **Enquadrar:** registrar objetivo, usuário beneficiado, critérios de aceite,
   dependências, riscos e responsável de cada issue no Jira. Dividir entregas
   grandes em tarefas que possam ser verificadas independentemente.
2. **Investigar quando houver incerteza:** criar uma tarefa curta de experimento
   (spike), definir uma hipótese e um resultado observável; por exemplo,
   confirmar a comunicação cliente → Nginx → API em Compose antes de fechar a
   configuração de produção.
3. **Construir em incrementos pequenos:** implementar uma fatia funcional,
   incluir testes automatizados e revisar o código antes de avançar para a
   próxima dependência.
4. **Observar e adaptar:** verificar testes, healthchecks, logs com request ID,
   respostas da API e feedback de quem usa o sistema. Atualizar status,
   responsáveis, bloqueios e critérios de aceite no Jira.
5. **Entregar com critérios explícitos:** concluir uma issue quando os critérios
   de aceite e testes forem satisfeitos; concluir um marco somente após validar
   a integração relevante, registrar riscos residuais e confirmar o plano de
   retorno/rollback aplicável.

## Aplicação ao backlog atual

| Trabalho | Tratamento recomendado | Evidência de conclusão |
|---|---|---|
| Cache Redis e invalidação | Incremento ágil com testes de HIT/MISS e mutação | Testes automatizados e cabeçalho `X-Cache` |
| Redis Pub/Sub | Experimento/incremento observável | Logs de publicação e consumo correlacionados por `eventId` |
| Nginx e Compose | Tarefa técnica com validação integrada | Serviços saudáveis e chamadas web/API passando pelo proxy |
| DTOs, logs e erros | Incrementos por contrato, sem migração global de uma vez | Build, testes e respostas de erro com `requestId` |
| Importação e gestão Jira | Planejamento e acompanhamento explícitos | Issues importadas, responsáveis reais e status alinhados ao workflow da equipe |

O backlog e os critérios podem ser consultados em
[`.jira/issues.csv`](../.jira/issues.csv) e no
[guia de importação Jira](../.jira/README.md). A existência desses arquivos não
comprova, por si só, que as issues já foram importadas ou atribuídas numa
instância Jira.

## Limites e revisão da análise

Esta classificação é uma hipótese de trabalho baseada no repositório e nas
integrações identificadas; não substitui conversa com usuários, equipe ou
stakeholders. Deve ser revista após uma validação ponta a ponta no Compose e
quando houver dados de uso e feedback. Se as relações entre causa e efeito se
tornarem repetíveis, partes do trabalho podem migrar para procedimentos
predeterminados; se surgir uma interrupção crítica, a resposta operacional
imediata pode ser tratada temporariamente no domínio Caótico, seguida de análise
e aprendizagem.
