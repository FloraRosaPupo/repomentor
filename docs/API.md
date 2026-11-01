# Contrato da primeira implementação

O MVP começa com análise de **uma issue por solicitação**, para limitar consumo e facilitar a revisão. A classificação em lote descrita no plano fica para uma próxima etapa.

| Endpoint | Entrada | Resultado |
| --- | --- | --- |
| `GET /api/health` | Nenhuma | Estado do backend, configuração do Gemma e flags |
| `POST /api/repository/analyze` | `{"repository":"owner/repo"}` | Visão geral, tecnologias, arquitetura e próximos passos, sem exigir issue |
| `GET /api/issues?repository=owner/repo` | Nome ou URL pública GitHub no parâmetro `repository` | Metadados e até 30 issues abertas; PRs excluídos |
| `POST /api/analyze` | `{"repository":"meteor/meteor","issue_number":42}` | Issue, análise e metadados |
| `POST /api/issues/{issue_number}/guide` | `{"repository":"owner/repo"}` | Repositório, issue, roteiro e metadados |

O número 42 é ilustrativo. Use um número retornado pela consulta real.

Os três endpoints de geração aceitam `language: "pt" | "en"` no corpo (padrão `"pt"`).
O idioma determina os textos gerados pelo Gemma e integra a chave do cache.
`metadata.language` registra o idioma solicitado. Nomes de campos, enums, caminhos,
comandos e nomes de tecnologias são preservados. Ao trocar o idioma na interface,
os resultados anteriores são limpos; a próxima geração usa a nova seleção.

A listagem inclui `issues_state`: `available`, `empty`, `disabled` ou `limited`. Uma busca limitada não comprova ausência de issues. Repositórios sem issues podem ser explorados e analisados; repositórios vazios ou sem contexto legível recebem uma explicação sem chamar o modelo.

Análises contêm resumo, arquitetura, dificuldade, justificativa, conhecimentos necessários, evidências e limitações. Guias contêm passos sugeridos, estratégia de testes, perguntas para mantenedores, evidências e limitações.

Erros de serviços têm formato `{"error":{"code":"...","message":"..."}}`. Validação da requisição retorna HTTP 422 no formato padrão FastAPI. Nenhum corpo de erro do provedor é repassado ao usuário.

## Limites e garantias

- Repositório público selecionado pelo usuário. Aceita `owner/repo` e `https://github.com/owner/repo`; valida host e formato e recusa repositórios privados antes de consultar issues ou chamar o modelo. Nenhum endpoint de escrita no GitHub.
- Listagem: até três páginas de 30 entradas; máximo de 30 issues exibidas.
- Contexto: até oito arquivos, 6.000 caracteres por arquivo e 36.000 no total. Issue limitada a 12.000 caracteres. Sem comentários.
- As leituras de arquivos usam um commit imutável, registrado na resposta.
- Referências que não constam nos caminhos enviados ao modelo são removidas. Existência não comprova relevância; o texto livre também precisa de revisão.
- JSON validado com Pydantic; resposta incompleta ou truncada é rejeitada.
- Sem fallback para modelos diferentes ou respostas simuladas.
- Uma análise ativa por processo; deploy deve manter um worker nesta prévia.
- Cache em memória por até dez minutos e 32 resultados, identificado pelo contexto, modo, idioma, modelo, endpoint e prompt.
- Timeout da inferência configurável; teto de quatro minutos para coleta e análise.
- `configured=true` significa apenas que os campos estão preenchidos. Não afirma conectividade ou permissões válidas.

A prévia foi feita para execução local. Autenticação de usuários, limitação distribuída e proteção contra abuso de um endpoint público ainda não foram implementadas.

O cadastro é uma lista local no navegador (até 12 entradas), persistida em `localStorage`. Remover uma entrada não altera o GitHub. O cache inclui o repositório no contexto, evitando misturar resultados de issues com o mesmo número em projetos diferentes.
