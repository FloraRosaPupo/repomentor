# Configuração do ambiente

O backend lê `.env` na raiz do repositório. O frontend não precisa de tokens.

## Execução local

Na raiz, copie o exemplo apenas se ainda não existir um `.env`:

```powershell
if (!(Test-Path .env)) { Copy-Item .env.example .env }
```

| Variável | Como preencher |
| --- | --- |
| `GITHUB_TOKEN` | Opcional. Token pessoal GitHub para aumentar a cota das consultas públicas. Pode ficar vazio inicialmente. |
| `GOOGLE_CLOUD_PROJECT` | ID do projeto no Google Cloud, não o nome de exibição. |
| `GOOGLE_CLOUD_LOCATION` | Região do endpoint implantado no Vertex AI. |
| `VERTEX_AI_ENDPOINT_ID` | ID do endpoint encontrado em Vertex AI → Online prediction/Endpoints. Não é uma URL. |
| `VERTEX_AI_ENDPOINT_HOST` | Opcional, somente o `dedicatedEndpointDns` de um endpoint dedicado, sem protocolo ou caminho. |
| `GEMMA_MODEL_ID` | Identificador exato da variante Gemma 4 servida pelo endpoint; não invente uma tag. |
| `REQUEST_TIMEOUT_SECONDS` | Pode manter `120`. |
| `ENABLE_ARCHITECTURE_ANALYSIS` | `true` habilita arquitetura e visão geral sem issue. |
| `ENABLE_ISSUE_CLASSIFICATION` | `true` habilita classificação de issues. |
| `ENABLE_CONTRIBUTION_GUIDE` | `true` habilita guias. |
| `ENABLE_CACHE` | `true` habilita cache temporário por processo. |

### Token GitHub

GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token. Dê um nome, defina validade e mantenha acesso somente a repositórios públicos, sem permissões de escrita. Esse token já permite leitura de repositórios públicos. Copie o valor diretamente para `GITHUB_TOKEN` no seu `.env`; não envie por chat ou commit.

### Autenticação Google

O aplicativo usa Application Default Credentials (ADC), não uma chave do Google AI Studio. No PowerShell:

```powershell
gcloud.cmd config set project SEU_PROJECT_ID
gcloud.cmd auth application-default login
gcloud.cmd auth application-default set-quota-project SEU_PROJECT_ID
```

A conta autenticada precisa de `aiplatform.endpoints.predict` no endpoint. O projeto precisa da API Vertex AI habilitada e de um modelo Gemma 4 implantado em endpoint compatível com Chat Completions. Criar esse endpoint envolve infraestrutura e custos; preencher o `.env` não o cria.

Reinicie o backend e consulte `/api/health`. `configured=true` confirma apenas preenchimento; uma análise real valida credenciais, permissões e compatibilidade do endpoint.

## Vercel

Em Project → Settings → Environment Variables, cadastre as mesmas variáveis para Preview e/ou Production e faça um novo deploy. Mantenha `GITHUB_TOKEN` como segredo e nunca use prefixo `VITE_` para credenciais.

O login ADC feito no seu computador não é transferido para a Vercel. A autenticação Google em produção exige configuração adicional: preferir Workload Identity Federation com OIDC da Vercel e credenciais ADC compatíveis no backend. Essa federação ainda não foi configurada neste projeto. Não cole um JSON inteiro em `GOOGLE_APPLICATION_CREDENTIALS`: essa variável espera um caminho de arquivo acessível ao processo.

Até configurar a autenticação de produção, a publicação permite explorar repositórios e issues, mas não confirma inferência real do Gemma. Mantenha o preview protegido antes de habilitar uma integração paga; o limite de concorrência e o cache atuais são por processo, não globais.

## Fontes

- [Tokens pessoais do GitHub](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens)
- [ADC para desenvolvimento local](https://cloud.google.com/docs/authentication/set-up-adc-local-dev-environment)
- [Variáveis de ambiente na Vercel](https://vercel.com/docs/environment-variables)
- [OIDC na Vercel](https://vercel.com/docs/oidc)
