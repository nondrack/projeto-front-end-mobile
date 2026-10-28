# Cinema: execução com Docker Compose

## Documentação do projeto

- [Análise Cynefin e abordagem de gestão](docs/analise-cynefin.md)
- [Plano de ciclo de vida, PM Canvas, backlog e releases](docs/plano-ciclo-vida.md)
- [Documentação arquitetural: C4, ADRs, DDD, qualidade, API e runbook](docs/architecture/README.md)
- [Backlog e guia Jira](.jira/README.md)

O Docker Compose orquestra MySQL, Redis, API, aplicações web e mobile e o Nginx
como ponto de entrada HTTP/HTTPS. O Nginx encaminha `/` para o frontend e
`/api/` para a API, removendo o prefixo `/api` antes do encaminhamento. Assim, a
aplicação web usa o proxy reverso no mesmo host e não precisa conhecer o endereço
interno do backend.

## Iniciar

1. Copie `.env.example` para `.env` e altere as senhas locais.
2. Configure `cinema.local` para apontar a `127.0.0.1` no arquivo hosts do
   sistema operacional. No Windows, o arquivo é
   `C:\Windows\System32\drivers\etc\hosts`.
3. Inicie os serviços:

   ```powershell
   docker compose up --build
   ```

Abra `https://cinema.local`. O certificado em `certs/` é fornecido para o
ambiente local e pode gerar aviso de confiança no navegador. HTTP na porta 80
redireciona para HTTPS na porta 443; mantenha essas portas disponíveis no host.

MySQL e Redis têm verificações de saúde. A API só inicia após ambos estarem
prontos; Nginx aguarda a API e o frontend. MySQL persiste dados no volume
`mysql-data`; o SQL de inicialização é aplicado apenas quando o volume é criado
pela primeira vez.

Para acompanhar o proxy e as mensagens dos serviços:

```powershell
docker compose ps
docker compose logs -f nginx backend frontend
```

O endpoint do backend também permanece disponível na porta `BACKEND_PORT`
(padrão `3000`) para os clientes mobile no ambiente de desenvolvimento. MySQL
usa `MYSQL_PORT` (padrão `3307`) no loopback do host; Redis não é publicado no
host e é acessível somente pela rede do Compose.
