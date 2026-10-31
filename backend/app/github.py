import base64
import re
from urllib.parse import quote

import httpx

from .schemas import ServiceError


class GitHubService:
    def __init__(self, client: httpx.AsyncClient, repository: str, token: str = ""):
        self.client = client
        self.repository = repository
        self.base = f"https://api.github.com/repos/{repository}"
        self.headers = {
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
        }
        if token:
            self.headers["Authorization"] = f"Bearer {token}"

    async def get(self, path: str, params=None):
        try:
            response = await self.client.get(
                self.base + path, params=params, headers=self.headers, timeout=25
            )
        except httpx.RequestError as exc:
            raise ServiceError(
                "github_unavailable", "Não foi possível acessar o GitHub. Tente novamente.", 503
            ) from exc
        if response.status_code in (403, 429):
            raise ServiceError(
                "github_limit",
                "O GitHub limitou o acesso. Aguarde ou configure GITHUB_TOKEN no backend.",
                429,
            )
        if response.status_code == 404:
            raise ServiceError(
                "not_found",
                "Repositório, issue ou arquivo não encontrado. Confira a URL e o acesso público.",
                404,
            )
        if response.status_code == 409 and path.startswith("/commits/"):
            raise ServiceError(
                "empty_repository",
                "Este repositório ainda não possui um commit para analisar. Adicione um README ou código e tente novamente.",
                422,
            )
        if response.status_code != 200:
            raise ServiceError("github_error", "O GitHub não concluiu a consulta.", 502)
        try:
            return response.json()
        except ValueError as exc:
            raise ServiceError("github_invalid", "O GitHub retornou dados inválidos.") from exc

    async def public_metadata(self):
        repo = await self.get("")
        if repo.get("private") is not False or repo.get("visibility", "public") != "public":
            raise ServiceError(
                "private_repository", "Esta prévia aceita somente repositórios públicos.", 422
            )
        return repo

    def issue_data(self, item):
        return {
            "number": item["number"],
            "title": item["title"],
            "body": (item.get("body") or "")[:12000],
            "url": f"https://github.com/{self.repository}/issues/{item['number']}",
            "labels": [label["name"] for label in item.get("labels", [])],
            "updated_at": item["updated_at"],
        }

    async def issues(self):
        repo = await self.public_metadata()
        found = []
        exhausted = False
        enabled = repo.get("has_issues", True)
        # Bounded pagination, not a claim to list every issue in the repository.
        for page in range(1, 4) if enabled else []:
            rows = await self.get(
                "/issues", {"state": "open", "sort": "updated", "per_page": 30, "page": page}
            )
            found.extend(self.issue_data(row) for row in rows if "pull_request" not in row)
            exhausted = len(rows) < 30
            if len(found) >= 30 or len(rows) < 30:
                break
        return {
            "repository": self.repository,
            "issues": found[:30],
            "limit": 30,
            "issues_state": (
                "disabled"
                if not enabled
                else "available"
                if found
                else "empty"
                if exhausted
                else "limited"
            ),
            "scan_complete": exhausted,
            "info": {
                "description": repo.get("description"),
                "stars": repo.get("stargazers_count", 0),
                "language": repo.get("language"),
                "archived": repo.get("archived", False),
                "license": (repo.get("license") or {}).get("spdx_id"),
                "has_issues": enabled,
            },
        }

    async def context(self, number: int | None = None):
        repo = await self.public_metadata()
        issue = None
        if number is not None:
            raw = await self.get(f"/issues/{number}")
            if "pull_request" in raw or raw.get("state") != "open":
                raise ServiceError(
                    "invalid_issue", "Escolha uma issue aberta, não um pull request.", 422
                )
            issue = self.issue_data(raw)
        commit = await self.get("/commits/" + quote(repo["default_branch"], safe=""))
        sha = commit["sha"]
        tree = await self.get(f"/git/trees/{sha}", {"recursive": "1"})
        files = {item["path"]: item for item in tree["tree"] if item["type"] == "blob"}
        directories = {item["path"] for item in tree["tree"] if item["type"] == "tree"}
        priority = [
            "README.md",
            "CONTRIBUTING.md",
            "DEVELOPMENT.md",
            "ISSUE_TRIAGE.md",
            "LABELS.md",
            "package.json",
            ".github/CONTRIBUTING.md",
            "pyproject.toml",
            "Cargo.toml",
            "go.mod",
            "pom.xml",
            "Gemfile",
        ]
        words = set(
            re.findall(
                r"[a-zA-Z][a-zA-Z0-9_-]{3,}",
                (issue["title"] if issue else repo.get("description") or "").lower(),
            )
        )
        candidates = sorted(
            (
                path
                for path in files
                if path.endswith(
                    (
                        ".md",
                        ".rst",
                        ".txt",
                        ".json",
                        ".js",
                        ".ts",
                        ".jsx",
                        ".tsx",
                        ".py",
                        ".go",
                        ".rs",
                        ".java",
                        ".rb",
                        ".c",
                        ".cpp",
                        ".toml",
                        ".yaml",
                        ".yml",
                    )
                )
            ),
            key=lambda path: (-sum(word in path.lower() for word in words), len(path), path),
        )
        selected = list(dict.fromkeys([p for p in priority if p in files] + candidates))
        documents, total = [], 0
        for path in selected:
            if len(documents) >= 8 or total >= 36000:
                break
            if files[path].get("size", 0) > 100000:
                continue
            data = await self.get("/contents/" + quote(path, safe="/"), {"ref": sha})
            if data.get("encoding") != "base64" or not data.get("content"):
                continue
            content = base64.b64decode(data["content"]).decode("utf-8", errors="replace")
            excerpt = content[: min(6000, 36000 - total)]
            documents.append(
                {"path": path, "content": excerpt, "truncated": len(excerpt) < len(content)}
            )
            total += len(excerpt)
        visible_paths = list(
            dict.fromkeys([doc["path"] for doc in documents] + sorted(directories)[:120])
        )
        if not documents:
            raise ServiceError(
                "insufficient_context",
                "Não encontramos documentação ou arquivos de texto compatíveis para analisar com segurança.",
                422,
            )
        return {
            "repository": self.repository,
            "commit": sha,
            "issue": issue,
            "description": repo.get("description"),
            "documents": documents,
            "paths": visible_paths,
            "limitations": [
                "Contexto limitado a até 8 arquivos e 36 mil caracteres; comentários não foram coletados.",
                "A seleção de arquivos é heurística; caminhos existentes não comprovam a causa da issue.",
                *(
                    ["A árvore retornada pelo GitHub foi truncada."]
                    if tree.get("truncated")
                    else []
                ),
            ],
        }
