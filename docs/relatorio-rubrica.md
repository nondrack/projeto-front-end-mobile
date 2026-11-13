# Relatório de atendimento à rubrica — Projeto Cinema

**Objetivo:** resumir os artefatos de gestão existentes e orientar a demonstração
do projeto conforme os critérios da rubrica. Este relatório não substitui
evidências da execução real no Jira nem garante uma nota específica.

## 1. Gestão do trabalho e progresso via Jira

### Preparação existente

- O backlog de importação está em [`.jira/issues.csv`](../.jira/issues.csv), com
  7 itens: 2 Stories, 4 Tasks e 1 Bug. Os itens têm descrições, prioridade,
  status inicial, labels e versões candidatas.
- O [guia Jira](../.jira/README.md) descreve importação, acompanhamento e
  evidências a apresentar.
- As issues estão preparadas com a conta indicada pela equipe. A associação
  precisa ser confirmada no Jira após a importação.

### Passo a passo para concluir e demonstrar

1. Na importação CSV, mapeie `Summary` para o campo existente **Resumo**
   (não crie um campo novo), e mapeie tipo, descrição, prioridade, status,
   responsável, labels e versão.
2. Confira a prévia e importe as 7 issues para o espaço de software do projeto.
   Se o Jira não aceitar o responsável ou algum status, importe sem esse
   mapeamento e corrija os valores no próprio Jira.
3. Abra o board e mostre ao menos uma Story, uma Task e o Bug, com descrição,
   prioridade, responsável e versão candidata.
4. Atualize uma issue conforme o trabalho realmente avançar. Demonstre uma
   transição pelo workflow e registre comentário ou evidência dos critérios de
   aceite. Só use **Concluído** quando o aceite tiver sido verificado.
5. Capture o board, os detalhes das issues e o histórico da transição. O CSV,
   isoladamente, não prova que a importação ou as transições ocorreram.

**Situação da evidência:** a importação ainda não foi confirmada. A última tela
compartilhada mostrou erro de resumo obrigatório; é necessário mapear `Summary`
para o campo existente **Resumo** e concluir as etapas seguintes.

## 2. Contexto do projeto com Cynefin e abordagem

O documento [Análise Cynefin](./analise-cynefin.md) classifica o projeto como
predominantemente **Complexo**: aplicações web e mobile, API, MySQL, Redis e
proxy têm integrações e efeitos que precisam ser observados durante a
implementação. Há tarefas **Complicadas**, que exigem conhecimento técnico, e
tarefas **Simples**, executáveis por procedimentos conhecidos. Não há evidência
de uma crise que justifique o domínio Caótico.

A abordagem escolhida é **híbrida**: governança preditiva leve para escopo,
riscos, marcos e critérios de release; execução ágil para construir incrementos,
validar integrações e adaptar o backlog com feedback.

**Demonstração:** explicar a classificação com exemplos do sistema, justificar
por que não é totalmente preditiva e mostrar como ciclos curtos, testes
integrados e revisão do backlog respondem à incerteza.

## 3. Ciclo de vida e planejamento

O [plano do ciclo de vida](./plano-ciclo-vida.md) contém PM Canvas, papéis,
responsabilidades, backlog priorizado, critérios de aceite, Definition of
Ready/Done e versões candidatas.

1. **Iniciação:** alinhar problema, usuários, escopo mínimo, stakeholders e
   riscos; aprovar o marco M0.
2. **Planejamento:** ordenar histórias, detalhar aceite e dependências, definir
   objetivo do incremento, capacidade e evidências.
3. **Execução:** entregar incrementos pequenos, revisar código, testar e
   atualizar as issues.
4. **Monitoramento e controle:** acompanhar status, testes, bloqueios, riscos e
   mudanças; registrar decisões e reordenar o backlog.
5. **Encerramento:** revisar o incremento, registrar aceite, notas, limitações,
   riscos residuais e lições aprendidas.

Os papéis propostos são patrocinador/responsável de negócio, Product Owner,
gerente de projeto/Scrum Master, analista, equipe de desenvolvimento, QA e
infraestrutura/operação. São funções; nomes e disponibilidade devem ser
confirmados pela equipe.

As versões `0.1.0`, `0.2.0`, `0.3.0` e `1.0.0` são **candidatas**, não releases
que já tenham sido publicadas. Para demonstrar o backlog ágil, apresentar
histórias priorizadas e seus critérios observáveis; para demonstrar releases,
mostrar versões configuradas no Jira somente depois de criá-las e associar os
itens.

## Checklist antes da apresentação

- [ ] Importação concluída e 7 issues visíveis no projeto Jira.
- [ ] Tipos Story, Task e Bug e campos principais conferidos.
- [ ] Responsáveis reais confirmados; status alinhados ao workflow.
- [ ] Uma transição real e uma evidência de aceite registradas.
- [ ] Capturas do board e do histórico preparadas, sem dados sensíveis.
- [ ] Cynefin, abordagem híbrida, PM Canvas, fases, papéis e releases explicados.

**Conclusão:** a documentação cobre os fundamentos de Cynefin e planejamento.
O principal item pendente para demonstrar integralmente a rubrica é concluir e
registrar o uso efetivo do Jira. A nota final depende dos critérios e da
avaliação do docente; nenhum relatório pode garanti-la.
