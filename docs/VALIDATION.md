# Registro de validação

## Verificação da documentação open source — 01/11/2026

Em clone isolado no Windows, sem arquivo `.env`, as dependências foram instaladas pelos arquivos de lock. Passaram 48 testes backend, 18 testes frontend, Ruff (lint e formatação), ESLint e build Vite. Os testes usam mocks e não consomem créditos de IA. O backend emitiu aviso de depreciação do transporte httpx do Starlette/TestClient.

Foram conferidos 77 destinos de links locais em 16 arquivos Markdown e `git diff --check`. Isso não valida links externos, âncoras ou instalação em outros sistemas operacionais.

## Atualização da revisão documental — 01/11/2026

Na validação da versão `4e0e6b8`, 48 testes backend e 18 frontend passaram, junto com lint e build. Foram verificadas chamadas reais do Gemma pelo AI Studio em desenvolvimento e produção. A checagem de todos os campos de um guia em inglês usou contexto fictício controlado e inferência real; não é avaliação de qualidade sobre um repositório real.

Respostas foram validadas por schema e inspecionadas, mas não há benchmark de precisão. Ocorreram limites de quota do Google e do GitHub durante as verificações. Nenhuma integração real com endpoint próprio Vertex foi validada. Ver [testes Google AI](../backend/tests/test_google_ai.py), [testes de idioma/cache](../backend/tests/test_api.py) e [experimentos](GEMMA_EXPERIMENTS.md).

O registro abaixo é histórico da primeira implementação; os números e a ausência de chamadas reais ali descritos não representam o estado atual do provedor AI Studio.

## Primeira implementação — 31/10/2026

## Executado nesta implementação

- Backend: 40 testes Pytest aprovados, incluindo contratos, flags, ausência de configuração, exclusão de PRs, erros GitHub/Vertex AI, timeout, JSON inválido e truncado, cache e remoção de caminhos inventados. Inclui normalização de URLs, recusa de hosts externos e repositórios privados, isolamento entre repositórios, estados sem issues e visão geral sem issue.
- Frontend: 15 testes Vitest/Testing Library aprovados, cobrindo consulta/seleção/análise, configuração ausente, busca, troca de issue, erro/retry e bloqueio durante geração. Inclui cadastro local, remoção dos salvos, seleção de sugestões, limpeza de resultados ao trocar de repositório, estados sem issues e visão geral.
- Ruff e ESLint aprovados; build Vite concluído.
- Backend iniciado em `127.0.0.1:8000`; `/api/health` retornou HTTP 200 com configuração do Gemma ausente.
- `/api/issues` consultou o GitHub real e retornou 30 issues abertas do Meteor.
- Frontend iniciado em `127.0.0.1:5174`; porta 5173 estava ocupada por outro projeto e foi preservada.
- HTTP 200 na página inicial e em `/api/health` passando pelo proxy do frontend.
- Consulta genérica real validada com `freeCodeCamp/freeCodeCamp` via proxy e URL `https://github.com/microsoft/vscode` diretamente na API: 30 issues por projeto, URLs corretas e estrelas retornadas pelo GitHub.
- `npm audit --omit=dev`: nenhuma vulnerabilidade nas dependências de produção.

## Limitações observadas

- Projeto e região Google Cloud não estavam configurados no CLI; endpoint e modelo não foram fornecidos. Nenhuma inferência real do Gemma foi executada.
- Testes do adaptador usam respostas controladas de teste; não comprovam qualidade, latência real ou fidelidade do Gemma.
- A inspeção visual automatizada foi bloqueada pela ferramenta de navegador, que não conseguiu determinar a URL ativa. Responsividade, teclado e apresentação visual precisam de revisão manual da equipe.
- O ambiente instalado emitiu aviso de depreciação Starlette/TestClient sobre o transporte httpx; os testes passaram.
- A auditoria npm inicial apontou avisos moderados em dependências de desenvolvimento do lint. Consultar `npm audit` na instalação da equipe; não foi aplicado `audit fix --force`.

## Pendências da primeira implementação

- [ ] Executar uma análise e um guia reais usando o endpoint Gemma 4 no Google Cloud.
- [ ] Revisar pelo menos três issues e suas evidências.
- [ ] Validar contraste, foco, teclado e layout em desktop e celular.
- [ ] Medir latência e consumo reais.
- [ ] Preparar implantação com autenticação e proteção contra abuso antes de exposição pública.

