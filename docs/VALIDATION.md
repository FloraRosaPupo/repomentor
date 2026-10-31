# Validação — 31/10/2026

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

## Aceite ainda pendente

- [ ] Executar uma análise e um guia reais usando o endpoint Gemma 4 no Google Cloud.
- [ ] Revisar pelo menos três issues e suas evidências.
- [ ] Validar contraste, foco, teclado e layout em desktop e celular.
- [ ] Medir latência e consumo reais.
- [ ] Preparar implantação com autenticação e proteção contra abuso antes de exposição pública.

