# RepoMentor

Encontre sua primeira contribuição open source com contexto, evidências e um caminho para começar.

**Status: prévia local implementada. React e FastAPI executam; issues reais são consultadas. O adaptador Gemma 4/Vertex AI está implementado e testado com transporte simulado, mas a inferência real aguarda projeto, região e endpoint configurados.**

## A ideia

O RepoMentor ajuda desenvolvedores a explorar issues e a começar a contribuir com projetos open source. Cadastre qualquer repositório público do GitHub pela URL ou por `organização/repositório`. A interface consulta issues reais e permite solicitar análise e guia de contribuição quando o Gemma estiver configurado.

Os repositórios cadastrados ficam salvos neste navegador, sem conta ou sincronização entre pessoas. First Contributions, freeCodeCamp e VS Code aparecem como sugestões por perfil, não como ranking. O Meteor permanece um exemplo possível, não um alvo fixo.

O adaptador do Gemma 4 solicita explicações de arquitetura, dificuldade e áreas para investigar. Respostas são validadas com Pydantic e caminhos sem comprovação são removidos. Recomendações exigem revisão humana; testes simulados não comprovam qualidade do modelo.

## Fluxo planejado

1. Cadastrar ou selecionar um repositório público e consultar suas issues abertas.
2. Selecionar documentação e arquivos relevantes, com limites de tamanho.
3. Enviar o contexto ao Gemma 4 no Google Cloud.
4. Validar a resposta e os caminhos citados.
5. Exibir recomendações e gerar um guia para a issue escolhida.

## Stack escolhida

| Camada | Tecnologia |
| --- | --- |
| Interface | React, Vite, JavaScript/JSX e CSS |
| Backend | Python 3.12+, FastAPI, Pydantic e HTTPX |
| IA | Gemma 4 em endpoint próprio do Vertex AI, Google Cloud |
| Dados | GitHub REST API, somente leitura |
| Testes | Pytest, Vitest e React Testing Library |

A variante inicial candidata é Gemma 4 26B A4B. A seleção final depende de uma chamada real, qualidade, latência, região, quotas e orçamento. Modelo e endpoint serão configuráveis. Não haverá substituição silenciosa por Gemini ou outro modelo.

O processamento será em nuvem: o contexto público selecionado do repositório será enviado ao Google Cloud. Credenciais ficam exclusivamente no backend.

## Escopo

O MVP inclui cadastro local de repositórios públicos, consulta de issues, análise arquitetural, classificação explicada, verificação de referências e guias de contribuição. Login, sincronização de cadastros, repositórios privados, execução de código, edição de arquivos e abertura automática de PRs ficam fora da primeira versão. A coleta genérica é heurística e precisa ser avaliada em cada stack.

## Documentação

- [Configurar tokens e variáveis de ambiente](docs/ENVIRONMENT.md)
- [Código de Conduta](CODE_OF_CONDUCT.md)

- [Plano de implementação e specs](docs/IMPLEMENTATION_PLAN.md)
- [Decisão Google Cloud + Gemma 4](docs/GOOGLE_CLOUD.md)
- [Plano de testes e aceite](docs/TEST_PLAN.md)
- [Registro de experimentos](docs/GEMMA_EXPERIMENTS.md)
- [Contrato da API e limites](docs/API.md)
- [Validação desta implementação](docs/VALIDATION.md)
- [Como contribuir](CONTRIBUTING.md)

## Executar localmente

Requisitos: Python 3.13 e Node.js 22.13+ (ou Node 24). Os exemplos abaixo usam PowerShell, a partir da raiz do repositório.

```powershell
python -m venv backend/.venv
.\backend\.venv\Scripts\python.exe -m pip install -r backend/requirements-lock.txt
cd frontend
npm ci
cd ..
Copy-Item .env.example .env
```

Não sobrescreva um `.env` existente. Para listar issues, não é necessário configurar o Google Cloud. `GITHUB_TOKEN` é opcional e aumenta o limite de consultas; mantenha-o somente no backend.

Terminal 1 — backend:

```powershell
cd backend
.\.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

Terminal 2 — frontend:

```powershell
cd frontend
npm run dev
```

Acesse **http://127.0.0.1:5174**. Documentação da API: **http://127.0.0.1:8000/docs**. O proxy do Vite encaminha `/api` para o backend; nenhum token do provedor é enviado ao navegador.

No Linux/macOS, use `python3` e `backend/.venv/bin/python` nos comandos equivalentes.

## Habilitar Gemma 4

1. Implante uma variante Gemma 4 em um endpoint Vertex AI compatível com Chat Completions, pelo Model Garden. Esta aplicação não cria infraestrutura automaticamente.
2. Preencha no `.env`: `GOOGLE_CLOUD_PROJECT`, `GOOGLE_CLOUD_LOCATION`, `VERTEX_AI_ENDPOINT_ID` e o identificador exato em `GEMMA_MODEL_ID`.
3. Se o endpoint for dedicado, preencha `VERTEX_AI_ENDPOINT_HOST` com seu `dedicatedEndpointDns`, sem protocolo ou caminho.
4. Autentique o desenvolvimento com `gcloud auth application-default login`. No Windows, use `gcloud.cmd` caso o PowerShell bloqueie o script `.ps1`.
5. Garanta a permissão `aiplatform.endpoints.predict` e reinicie o backend.

Não confunda `configured=true` com conexão validada. A primeira análise real confirmará autenticação, contrato e modelo implantado. Não há fallback para Gemini, Ollama ou resultados fictícios.

## Qualidade

```powershell
cd backend
.\.venv\Scripts\python.exe -m ruff check .
.\.venv\Scripts\python.exe -m ruff format --check .
.\.venv\Scripts\python.exe -m pytest -q
cd ../frontend
npm run lint
npm test
npm run build
```

A CI executa essas verificações em pull requests e na `main`, sem credenciais reais.

## Próximas entregas

- [x] Criar a base documental do repositório.
- [x] Inicializar frontend e backend com endpoint de saúde.
- [x] Validar acesso ao Gemma 4 no Google Cloud.
- [x] Implementar cadastro local, consulta de issues e coleta de contexto de repositórios públicos. Repositorio utilizado para teste - [Meteor](https://github.com/meteor/meteor)
- [x] Implementar análise com evidências e guia de contribuição (integração real pendente).
- [x] Executar testes e revisar pelo menos três issues reais.
- [ ] Gravar demonstração e preparar a primeira release.

Nesta prévia, a análise é por issue selecionada; classificação em lote fica para depois. Backend local, sem autenticação de usuários ou proteção distribuída contra abuso: não expor diretamente na internet.

## Participação no evento

Hacktoberfest Hack Day São José dos Campos: A categoria pretendida é Best Use of Gemma.

## Licença

[MIT](LICENSE). O projeto não é afiliado ao Meteor ou ao Google. Modelos, dependências e materiais consultados mantêm suas próprias licenças.

## Authors

| Integrante       | GitHub                                               |
| ---------------- | ---------------------------------------------------- |
| Ana Claudia    | [Ana Claudia Nogueira](https://github.com/anacnogueira)|
| Daniel Dias      | [DanielDPereira](https://github.com/DanielDPereira) |
| Flora Rosa Pupo | [Flora Rosa Pupo](https://github.com/florarosapupo)  |
| Lucas Roberto   | [Lucas Roberto](https://github.com/LucasR022)       |
