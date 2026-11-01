# Roadmap

As propostas pendentes abaixo não são funcionalidades entregues nem compromissos de prazo. A prioridade é definida pela mantenedora com a comunidade conforme a [governança](../GOVERNANCE.md).

## Base implementada

| Capacidade | Evidência no repositório |
| --- | --- |
| Cadastro de repositórios públicos no navegador e consulta de issues | [RepositoryPicker](../frontend/src/RepositoryPicker.jsx), [serviço GitHub](../backend/app/github.py) |
| Visão geral sem issue, análise individual e guia | [rotas](../backend/app/main.py), [schemas](../backend/app/schemas.py) |
| Provedores Google AI e Vertex AI configuráveis | [configuração](../backend/app/config.py), [adaptador](../backend/app/gemma.py) |
| Idioma PT/EN enviado ao modelo e cache separado | [frontend](../frontend/src/App.jsx), [testes da API](../backend/tests/test_api.py) |
| Tema claro/escuro e tradução de interface | [interface](../frontend/src/App.jsx), [dicionário](../frontend/src/i18n.js) |
| Testes sem chave real e CI | [backend](../backend/tests), [frontend](../frontend/src/App.test.jsx), [workflow](../.github/workflows/ci.yml) |

Implementação de adaptador não significa provedor configurado em toda instalação. Leia o [registro de validação](VALIDATION.md) e os [limites da API](API.md).

## Entregas e propostas

| Issue | Resultado desejado | Dependências/limites |
| --- | --- | --- |
| [#4 — Documentação open source](https://github.com/FloraRosaPupo/repomentor/issues/4) | Guias coerentes de contribuição, configuração e manutenção | Entregue nesta revisão documental; ver registro de validação |
| [#5 — Classificador de padrões](https://github.com/FloraRosaPupo/repomentor/issues/5) | Identificar tipos de contribuição mesmo sem labels padronizadas | Explicabilidade, abstenção e avaliação; não classificar pessoas |
| [#6 — Benchmark](https://github.com/FloraRosaPupo/repomentor/issues/6) | Avaliar o classificador de forma reproduzível | Alinhar taxonomia com #5; separar conjuntos por repositório |
| [#7 — Gemma local](https://github.com/FloraRosaPupo/repomentor/issues/7) | Inferência sem chamar AI Studio/Vertex | Runtime, modelo e hardware ainda precisam ser avaliados |
| [#8 — Link independente da Vercel](https://github.com/FloraRosaPupo/repomentor/issues/8) | Definir endereço/portal ou hospedagem alternativa | Domínio próprio não equivale a migrar infraestrutura |
| [#9 — Favicon](https://github.com/FloraRosaPupo/repomentor/issues/9) | Identidade visual nas abas e favoritos | Validar assets locais e build; licença da arte |

## Lacunas a considerar na priorização

Controles de acesso e consumo para instâncias públicas, canal privado de segurança, revisão assistiva de acessibilidade e avaliação da qualidade das respostas ainda exigem trabalho. Não confundir testes de contrato com medição de precisão da IA.

O [plano original](IMPLEMENTATION_PLAN.md) permanece como contexto histórico. Havendo divergência, use o código, os contratos atuais e as decisões registradas nas issues/PRs; o plano não comprova entrega.
