import asyncio
import copy
import hashlib
import json
import time
from contextlib import asynccontextmanager

import httpx
from fastapi import FastAPI, Path
from fastapi.responses import JSONResponse

from .config import Settings
from .gemma import PROMPT_VERSION, GemmaService
from .github import GitHubService
from .schemas import (
    Analysis,
    AnalyzeRequest,
    Guide,
    RepositoryName,
    RepositoryOverview,
    RepositoryRequest,
    ServiceError,
)


def create_app(settings: Settings | None = None, transport=None, token_provider=None):
    settings = settings or Settings()

    @asynccontextmanager
    async def lifespan(app):
        async with httpx.AsyncClient(transport=transport, follow_redirects=False) as client:
            app.state.http = client
            kwargs = {"token_provider": token_provider} if token_provider else {}
            app.state.gemma = GemmaService(client, settings, **kwargs)
            app.state.cache = {}
            app.state.busy = False
            yield

    app = FastAPI(title="RepoMentor API", version="0.1.0", lifespan=lifespan)

    @app.exception_handler(ServiceError)
    async def service_error(_request, exc):
        return JSONResponse(
            status_code=exc.status, content={"error": {"code": exc.code, "message": exc.message}}
        )

    @app.get("/api/health")
    async def health():
        return {
            "status": "ok",
            "supported_repositories": "public-github",
            "gemma": {
                "configured": not settings.missing_configuration,
                "missing": settings.missing_configuration,
                "provider": "vertex-ai",
                "model": settings.gemma_model_id or None,
                "connection_verified": False,
            },
            "features": {
                "repository_overview": settings.enable_architecture_analysis,
                "analysis": settings.enable_architecture_analysis
                and settings.enable_issue_classification,
                "guide": settings.enable_contribution_guide,
            },
        }

    @app.get("/api/issues")
    async def issues(repository: RepositoryName):
        return await GitHubService(app.state.http, repository, settings.github_token).issues()

    async def run(repository: str, number: int | None, mode: str):
        enabled = {
            "guide": settings.enable_contribution_guide,
            "analysis": settings.enable_architecture_analysis
            and settings.enable_issue_classification,
            "repository": settings.enable_architecture_analysis,
        }[mode]
        if not enabled:
            raise ServiceError("feature_disabled", "Esta funcionalidade está desativada.", 409)
        if settings.missing_configuration:
            raise ServiceError(
                "gemma_not_configured",
                "Configure o Gemma 4 no backend antes de solicitar uma análise.",
                503,
            )
        if app.state.busy:
            raise ServiceError(
                "busy", "Já existe uma análise em andamento. Aguarde sua conclusão.", 409
            )
        app.state.busy = True
        try:
            async with asyncio.timeout(240):
                context = await GitHubService(
                    app.state.http, repository, settings.github_token
                ).context(number)
                key = hashlib.sha256(
                    json.dumps(
                        [
                            context,
                            mode,
                            settings.gemma_model_id,
                            settings.endpoint_url,
                            PROMPT_VERSION,
                        ],
                        sort_keys=True,
                    ).encode()
                ).hexdigest()
                cache = app.state.cache
                if settings.enable_cache and key in cache and cache[key][0] > time.monotonic():
                    answer = copy.deepcopy(cache[key][1])
                    answer["metadata"]["cached"] = True
                    return answer
                tasks = {
                    "guide": (
                        Guide,
                        "Gere um roteiro de investigação e contribuição, incluindo testes sugeridos e dúvidas para mantenedores.",
                    ),
                    "analysis": (
                        Analysis,
                        "Explique a arquitetura observada e classifique a dificuldade desta issue para novos contribuidores.",
                    ),
                    "repository": (
                        RepositoryOverview,
                        "Apresente o propósito, as tecnologias e a arquitetura observada do repositório. Sugira uma sequência de leitura e primeiros passos para aprender o projeto a partir da documentação. Nenhuma issue foi fornecida: não invente bugs, tarefas solicitadas ou oportunidades confirmadas pelos mantenedores.",
                    ),
                }
                schema, task = tasks[mode]
                answer = await app.state.gemma.generate(context, schema, task)
                answer["issue"] = context["issue"]
                answer["repository"] = repository
                if settings.enable_cache:
                    if len(cache) >= 32:
                        cache.pop(next(iter(cache)))
                    cache[key] = (time.monotonic() + 600, copy.deepcopy(answer))
                return answer
        except TimeoutError as exc:
            raise ServiceError(
                "analysis_timeout",
                "A coleta e análise excederam o tempo permitido. Tente novamente.",
                504,
            ) from exc
        finally:
            app.state.busy = False

    @app.post("/api/analyze")
    async def analyze(body: AnalyzeRequest):
        return await run(body.repository, body.issue_number, "analysis")

    @app.post("/api/repository/analyze")
    async def repository_overview(body: RepositoryRequest):
        return await run(body.repository, None, "repository")

    @app.post("/api/issues/{issue_number}/guide")
    async def guide(body: RepositoryRequest, issue_number: int = Path(gt=0)):
        return await run(body.repository, issue_number, "guide")

    return app


app = create_app()
