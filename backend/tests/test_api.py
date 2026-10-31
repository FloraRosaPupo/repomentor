import json

import httpx
import pytest
from fastapi.testclient import TestClient

from app.config import Settings
from app.main import create_app
from app.schemas import normalize_repository


def settings(**overrides):
    return Settings(
        _env_file=None,
        google_cloud_project="test-project",
        google_cloud_location="us-central1",
        vertex_ai_endpoint_id="123",
        gemma_model_id="google/gemma-4-test",
        **overrides,
    )


ISSUE = {
    "number": 42,
    "title": "README improvement",
    "body": "Explain the setup.",
    "state": "open",
    "labels": [{"name": "documentation"}],
    "updated_at": "2026-10-31T10:00:00Z",
}
ANALYSIS = {
    "summary": "A documentação precisa esclarecer o setup.",
    "architecture": "O README apresenta o projeto.",
    "difficulty": "unclear",
    "reasoning": "O contexto é insuficiente para estimar a implementação.",
    "required_knowledge": ["Markdown"],
    "evidence": [
        {"path": "README.md", "reason": "Documento fornecido."},
        {"path": "invented.js", "reason": "Hipótese sem comprovação."},
    ],
    "limitations": ["É necessário confirmar com os mantenedores."],
}
GUIDE = {
    "summary": "Investigue o setup.",
    "steps": ["Leia o README e confirme a dúvida."],
    "testing_strategy": ["Reproduza as instruções."],
    "questions_for_maintainers": [],
    "evidence": [],
    "limitations": ["Guia não executado."],
}
OVERVIEW = {
    "summary": "Uma plataforma para aprender.",
    "architecture": "A documentação está no README.",
    "technologies": ["Markdown"],
    "next_steps": ["Leia o README antes de propor uma alteração."],
    "evidence": [{"path": "README.md", "reason": "Documentação fornecida."}],
    "limitations": ["Nenhuma issue foi analisada."],
}


class Upstream:
    def __init__(self, payload=None, status=200, finish="stop"):
        self.payload = payload if payload is not None else ANALYSIS
        self.status, self.finish = status, finish
        self.calls = []

    def __call__(self, request):
        self.calls.append(request)
        path = request.url.path
        if request.url.host.endswith("googleapis.com"):
            if self.status != 200:
                return httpx.Response(self.status, text="SECRET upstream error")
            return httpx.Response(
                200,
                json={
                    "choices": [
                        {
                            "finish_reason": self.finish,
                            "message": {"content": json.dumps(self.payload)},
                        }
                    ],
                    "usage": {"total_tokens": 20},
                },
            )
        if path.endswith("/issues/42"):
            return httpx.Response(200, json=ISSUE)
        if path.endswith("/issues"):
            return httpx.Response(200, json=[{**ISSUE, "number": 99, "pull_request": {}}, ISSUE])
        if "/commits/" in path:
            return httpx.Response(200, json={"sha": "a" * 40})
        if "/git/trees/" in path:
            return httpx.Response(
                200,
                json={
                    "tree": [{"path": "README.md", "type": "blob", "size": 10}],
                    "truncated": False,
                },
            )
        if "/contents/" in path:
            return httpx.Response(200, json={"encoding": "base64", "content": "TWV0ZW9y"})
        return httpx.Response(
            200, json={"default_branch": "main", "description": "Example", "private": False}
        )

    @property
    def predictions(self):
        return [call for call in self.calls if call.method == "POST"]


def client(upstream, config=None):
    return TestClient(
        create_app(
            config or settings(),
            transport=httpx.MockTransport(upstream),
            token_provider=lambda: "test-token",
        )
    )


def test_health_is_not_a_claim_of_live_connectivity():
    with client(Upstream()) as app:
        status = app.get("/api/health").json()
    assert status["gemma"]["configured"] is True
    assert status["gemma"]["connection_verified"] is False
    assert "test-token" not in json.dumps(status)


def test_missing_config_blocks_model_but_not_issue_listing():
    upstream = Upstream()
    config = Settings(
        _env_file=None,
        google_cloud_project="",
        google_cloud_location="",
        vertex_ai_endpoint_id="",
        gemma_model_id="",
    )
    with client(upstream, config) as app:
        assert app.get("/api/issues", params={"repository": "meteor/meteor"}).status_code == 200
        response = app.post(
            "/api/analyze", json={"repository": "meteor/meteor", "issue_number": 42}
        )
        assert response.status_code == 503
        assert response.json()["error"]["code"] == "gemma_not_configured"
    assert not upstream.predictions


def test_listing_excludes_pull_requests():
    with client(Upstream()) as app:
        data = app.get("/api/issues", params={"repository": "meteor/meteor"}).json()
    assert [issue["number"] for issue in data["issues"]] == [42]
    assert data["issues"][0]["url"] == "https://github.com/meteor/meteor/issues/42"


