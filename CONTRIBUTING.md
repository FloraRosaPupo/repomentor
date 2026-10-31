# Contribuindo

Crie uma branch por alteração e abra uma pull request para `main`. Explique o comportamento final, as verificações executadas e as limitações. Evite misturar refatorações sem relação com a tarefa.

Antes de enviar, execute lint, testes e build conforme o README. A CI não depende de credenciais: integrações externas são substituídas por transportes controlados apenas nos testes. Uma integração real deve ser registrada separadamente.

Nunca versione `.env`, tokens ou credenciais Google Cloud. Use os exemplos de configuração. Mudanças no contrato da API devem atualizar testes, frontend e documentação juntos.

Não apresente resultados simulados como respostas reais do Gemma. Preserve a separação entre evidências verificadas e hipóteses da IA.
