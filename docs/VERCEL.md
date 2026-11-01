# Implantação na Vercel (opcional)

O projeto usa a raiz do repositório, preset FastAPI e `index.py` como entrada do backend. O build instala o frontend com `npm ci` e gera seus arquivos em `public/`, com rota explícita para o HTML inicial e montagem de /assets no FastAPI. As rotas `/api/*` continuam no FastAPI, no mesmo endereço.

A configuração está em `vercel.json`; `.vercelignore` exclui ambientes virtuais, dependências locais, credenciais e arquivos de teste do upload. Não defina `frontend` como Root Directory.

```powershell
vercel.cmd link --project repomentor --scope florarosapupos-projects
vercel.cmd deploy --target preview --scope florarosapupos-projects
```

Os comandos acima são exemplos para mantenedores autorizados do projeto original, não uma etapa do setup de contribuidores. Para testar em conta própria, use seu projeto e equipe. Solicite explicitamente `--target preview` para revisão; produção é uma etapa separada. Confirme sempre o destino antes do deploy.

Consulte [variáveis e autenticação](ENVIRONMENT.md). A consulta GitHub funciona sem Gemma. Com `google-ai`, a geração usa chave AI Studio e modelo, sem endpoint Vertex. Com `vertex-ai`, precisa de endpoint e ADC compatíveis com a hospedagem. Salvar uma variável não altera automaticamente um deploy existente: republique e verifique.

Cache e bloqueio de concorrência são locais a cada processo. Não equivalem a limites globais de uso; antes de habilitar inferência paga em acesso público, implemente autenticação e limites distribuídos.

Verifique no preview: `/`, `/api/health` e `/api/issues?repository=FloraRosaPupo/repomentor`. O frontend deve carregar, a API deve responder e a ausência de issues deve ser tratada como estado válido.

Referência: [FastAPI e arquivos públicos na Vercel](https://vercel.com/docs/frameworks/backend/fastapi).

