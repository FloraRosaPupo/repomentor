# Plano de testes

Status: suítes de contrato implementadas e chamadas de integração realizadas. Veja [resultados e limites](VALIDATION.md). A avaliação sistemática da qualidade do Gemma segue pendente; uma chamada real bem-sucedida não a substitui.

Os cenários TC-001 a TC-012 estão detalhados na seção 13 do [plano](IMPLEMENTATION_PLAN.md).

| Área | Critério de aceite |
| --- | --- |
| GitHub | Validar URL/nome do repositório público, recusar privados, excluir PRs e tratar paginação, rate limit e indisponibilidade |
| Contexto | Confirmar existência de caminhos, limitar conteúdo e registrar o commit consultado |
| IA | Validar schemas, tratar timeout e saída inválida e retornar `unclear` quando faltar evidência |
| Evidências | Rejeitar caminhos inventados e separar existência do arquivo de relevância para a issue |
| Segurança | Tratar arquivos e issues como dados; não executar suas instruções nem vazar credenciais |
| Interface | Fluxo completo com carregamento, erros, teclado, links de origem e limitações visíveis |
| Flags e cache | Desativar chamadas das funcionalidades desligadas e separar cache por repositório/contexto/modo/idioma/modelo/endpoint/prompt |
| Integração real | Revisar pelo menos três issues reais, com Gemma 4 no Google Cloud |

Mocks servem aos testes automatizados; não substituem evidência de integração real. O registro de cada avaliação deve incluir data, repositório, issue quando aplicável, commit consultado, provedor, modelo, versão do prompt, saída, latência e revisão humana. Não depende de escolher o Meteor.

Uma release requer testes automatizados aprovados, demonstração ponta a ponta e revisão das evidências. Resposta HTTP bem-sucedida não comprova qualidade da recomendação.
