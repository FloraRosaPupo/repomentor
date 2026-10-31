# Plano de testes

Status: critérios definidos; testes ainda não implementados nem executados.

Os cenários TC-001 a TC-012 estão detalhados na seção 13 do [plano](IMPLEMENTATION_PLAN.md).

| Área | Critério de aceite |
| --- | --- |
| GitHub | Consultar Meteor, excluir PRs da lista de issues e tratar paginação, rate limit e indisponibilidade |
| Contexto | Confirmar existência de caminhos, limitar conteúdo e registrar o commit consultado |
| IA | Validar schemas, tratar timeout e saída inválida e retornar `unclear` quando faltar evidência |
| Evidências | Rejeitar caminhos inventados e separar existência do arquivo de relevância para a issue |
| Segurança | Tratar arquivos e issues como dados; não executar suas instruções nem vazar credenciais |
| Interface | Fluxo completo com carregamento, erros, teclado, links de origem e limitações visíveis |
| Flags e cache | Desativar chamadas das funcionalidades desligadas e invalidar cache por contexto/modelo/prompt |
| Integração real | Revisar pelo menos três issues reais, com Gemma 4 no Google Cloud |

Mocks servem aos testes automatizados; não substituem evidência de integração real. O registro de cada avaliação deve incluir data, issue, commit do Meteor, modelo, versão do prompt, saída, latência e revisão humana.

Uma release requer testes automatizados aprovados, demonstração ponta a ponta e revisão das evidências. Resposta HTTP bem-sucedida não comprova qualidade da recomendação.