def test_analysis_removes_fabricated_paths_and_caches_validated_result():
    upstream = Upstream()
    with client(upstream) as app:
        response = app.post(
            "/api/analyze", json={"repository": "meteor/meteor", "issue_number": 42}
        )
        assert response.status_code == 200, response.text
        body = response.json()
        assert [item["path"] for item in body["result"]["evidence"]] == ["README.md"]
        assert "invented.js" in body["result"]["limitations"][-1]
        assert "/blob/" + "a" * 40 + "/README.md" in body["result"]["evidence"][0]["url"]
        assert body["metadata"]["cached"] is False
        assert (
            app.post(
                "/api/analyze", json={"repository": "meteor/meteor", "issue_number": 42}
            ).json()["metadata"]["cached"]
            is True
        )
    assert len(upstream.predictions) == 1
    request = upstream.predictions[0]
    assert request.headers["authorization"] == "Bearer test-token"
    assert request.url.path.endswith("/endpoints/123/chat/completions")
    payload = json.loads(request.content)
    assert payload["model"] == "google/gemma-4-test"
    assert payload["messages"][0]["role"] == "system"
    assert "untrusted_repository_context" in json.loads(payload["messages"][1]["content"])


@pytest.mark.parametrize(
    ("status", "code"),
    [
        (401, "gemma_permission"),
        (403, "gemma_permission"),
        (429, "gemma_quota"),
        (500, "gemma_error"),
    ],
)
def test_safe_upstream_errors(status, code):
    with client(Upstream(status=status)) as app:
        response = app.post(
            "/api/analyze", json={"repository": "meteor/meteor", "issue_number": 42}
        )
    assert response.json()["error"]["code"] == code
    assert "SECRET" not in response.text


@pytest.mark.parametrize(
    ("payload", "finish"),
    [({}, "stop"), (ANALYSIS, "length"), ({**ANALYSIS, "difficulty": "easy"}, "stop")],
)
def test_invalid_and_truncated_output_rejected(payload, finish):
    with client(Upstream(payload, finish=finish)) as app:
        response = app.post(
            "/api/analyze", json={"repository": "meteor/meteor", "issue_number": 42}
        )
        assert response.status_code == 502
        assert response.json()["error"]["code"] == "gemma_invalid"
        # An error must release the request guard.
        assert (
            app.post(
                "/api/analyze", json={"repository": "meteor/meteor", "issue_number": 42}
            ).status_code
            != 409
        )


def test_guide_and_feature_flag():
    with client(Upstream(GUIDE)) as app:
        assert (
            app.post("/api/issues/42/guide", json={"repository": "meteor/meteor"}).json()["result"][
                "steps"
            ]
            == GUIDE["steps"]
        )
    upstream = Upstream()
    with client(upstream, settings(enable_contribution_guide=False)) as app:
        assert (
            app.post("/api/issues/42/guide", json={"repository": "meteor/meteor"}).status_code
            == 409
        )
    assert not upstream.calls


@pytest.mark.parametrize(
    "body",
    [
        {"repository": "https://evil.test/repo", "issue_number": 42},
        {"issue_number": -1},
        {"issue_number": 42, "endpoint": "https://evil.test"},
    ],
)
def test_request_scope_is_fixed(body):
    upstream = Upstream()
    with client(upstream) as app:
        assert app.post("/api/analyze", json=body).status_code == 422
    assert not upstream.calls


def test_github_rate_limit_is_actionable():
    def limited(request):
        return httpx.Response(403, text="sensitive")

    with client(limited) as app:
        response = app.get("/api/issues", params={"repository": "meteor/meteor"})
    assert response.status_code == 429
    assert "GITHUB_TOKEN" in response.json()["error"]["message"]


def test_endpoint_config_rejects_remote_hosts_and_non_gemma_models():
    with pytest.raises(ValueError):
        settings(vertex_ai_endpoint_host="evil.example")
    with pytest.raises(ValueError):
        Settings(_env_file=None, gemma_model_id="gemini-other-model")


def test_request_timeout_becomes_safe_error():
    upstream = Upstream()

    def timeout(request):
        if request.method == "POST":
            raise httpx.ReadTimeout("internal", request=request)
        return upstream(request)

    with client(timeout) as app:
        assert (
            app.post(
                "/api/analyze", json={"repository": "meteor/meteor", "issue_number": 42}
            ).json()["error"]["code"]
            == "gemma_timeout"
        )


@pytest.mark.parametrize(
    "value", ["owner/repo", "https://github.com/Owner/Repo/", "https://github.com/Owner/Repo.git"]
)
def test_repository_inputs_normalize(value):
    assert normalize_repository(value) == "owner/repo"


@pytest.mark.parametrize(
    ("value", "message"),
    [
        ("s://github.com/meteor/", "https://"),
        ("https://github.com/meteor/", "Falta o nome do repositório"),
    ],
)
def test_incomplete_repository_urls_have_specific_guidance(value, message):
    with client(Upstream()) as app:
        response = app.get("/api/issues", params={"repository": value})
    assert response.status_code == 422
    assert message in response.json()["detail"][0]["msg"]


