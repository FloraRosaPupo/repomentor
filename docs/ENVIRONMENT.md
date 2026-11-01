# Variáveis e autenticação

O [backend](../backend/app/config.py) lê `.env` na raiz ou variáveis do processo. O frontend não precisa de tokens. Copie [`.env.example`](../.env.example) apenas quando não existir `.env`; reinicie o backend após mudar valores.

## Sem IA

Deixe as credenciais vazias. Cadastro e consulta pública do GitHub continuam disponíveis; geração fica desabilitada. Testes automatizados usam fixtures e não exigem chave real.

`GITHUB_TOKEN` é opcional para leitura pública e deve pertencer a quem executa a instância. Use permissões mínimas e nenhuma permissão de escrita para este app. Não solicite nem compartilhe o token da mantenedora.

## Google AI Studio

```dotenv
GEMMA_PROVIDER=google-ai
GEMMA_MODEL_ID=gemma-4-26b-a4b-it
GOOGLE_AI_API_KEY=
```

Preencha a chave no seu `.env` ou no gerenciador de segredos da hospedagem. A integração usa Gemma pela Gemini API; não troca o modelo por Gemini. O código aceita `gemma-4-26b-a4b-it` e `gemma-4-31b-it` nesta opção. Disponibilidade, acesso e quota dependem da conta do provedor.

Não é necessário endpoint Vertex nem login ADC nessa opção. A inferência continua remota mesmo com React/FastAPI no computador: solicitações usam a quota e eventual faturamento da chave. Credenciais não devem ter prefixo `VITE_`.

Referência: [Gemma pela Gemini API](https://ai.google.dev/gemma/docs/core/gemma_on_gemini_api).

## Vertex AI

| Variável | Valor |
| --- | --- |
| `GEMMA_PROVIDER` | `vertex-ai` (também é o padrão do exemplo) |
| `GOOGLE_CLOUD_PROJECT` | ID do projeto, não nome de exibição |
| `GOOGLE_CLOUD_LOCATION` | Região do endpoint |
| `VERTEX_AI_ENDPOINT_ID` | ID do endpoint implantado, não URL |
| `GEMMA_MODEL_ID` | Identificador exato do Gemma 4 servido pelo endpoint |
| `VERTEX_AI_ENDPOINT_HOST` | Opcional: `dedicatedEndpointDns`, sem protocolo nem caminho |

Esta opção exige endpoint compatível com Chat Completions, API/permissões e recursos na conta Google Cloud. O projeto não cria essa infraestrutura. Avalie custos e quota antes de implantar.

Para autenticação local no PowerShell, após instalar o Google Cloud CLI:

```powershell
gcloud.cmd config set project SEU_PROJECT_ID
gcloud.cmd auth application-default login
gcloud.cmd auth application-default set-quota-project SEU_PROJECT_ID
```

A identidade precisa de `aiplatform.endpoints.predict`. A chave AI Studio não substitui essa autenticação no adaptador atual. Na hospedagem, o login local não é transferido; configure identidade de runtime/credenciais ADC compatíveis. Federação de identidade na Vercel ainda não está configurada por este projeto. `GOOGLE_APPLICATION_CREDENTIALS`, quando usado pelo Google Auth, recebe caminho de arquivo, não um JSON colado como texto.

Referência: [ADC local](https://cloud.google.com/docs/authentication/set-up-adc-local-dev-environment).

## Controles comuns

| Variável | Padrão / efeito |
| --- | --- |
| `REQUEST_TIMEOUT_SECONDS` | `120`, entre 5 e 300; a operação completa também tem teto de 240 segundos |
| `ENABLE_ARCHITECTURE_ANALYSIS` | `true`; habilita visão geral e participa da habilitação da análise de issues |
| `ENABLE_ISSUE_CLASSIFICATION` | `true`; necessária, junto à arquitetura, para analisar uma issue |
| `ENABLE_CONTRIBUTION_GUIDE` | `true`; habilita guias |
| `ENABLE_CACHE` | `true`; cache em memória por processo, não distribuído |

Não há provedor local/Ollama aceito atualmente. A implementação está proposta na [issue #7](https://github.com/FloraRosaPupo/repomentor/issues/7).

## Hospedagem e verificação

Cadastre variáveis no ambiente correto (desenvolvimento, preview ou produção) e reinicie/republique para aplicá-las. Mantenha segredos no backend; não copie `.env` para assets públicos ou para o Git.

Em `/api/health`, `configured=true` indica preenchimento válido, não conectividade. `connection_verified` não acompanha automaticamente o histórico de chamadas. Uma geração real valida acesso naquele momento, pode consumir quota e não garante disponibilidade futura.

Verifique separadamente autenticação, quota, modelo indisponível e timeout. Consulte [suporte](../SUPPORT.md), [segurança](../SECURITY.md) e [deploy Vercel](VERCEL.md).
