# Suporte

Use as [issues do GitHub](https://github.com/FloraRosaPupo/repomentor/issues) para dúvidas, bugs e propostas. Antes de abrir uma, procure relatos semelhantes. O suporte é comunitário, sem prazo garantido de resposta.

## Relatar um problema

Inclua versão ou commit, sistema operacional, navegador, execução local ou hospedada, idioma selecionado, passos de reprodução, resultado esperado e resultado observado. Para falhas de análise, informe provedor e identificador do modelo, sem a chave. Se possível, use um repositório público pequeno e um número de issue reproduzível.

Capturas e logs devem estar sem tokens, cabeçalhos de autenticação, arquivos `.env`, dados privados ou conteúdo sensível. Vulnerabilidades seguem [SECURITY.md](SECURITY.md), não o template público de bug.

## Diagnóstico inicial

| Sintoma | O que conferir |
| --- | --- |
| Botão de IA desabilitado | Carregar repositório; selecionar issue para análise/guia; verificar configuração e flags em `/api/health` |
| Repositório sem issues | É um estado válido; usar a visão geral, quando a IA estiver configurada |
| URL recusada | Usar `organização/repositório` ou URL completa de um repositório público; URL de perfil não basta |
| Limite do GitHub | Aguardar a cota ou configurar token próprio de leitura no backend |
| Limite ou erro do Gemma | Verificar acesso ao modelo, quota e provedor; não repetir chamadas continuamente |
| Interface local sem API | Abrir o frontend em `127.0.0.1:5174`, manter backend em `127.0.0.1:8000` e conferir proxy |
| Resposta no idioma anterior | Atualizar a página, selecionar PT/EN e gerar novamente; não se trata de tradução automática do texto original da issue |

`configured=true` em `/api/health` verifica preenchimento de configuração, não autenticação real. Os testes automatizados também não comprovam disponibilidade do provedor. Consulte [configuração](docs/ENVIRONMENT.md), [contrato da API](docs/API.md) e [validação](docs/VALIDATION.md).