@pytest.mark.parametrize(
    "value",
    [
        "https://evil.test/owner/repo",
        "https://github.com/owner/repo/issues",
        "owner/..",
        "owner/repo?x=y",
        "https://github.com@evil.test/owner/repo",
        "http://127.0.0.1:8000/a",
        "owner/repo/../../etc",
    ],
)
def test_repository_inputs_cannot_change_api_host(value):
    with pytest.raises(ValueError):
        normalize_repository(value)


def test_private_repository_blocked_before_issue_or_model_request():
    calls = []

    def private(request):
        calls.append(request)
        return httpx.Response(200, json={"private": True, "visibility": "private"})

    with client(private) as app:
        assert app.get("/api/issues", params={"repository": "owner/private"}).status_code == 422
        response = app.post(
            "/api/analyze", json={"repository": "owner/private", "issue_number": 42}
        )
        assert response.json()["error"]["code"] == "private_repository"
    assert len(calls) == 2
    assert all(call.url.path == "/repos/owner/private" for call in calls)


def test_repository_selection_is_used_in_requests_evidence_and_cache():
    upstream = Upstream()
    with client(upstream) as app:
        first = app.post(
            "/api/analyze", json={"repository": "owner/one", "issue_number": 42}
        ).json()
        second = app.post(
            "/api/analyze", json={"repository": "owner/two", "issue_number": 42}
        ).json()
    assert first["repository"] == "owner/one"
    assert second["repository"] == "owner/two"
    assert "/owner/two/blob/" in second["result"]["evidence"][0]["url"]
    assert second["issue"]["url"] == "https://github.com/owner/two/issues/42"
    assert len(upstream.predictions) == 2


def test_no_open_issues_is_success_not_an_error():
    upstream = Upstream()

    def empty(request):
        if request.url.path.endswith("/issues"):
            return httpx.Response(200, json=[])
        return upstream(request)

    with client(empty) as app:
        response = app.get("/api/issues", params={"repository": "owner/repo"})
    assert response.status_code == 200
    assert response.json()["issues_state"] == "empty"
    assert response.json()["issues"] == []
    assert response.json()["scan_complete"] is True


def test_disabled_issues_do_not_call_github_issue_endpoint():
    paths = []

    def disabled(request):
        paths.append(request.url.path)
        return httpx.Response(200, json={"private": False, "has_issues": False})

    with client(disabled) as app:
        data = app.get("/api/issues", params={"repository": "owner/repo"}).json()
    assert data["issues_state"] == "disabled"
    assert paths == ["/repos/owner/repo"]


def test_full_pages_of_prs_do_not_claim_there_are_no_issues():
    upstream = Upstream()

    def prs(request):
        if request.url.path.endswith("/issues"):
            return httpx.Response(200, json=[{**ISSUE, "pull_request": {}}] * 30)
        return upstream(request)

    with client(prs) as app:
        data = app.get("/api/issues", params={"repository": "owner/repo"}).json()
    assert data["issues_state"] == "limited"
    assert data["scan_complete"] is False


def test_repository_overview_does_not_require_an_issue_or_classification_flag():
    upstream = Upstream(OVERVIEW)
    with client(upstream, settings(enable_issue_classification=False)) as app:
        response = app.post("/api/repository/analyze", json={"repository": "owner/repo"})
    assert response.status_code == 200, response.text
    assert response.json()["issue"] is None
    assert response.json()["result"]["next_steps"] == OVERVIEW["next_steps"]
    assert not any("/issues" in call.url.path for call in upstream.calls)
    prompt = json.loads(upstream.predictions[0].content)["messages"][1]["content"]
    assert json.loads(prompt)["untrusted_repository_context"]["issue"] is None


def test_repository_overview_respects_architecture_flag():
    upstream = Upstream(OVERVIEW)
    with client(upstream, settings(enable_architecture_analysis=False)) as app:
        response = app.post("/api/repository/analyze", json={"repository": "owner/repo"})
    assert response.status_code == 409
    assert not upstream.calls


@pytest.mark.parametrize("mode", ["empty", "binary_only"])
def test_repository_without_analyzable_content_never_calls_model(mode):
    upstream = Upstream(OVERVIEW)

    def no_content(request):
        if "/commits/" in request.url.path and mode == "empty":
            return httpx.Response(409, text="Git Repository is empty.")
        if "/git/trees/" in request.url.path:
            return httpx.Response(200, json={"tree": [{"path": "image.png", "type": "blob"}]})
        return upstream(request)

    with client(no_content) as app:
        response = app.post("/api/repository/analyze", json={"repository": "owner/repo"})
    assert response.status_code == 422
    assert response.json()["error"]["code"] == (
        "empty_repository" if mode == "empty" else "insufficient_context"
    )
    assert not upstream.predictions
