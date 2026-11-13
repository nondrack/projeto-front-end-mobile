# Backlog Jira do projeto Cinema

O arquivo `issues.csv` contém um backlog inicial de stories, tasks e um bug
baseado nas melhorias implementadas no repositório. Ele pode ser importado em
um projeto Jira existente; a chave do projeto deve ser selecionada durante a
importação.

## Importar

1. Abra o importador CSV disponível para o projeto Jira (pode exigir permissão
   de administrador).
2. Selecione `.jira/issues.csv` e escolha o projeto de destino.
3. Mapeie `Summary`, `Issue Type`, `Description`, `Priority`, `Status`,
   `Assignee`, `Labels` e `Fix Version/s` para os campos Jira equivalentes.
4. Associe `Story`, `Task` e `Bug` aos tipos de issue habilitados no projeto.
   Se `Status` não puder ser importado, crie as issues em Backlog/To Do e faça
   as transições após a importação.
5. Valide algumas issues antes de concluir a importação em lote.

Os status exportados (`To Do`, `In Progress`, `Done`) são valores iniciais e
podem não existir no workflow do seu projeto. Mapeie-os aos status disponíveis;
não mantenha issues em `Done` sem revisar os critérios de aceite. A task de
orquestração está `In Progress`; a validação ponta a ponta com Docker está
`To Do` até que a execução e suas evidências sejam registradas.

As versões candidatas (`0.2.0`, `0.3.0`, `1.0.0`) são propostas, detalhadas no
[plano de ciclo de vida](../docs/plano-ciclo-vida.md), e não significam que uma
versão já foi criada ou publicada. Crie as versões correspondentes no projeto
Jira ou mapeie `Fix Version/s` para o campo de release disponível.

## Atribuição e acompanhamento

O CSV está preenchido com a conta Jira informada pela equipe para as sete
issues. Durante a importação, confira se o Jira reconhece a conta e a associa ao
usuário correto; se não reconhecer, ajuste `Assignee` para o identificador
aceito pela instância. A atribuição é uma configuração inicial, não evidência
de que a pessoa já aceitou ou iniciou o trabalho. Revise prioridade, sprint e
versão com a equipe. Atualize a descrição ou adicione comentário quando um
critério de aceite mudar; use os labels para filtrar áreas (`backend`,
`frontend`, `infra`, `qa`, `redis`).

## Demonstração para a rubrica

Use o board do projeto para demonstrar o fluxo, e não apenas a existência do
CSV:

1. Abra as issues importadas e mostre exemplos dos três tipos: Story (cache de
   catálogo), Task (validação da stack Compose) e Bug (chamada web pelo proxy).
   Confira descrição, prioridade, labels e versão candidata.
2. Confira o responsável real em cada issue. O CSV prepara inicialmente as
   sete issues para a conta informada; se a equipe dividir o trabalho por
   competência (backend/Redis, infraestrutura, frontend ou QA), ajuste as
   atribuições no Jira conforme o acordo da equipe.
3. Mostre a transição de uma issue selecionada pelo workflow configurado, por
   exemplo `To Do → In Progress → Review/Test → Done`. Adapte os nomes às
   colunas reais do board; `Done` requer critérios de aceite verificados e
   evidência registrada na issue.
4. No daily/review, atualize status, bloqueio e comentário de progresso. Se o
   escopo ou aceite mudar, registre a decisão e atualize a issue antes de
   encerrar o trabalho.

Para evidenciar a demonstração, guarde imagens ou links acessíveis mostrando:

- o board com colunas e issues distribuídas pelos status;
- detalhes de uma Story, uma Task e um Bug, incluindo prioridade e responsável;
- histórico de uma transição de status e comentário/evidência de aceite;
- versões/releases configuradas e seus itens associados, se esse recurso
  estiver habilitado no projeto.

O CSV é somente a carga inicial e seus status não comprovam transições feitas
por pessoas no Jira. Complete esta etapa depois da importação, usando o
workflow, as contas e as versões reais do projeto. Evite publicar dados pessoais
ou capturas com informações sensíveis.

## Ligação com o código

Ao trabalhar numa issue, inclua a chave Jira em nomes de branch, commits e pull
requests (por exemplo `CINEMA-123`) para a integração de desenvolvimento do
Jira/GitHub reconhecer a atividade. Substitua `CINEMA` pela chave real do
projeto. O CSV é um artefato de importação: ele não cria issues, usuários,
atribuições ou transições no Jira automaticamente.
