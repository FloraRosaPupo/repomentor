# Preview na Vercel

O projeto usa a raiz do repositório, preset FastAPI e `index.py` como entrada do backend. O build instala o frontend com `npm ci` e gera seus arquivos em `public/`, servido pela CDN da Vercel. As rotas `/api/*` continuam no FastAPI, no mesmo endereço.

A configuração está em `vercel.json`; `.vercelignore` exclui ambientes virtuais, dependências locais, credenciais e arquivos de teste do upload. Não defina `frontend` como Root Directory.

```powershell
vercel.cmd link --project repomentor --scope florarosapupos-projects
vercel.cmd deploy --scope florarosapupos-projects
```

O comando cria um preview para revisão. Publicar uma versão de produção é uma etapa separada. Confirme sempre o projeto e a equipe antes do deploy.

Consulte [variáveis e autenticação](ENVIRONMENT.md). A consulta pública do GitHub funciona sem configurar Gemma; o recurso de IA depende de endpoint e autenticação Google válidos.

Cache e bloqueio de concorrência são locais a cada processo. Não equivalem a limites globais de uso; antes de habilitar inferência paga em acesso público, implemente autenticação e limites distribuídos.

Verifique no preview: `/`, `/api/health` e `/api/issues?repository=FloraRosaPupo/repomentor`. O frontend deve carregar, a API deve responder e a ausência de issues deve ser tratada como estado válido.

Referência: [FastAPI e arquivos públicos na Vercel](https://vercel.com/docs/frameworks/backend/fastapi).
