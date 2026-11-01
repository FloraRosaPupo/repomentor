# Governança

O RepoMentor recebe contribuições por issues e pull requests no [repositório oficial](https://github.com/FloraRosaPupo/repomentor). Este documento define o processo de colaboração; não concede permissões técnicas no GitHub.

## Responsabilidades

- A mantenedora responsável pelo repositório é [FloraRosaPupo](https://github.com/FloraRosaPupo). Ela coordena prioridades, permissões, integrações e publicação.
- Contribuidores podem propor melhorias, reproduzir problemas, revisar documentação e enviar PRs. Ter uma PR aceita não concede acesso a chaves ou infraestrutura.
- Revisores devem avaliar escopo, comportamento, testes e documentação, declarando quando não conseguiram validar alguma parte.

## Propostas e decisões

Correções pequenas podem chegar diretamente por PR. Mudanças de arquitetura, contratos, provedores de IA, custos ou coleta de dados devem começar em uma issue com problema, alternativas e critérios de aceite. O [roadmap](docs/ROADMAP.md) organiza propostas; não promete datas de entrega.

Decisões devem ficar registradas na issue ou PR correspondente. Em caso de divergência, compare evidências, impacto para usuários e alternativas. A mantenedora decide o encaminhamento quando não houver consenso, registrando a justificativa. Divergências técnicas não autorizam ataques pessoais; aplica-se o [Código de Conduta](CODE_OF_CONDUCT.md).

## Revisão e integração

Use branch própria e PR para `main`. A revisão deve conferir os checks da CI, testes proporcionais à mudança, credenciais fora do diff e documentação coerente com a entrega. Mudanças de interface precisam de evidência visual ou descrição do teste manual; integrações reais devem ser diferenciadas de mocks.

Este é o fluxo recomendado de colaboração, não uma afirmação de que proteções de branch ou aprovações obrigatórias já estão configuradas. Merge e deploy são etapas distintas. A publicação deve identificar commit e ambiente, verificar página/API e permitir retornar à versão anterior.

## Novos mantenedores

A entrada de mantenedores deve ser discutida e registrada no repositório, considerando participação consistente, qualidade das revisões e disponibilidade. Permissões são concedidas explicitamente e apenas na extensão necessária. Não existe promoção automática por número de commits.

Não há SLA de suporte ou revisão. Mudanças neste documento passam pelo mesmo fluxo de PR. Consulte [CONTRIBUTING.md](CONTRIBUTING.md) para começar.
