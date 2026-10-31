# RepoMentor

Encontre sua primeira contribuição open source com contexto, evidências e um caminho para começar.

**Status: planejamento do MVP. Ainda não há aplicação executável, integração validada ou infraestrutura provisionada.**

## A ideia

O RepoMentor ajudará desenvolvedores a compreender issues e a começar a contribuir com projetos open source. O MVP será dedicado ao [Meteor](https://github.com/meteor/meteor): analisará documentação, estrutura do código e issues abertas para recomendar oportunidades e produzir um guia de contribuição.

O Gemma 4 explicará a arquitetura, avaliará a dificuldade das issues e sugerirá áreas para investigar. Cada recomendação deverá apresentar evidências e distinguir fatos de hipóteses. Caminhos sugeridos serão conferidos contra os arquivos coletados.

## Fluxo planejado

1. Consultar dados reais e issues abertas de `meteor/meteor`.
2. Selecionar documentação e arquivos relevantes, com limites de tamanho.
3. Enviar o contexto ao Gemma 4 no Google Cloud.
4. Validar a resposta e os caminhos citados.
5. Exibir recomendações e gerar um guia para a issue escolhida.

## Stack escolhida

| Camada | Tecnologia planejada |
| --- | --- |
| Interface | React, Vite, JavaScript/JSX e CSS |
| Backend | Python 3.12+, FastAPI, Pydantic e HTTPX |
| IA | Gemma 4 em endpoint próprio do Vertex AI, Google Cloud |
| Dados | GitHub REST API, somente leitura |
| Testes | Pytest, Vitest e React Testing Library |

A variante inicial candidata é Gemma 4 26B A4B. A seleção final depende de uma chamada real, qualidade, latência, região, quotas e orçamento. Modelo e endpoint serão configuráveis. Não haverá substituição silenciosa por Gemini ou outro modelo.

O processamento será em nuvem: o contexto público selecionado do Meteor será enviado ao Google Cloud. Credenciais ficarão exclusivamente no backend.

## Escopo

O MVP inclui análise arquitetural, classificação explicada de issues, verificação de referências e guias de contribuição. Repositórios genéricos, login, execução de código, edição de arquivos e abertura automática de PRs ficam fora da primeira versão.

## Documentação

- [Plano de implementação e specs](docs/IMPLEMENTATION_PLAN.md)
- [Decisão Google Cloud + Gemma 4](docs/GOOGLE_CLOUD.md)
- [Plano de testes e aceite](docs/TEST_PLAN.md)
- [Registro de experimentos](docs/GEMMA_EXPERIMENTS.md)

## Próximas entregas

- [x] Criar a base documental do repositório.
- [ ] Inicializar frontend e backend com endpoint de saúde.
- [ ] Validar acesso ao Gemma 4 no Google Cloud.
- [ ] Consultar issues e contexto reais do Meteor.
- [ ] Implementar análise com evidências e guia de contribuição.
- [ ] Executar testes e revisar pelo menos três issues reais.
- [ ] Gravar demonstração e preparar a primeira release.

Os comandos de instalação serão adicionados quando existir código executável. Nenhum teste de aplicação foi executado nesta etapa documental.

## Participação no evento

A categoria pretendida é Best Use of Gemma. Este repositório não comprova inscrição nem elegibilidade; a demonstração, o enquadramento no tema e as regras do evento precisam ser verificados antes da submissão.

## Licença

[MIT](LICENSE). O projeto não é afiliado ao Meteor ou ao Google. Modelos, dependências e materiais consultados mantêm suas próprias licenças.
