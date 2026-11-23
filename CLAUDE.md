# RepoMentor

App que explora repositórios públicos do GitHub e issues e gera orientações de contribuição com Gemma 4. As orientações precisam de revisão humana. **Não** altera código, não roda testes dos repositórios consultados e não abre PRs. Licença MIT. Produção: https://repomentor-alpha.vercel.app

## Arquitetura
```
Navegador (React SPA) ──fetch /api/*──> FastAPI (backend/app) ──> GitHub REST API
        ^                                    └──> Gemma 4: google-ai (AI Studio) | vertex-ai (endpoint)
        └── servido pelo próprio FastAPI em produção (index.py + public/)
```
**Backend `backend/app/`** (Python 3.13):
- `main.py`: `create_app(settings, transport, token_provider)`, uma factory com injeção para testes. Rotas:
  - `GET /api/health`, `GET /api/issues?repository=org/repo`
  - `POST /api/analyze`, `POST /api/repository/analyze`, `POST /api/issues/{n}/guide`
  - As três rotas POST passam por `run(repository, number, mode, language)`.
- Cache em memória em `app.state.cache`: TTL de 600 s, máximo de 32 entradas (FIFO), marca `metadata.cached`. É **local a cada processo**: não serve como limite global.
- `github.py`: cliente httpx da API GitHub (até 30 issues, exclui PRs). `GITHUB_TOKEN` é opcional.
- `gemma.py`: adaptadores `google-ai` e `vertex-ai` (ADC via google-auth). Erros viram `service_error` com HTTP adequado.
- `config.py`: `Settings` (pydantic-settings) lê o `.env`. Flags `ENABLE_*` ligam análises e cache.
- `schemas.py`: modelos Pydantic de request e response.

**Frontend `frontend/src/`** (React 19 + Vite):
- `App.jsx` (cerca de 740 linhas, o arquivo mais pesado): fluxo principal. Prefira extrair componentes novos em vez de crescer este arquivo.
- `RepositoryPicker.jsx`, `RepositoryEmptyState.jsx`, `Toast.jsx`, `api.js` (cliente `/api`), `i18n.js` (dicionário PT/EN).
- Repositórios salvos no `localStorage` do navegador. Não há conta.

**Testes:**
- Backend: `backend/tests/test_api.py` (usa `transport` falso, sem rede), `test_google_ai.py` e `test_deployment.py` (garante a forma do deploy).
- Frontend: `App.test.jsx` e `api.test.js` com Vitest + Testing Library.

## Comandos (PowerShell)
```powershell
# backend
python -m venv backend/.venv
.\backend\.venv\Scripts\python.exe -m pip install -r backend/requirements-lock.txt
cd backend; ruff check .; ruff format --check .; pytest -q
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload    # dev
# frontend
cd frontend; npm ci; npm run lint; npm test; npm run build; npm run dev
```
A CI (`.github/workflows/ci.yml`) roda backend (ruff + pytest em `backend/`) e frontend (lint, test, build em `frontend/`) com Python 3.13 e Node 22.

## Deploy (Vercel)
- Projeto Vercel na **raiz** do repositório, preset FastAPI. Nunca use `frontend` como Root Directory.
- `vercel.json`: `buildCommand` compila o frontend para `public/`. Função `index.py` com `maxDuration: 300`.
- `index.py` importa `backend.app.main:app`, serve `public/index.html` em `/` e monta `/assets`. As rotas `/api/*` ficam no mesmo domínio, então não há CORS.
- `.vercelignore` exclui venv, node_modules, credenciais e testes.
- Variáveis em `.env.example` e `docs/ENVIRONMENT.md` (`GEMMA_PROVIDER`, `GOOGLE_AI_API_KEY`, `GEMMA_MODEL_ID`, `VERTEX_AI_*`, `GITHUB_TOKEN`, `ENABLE_*`). **Mudou variável na Vercel, republique.**
- Fluxo: `vercel deploy --target preview` primeiro, depois verifique `/`, `/api/health` e `/api/issues?repository=FloraRosaPupo/repomentor`. Produção é um passo separado. **Nunca faça deploy sem pedido explícito.**

## Regras
- Dependências do Python: atualize `requirements.txt` **e** `backend/requirements-lock.txt`.
- Chaves só por variável de ambiente, nunca em código, teste ou log. O frontend nunca recebe credenciais.
- A consulta ao GitHub funciona **sem IA**. Falha do provedor vira estado de erro claro.
- String nova na interface entra em PT **e** EN no `i18n.js`.
- Mudou rota ou contrato: atualize `docs/API.md` e os testes. Não afirme acesso a provedor que não foi testado (`docs/VALIDATION.md`).
- Antes de abrir inferência paga ao público, é preciso autenticação e rate limit distribuído (o cache e o lock atuais são por processo).
- Agente: `ia-engineer` (backend/LLM). React segue os padrões de `frontend/src`.
