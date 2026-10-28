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
não force issues para `Done` sem revisar os critérios de aceite. A task de
validação do Compose permanece `In Progress` porque ainda precisa de uma
execução real com Docker.

As versões candidatas (`0.2.0`, `0.3.0`, `1.0.0`) são propostas, detalhadas no
[plano de ciclo de vida](../docs/plano-ciclo-vida.md), e não significam que uma
versão já foi criada ou publicada. Crie as versões correspondentes no projeto
Jira ou mapeie `Fix Version/s` para o campo de release disponível.

## Atribuição e acompanhamento

O CSV deixa `Assignee` vazio intencionalmente: os usuários do Jira e seus
account IDs não estão disponíveis neste repositório. Depois da importação,
atribua cada issue a um membro real, revise prioridade e sprint/versão e use as
transições do workflow para refletir o progresso. Atualize a descrição ou
adicione comentário quando um critério de aceite mudar; use os labels para
filtrar áreas (`backend`, `frontend`, `infra`, `qa`, `redis`).

## Ligação com o código

Ao trabalhar numa issue, inclua a chave Jira em nomes de branch, commits e pull
requests (por exemplo `CINEMA-123`) para a integração de desenvolvimento do
Jira/GitHub reconhecer a atividade. Substitua `CINEMA` pela chave real do
projeto. O CSV é um artefato de importação: ele não cria issues, usuários,
atribuições ou transições no Jira automaticamente.
