import json

import httpx
import pytest
from fastapi.testclient import TestClient
from test_api import ANALYSIS, Upstream

from app.config import Settings
from app.main import create_app


@pytest.mark.parametrize(
    "finish,status,expected",
    [("STOP", 200, 200), ("MAX_TOKENS", 200, 502), ("STOP", 403, 503), ("STOP", 429, 429)],
)
def test_google_ai_contract(finish, status, expected):
    github = Upstream()
    calls = []

    def transport(request):
        if request.url.host != "generativelanguage.googleapis.com":
            return github(request)
        calls.append(request)
        assert request.headers["x-goog-api-key"] == "test-only-secret"
        assert "test-only-secret" not in str(request.url)
        body = json.loads(request.content)
        assert "systemInstruction" in body
        assert "untrusted_repository_context" in body["contents"][0]["parts"][0]["text"]
        return httpx.Response(
            status,
            json={
                "candidates": [
                    {
                        "finishReason": finish,
                        "content": {
                            "parts": [
                                {"thought": True, "text": "not output"},
                                {"text": json.dumps(ANALYSIS)},
                            ]
                        },
                    }
                ],
                "usageMetadata": {"totalTokenCount": 25},
            },
        )

    settings = Settings(
        _env_file=None,
        gemma_provider="google-ai",
        gemma_model_id="gemma-4-26b-a4b-it",
        google_ai_api_key="test-only-secret",
    )

    def no_adc():
        raise AssertionError("Google AI must not use ADC")

    with TestClient(create_app(settings, httpx.MockTransport(transport), no_adc)) as client:
        health = client.get("/api/health")
        assert health.json()["gemma"]["configured"]
        assert "test-only-secret" not in health.text
        response = client.post(
            "/api/analyze", json={"repository": "meteor/meteor", "issue_number": 42}
        )
        assert response.status_code == expected
        assert len(calls) == 1
        if expected == 200:
            assert response.json()["metadata"]["provider"] == "google-ai"
            assert response.json()["metadata"]["usage"]["total_tokens"] == 25
            assert len(response.json()["result"]["evidence"]) == 1


def test_google_ai_requires_key_without_vertex_fields():
    settings = Settings(
        _env_file=None, gemma_provider="google-ai", gemma_model_id="gemma-4-26b-a4b-it"
    )
    assert settings.missing_configuration == ["GOOGLE_AI_API_KEY"]
    piped = Settings(
        _env_file=None,
        gemma_provider="google-ai\r\n",
        gemma_model_id="gemma-4-26b-a4b-it\r\n",
        google_ai_api_key="test\r\n",
    )
    assert piped.missing_configuration == []
    assert piped.google_ai_api_key == "test"
    with pytest.raises(ValueError):
        Settings(_env_file=None, gemma_provider="google-ai", gemma_model_id="gemini-test")
