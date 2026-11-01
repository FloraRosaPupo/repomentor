# Contribuindo

Observe o [Código de Conduta](CODE_OF_CONDUCT.md). Para bugs e propostas, use os templates de issues com passos de reprodução ou critérios de aceite.

## Primeira contribuição

Leia o [README](README.md), o [roadmap](docs/ROADMAP.md) e as [issues abertas](https://github.com/FloraRosaPupo/repomentor/issues). Confirme o escopo de tarefas grandes na issue antes de começar. Documentação, testes, acessibilidade e reprodução de bugs também são contribuições.

Faça um fork, clone seu fork e crie uma branch como `docs/setup-local`, `fix/idioma-resposta` ou `feat/classificador`. Configure `upstream` para o repositório original se precisar sincronizar alterações. Não copie `.env` nem credenciais de outra pessoa.

Instale e execute conforme o README. É possível contribuir sem configurar um modelo: navegação e testes de contrato não precisam de AI Studio. Inferência local sem provedor remoto ainda não está implementada.

## Convenções

- Faça mudanças pequenas e relacionadas à issue; evite reformatação sem relação com a tarefa.
- Escreva commits claros, por exemplo `fix: corrigir idioma da análise`.
- Python segue Ruff; frontend segue ESLint e a formatação existente. Confira scripts antes de adicionar ferramentas.
- Textos da interface devem ter PT/EN; valide teclado, nomes acessíveis e os dois temas quando alterar UI.
- Ao alterar schemas, rotas ou provedores, atualize os testes relevantes e [docs/API.md](docs/API.md).
- Documentação pode ser em português; identificadores, código e comandos preservam sua forma executável.

## Verificação e pull request

Crie uma branch por alteração e abra uma pull request para `main`. Explique o comportamento final, as verificações executadas e as limitações. Evite misturar refatorações sem relação com a tarefa.

Antes de enviar, execute lint, testes e build conforme o README. A CI não depende de credenciais: integrações externas são substituídas por transportes controlados apenas nos testes. Uma integração real deve ser registrada separadamente.

Não é necessário fazer chamadas pagas para toda PR. Testes reais devem usar conta própria, autorização e limites conhecidos. Informe provedor, modelo, versão do prompt e resultado sem segredos; uma fixture não comprova qualidade do modelo.

Vincule a issue no corpo da PR, descreva problema e resultado, verificações e pendências. Para alterações visuais, inclua capturas sem dados sensíveis e os temas/idiomas testados. Para documentação, confira links relativos, comandos e coerência com o código. Use `Closes #N` somente quando a entrega atender a issue.

Merge e publicação são decisões separadas. Não execute deploy, altere DNS ou recursos pagos sem autorização. Consulte [governança](GOVERNANCE.md), [suporte](SUPPORT.md) e [segurança](SECURITY.md).

Nunca versione `.env`, tokens ou credenciais Google Cloud. Use os exemplos de configuração. Mudanças no contrato da API devem atualizar testes, frontend e documentação juntos.

Não apresente resultados simulados como respostas reais do Gemma. Preserve a separação entre evidências verificadas e hipóteses da IA.
