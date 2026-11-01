# RepoMentor

Explore repositórios públicos, entenda issues e prepare uma contribuição com contexto e evidências.

Projeto de código aberto sob [MIT](LICENSE), com React/Vite e Python/FastAPI. O Gemma 4 gera orientações que precisam de revisão humana. O app não altera código, não executa testes dos repositórios consultados e não abre PRs automaticamente.

## O que funciona

- Cadastro por `organização/repositório` ou URL pública GitHub, salvo neste navegador, sem conta ou sincronização.
- Consulta de até 30 issues abertas, excluindo PRs, com estados para ausência de issues e consultas limitadas.
- Visão geral mesmo sem issues, análise individual e guia com passos e sugestões de testes.
- Provedores `google-ai` (chave AI Studio) e `vertex-ai` (endpoint próprio e autenticação Google Cloud), selecionados explicitamente.
- Tema claro/escuro, interface PT/EN e idioma enviado ao Gemma. Textos originais do GitHub não são traduzidos automaticamente.

Confira [evidências no código e roadmap](docs/ROADMAP.md), [API](docs/API.md) e [validação](docs/VALIDATION.md). Ter um adaptador implementado não comprova acesso ao provedor na sua conta. A consulta GitHub funciona sem IA; análises precisam de modelo, credenciais e quota válidos.

## Começar localmente sem chave de IA

Use Git, Python **3.13** e Node.js **22.13+ na linha 22, ou 24**. A CI usa Python 3.13 e Node 22. Os comandos abaixo não instalam o modelo.

```powershell
git clone https://github.com/FloraRosaPupo/repomentor.git
cd repomentor
python -m venv backend/.venv
.\backend\.venv\Scripts\python.exe -m pip install -r backend/requirements-lock.txt
npm.cmd ci --prefix frontend
if (!(Test-Path .env)) { Copy-Item .env.example .env }
```

Em Linux/macOS, use `python3`, `backend/.venv/bin/python` e `npm` no lugar dos executáveis Windows. Não sobrescreva um `.env` existente nem use chaves da mantenedora.

Terminal 1, a partir da raiz:

```powershell
cd backend
.\.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

Terminal 2, a partir da raiz:

```powershell
cd frontend
npm.cmd run dev
```

Abra **http://127.0.0.1:5174**. API: **http://127.0.0.1:8000/docs**. Mantenha ambos os processos ativos; o frontend encaminha `/api` ao backend. A consulta GitHub precisa de internet e está sujeita a limites. `GITHUB_TOKEN` próprio de leitura é opcional.

**App local não significa inferência local.** Com AI Studio, a análise é enviada ao Google e usa a quota da chave configurada. Inferência no computador ainda é uma [proposta na issue #7](https://github.com/FloraRosaPupo/repomentor/issues/7). Para contribuir sem IA paga, mantenha credenciais vazias e use os testes simulados.

## Habilitar o Gemma (opcional)

| Opção | Configuração | Estado |
| --- | --- | --- |
| AI Studio | `GEMMA_PROVIDER=google-ai`, `GEMMA_MODEL_ID=gemma-4-26b-a4b-it`, `GOOGLE_AI_API_KEY` própria | Adaptador implementado; chamadas reais registradas em desenvolvimento |
| Vertex AI | `GEMMA_PROVIDER=vertex-ai`, projeto, região, endpoint, modelo e ADC | Adaptador implementado; requer infraestrutura e acesso próprios |
| Inferência local | Ainda não disponível | [Issue #7](https://github.com/FloraRosaPupo/repomentor/issues/7) |

Leia [variáveis e autenticação](docs/ENVIRONMENT.md). A chave AI Studio não substitui ADC no adaptador Vertex. Nenhum recurso pago é provisionado automaticamente e não há fallback silencioso entre provedores.

## Testar sem consumir AI Studio

Os testes usam fixtures e transportes controlados, sem chamar o modelo real. Na raiz:

```powershell
cd backend
.\.venv\Scripts\python.exe -m ruff check .
.\.venv\Scripts\python.exe -m ruff format --check .
.\.venv\Scripts\python.exe -m pytest -q
cd ../frontend
npm.cmd run lint
npm.cmd test
npm.cmd run build
```

A instalação inicial baixa dependências; testes simulados não comprovam qualidade ou disponibilidade do Gemma. A [CI](.github/workflows/ci.yml) roda esses checks em PRs e na `main`. Testes reais são separados e podem consumir quota/créditos.

## Contribuir e acompanhar

- [Como contribuir](CONTRIBUTING.md): fork, branch, PR, testes e convenções.
- [Governança](GOVERNANCE.md), [Código de Conduta](CODE_OF_CONDUCT.md), [suporte](SUPPORT.md) e [segurança](SECURITY.md).
- [Roadmap e issues](docs/ROADMAP.md): propostas com critérios de aceite.
- [API](docs/API.md), [configuração](docs/ENVIRONMENT.md) e [provedores Google](docs/GOOGLE_CLOUD.md).
- [Validação](docs/VALIDATION.md), [plano de testes](docs/TEST_PLAN.md) e [experimentos](docs/GEMMA_EXPERIMENTS.md).
- [Deploy Vercel](docs/VERCEL.md), opcional; desenvolver e consultar estes guias não depende dele.
- [Plano original](docs/IMPLEMENTATION_PLAN.md), mantido como histórico, não como comprovação de entregas.
## Limites e licença

O contexto é limitado e selecionado por heurísticas. Um caminho verificado não prova a explicação do modelo. Não há autenticação de usuários ou limites distribuídos de consumo implementados. Instâncias públicas com chaves pagas precisam de controles adicionais; veja [SECURITY.md](SECURITY.md).

O código está sob [MIT](LICENSE). Modelos, dependências e materiais de terceiros mantêm suas próprias licenças. O projeto não é afiliado ao GitHub, Google ou Meteor. Não há garantia de inscrição, certificação ou elegibilidade em eventos.


## Progresso informado pela equipe

O Meteor foi utilizado como reposit?rio de teste. A equipe registrou na `main` a revis?o de pelo menos tr?s issues reais e a valida??o de acesso ao Gemma no Google Cloud. Os detalhes dessa revis?o n?o constam no registro de valida??o; as evid?ncias documentadas distinguem chamadas pelo AI Studio de valida??o de endpoint pr?prio Vertex AI. Consulte [valida??o](docs/VALIDATION.md).

Gravar a demonstra??o e preparar a primeira release continuam como pr?ximos passos.

## Participa??o no evento

Hacktoberfest Hack Day S?o Jos? dos Campos: a categoria pretendida ? Best Use of Gemma. Esta indica??o n?o comprova inscri??o ou elegibilidade.

## Autores

| Integrante | GitHub |
| --- | --- |
| Ana Claudia | [Ana Claudia Nogueira](https://github.com/anacnogueira) |
| Daniel Dias | [DanielDPereira](https://github.com/DanielDPereira) |
| Flora Rosa Pupo | [Flora Rosa Pupo](https://github.com/florarosapupo) |
| Lucas Roberto | [Lucas Roberto](https://github.com/LucasR022) |
