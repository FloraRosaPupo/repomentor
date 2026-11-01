# Experimentos com Gemma 4

## Estado do registro

Foram realizadas chamadas de integração durante o desenvolvimento de 31/10/2026: visão geral de repositório real e verificação de idioma com contexto fictício identificado como tal, usando `gemma-4-26b-a4b-it` pelo provedor `google-ai`. Elas confirmaram respostas válidas nessas chamadas, não precisão geral, segurança ou disponibilidade permanente.

Não há benchmark publicado de classificação, corpus de referência ou avaliação humana de múltiplos repositórios. A avaliação sistemática está proposta na [issue #6](https://github.com/FloraRosaPupo/repomentor/issues/6). O adaptador Vertex permanece sem validação real registrada. Consulte [VALIDATION.md](VALIDATION.md).

## Protocolo para próximas execuções

Comparar os prompts de arquitetura, classificação, relação com código e guia descritos no plano de implementação. Utilizar issues reais e contexto identificado por commit.

Para cada execução registrar:

- Data e responsável.
- Issue e commit do repositório analisado.
- Provedor, modelo e, quando aplicável, região e endpoint, sem credenciais.
- Versão do prompt e contexto fornecido.
- Resultado e validação do schema.
- Evidências verificadas, hipóteses e caminhos rejeitados.
- Latência e consumo quando disponíveis.
- Revisão humana: correção, utilidade e limitações.

Não apresentar exemplos ou fixtures como resultados reais. Não atribuir probabilidades estatísticas a avaliações subjetivas do modelo.
