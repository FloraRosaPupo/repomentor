import re
from pathlib import Path
from typing import Literal

from pydantic import Field, field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

ROOT = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=ROOT / ".env", extra="ignore")

    google_cloud_project: str = ""
    gemma_provider: Literal["vertex-ai", "google-ai"] = "vertex-ai"
    google_ai_api_key: str = Field(default="", repr=False)
    google_cloud_location: str = ""
    vertex_ai_endpoint_id: str = ""
    # Dedicated public endpoints may require their dedicatedEndpointDns hostname.
    vertex_ai_endpoint_host: str = ""
    gemma_model_id: str = ""
    github_token: str = Field(default="", repr=False)
    enable_architecture_analysis: bool = True
    enable_issue_classification: bool = True
    enable_contribution_guide: bool = True
    enable_cache: bool = True
    request_timeout_seconds: float = Field(default=120, ge=5, le=300)

    @field_validator("gemma_provider", "gemma_model_id", "google_ai_api_key", mode="before")
    @classmethod
    def strip_environment_whitespace(cls, value):
        return value.strip() if isinstance(value, str) else value

    @model_validator(mode="after")
    def validate_endpoint(self):
        if self.gemma_provider == "google-ai" and self.gemma_model_id not in (
            "",
            "gemma-4-26b-a4b-it",
            "gemma-4-31b-it",
        ):
            raise ValueError("Select a supported Gemma 4 model for Google AI.")
        for value in (
            self.google_cloud_project,
            self.google_cloud_location,
            self.vertex_ai_endpoint_id,
        ):
            if value and not re.fullmatch(r"[a-zA-Z0-9-]+", value):
                raise ValueError("Project, location and endpoint must be identifiers, not URLs.")
        if self.vertex_ai_endpoint_host and not re.fullmatch(
            r"[a-z0-9.-]+\.prediction\.vertexai\.goog", self.vertex_ai_endpoint_host
        ):
            raise ValueError("Use only the dedicated Vertex AI prediction hostname.")
        if self.gemma_model_id and not re.search(r"gemma[-_ ]?4", self.gemma_model_id, re.I):
            raise ValueError("GEMMA_MODEL_ID must identify a Gemma 4 model.")
        return self

    @property
    def missing_configuration(self) -> list[str]:
        if self.gemma_provider == "google-ai":
            return [
                name.upper()
                for name in ("google_ai_api_key", "gemma_model_id")
                if not getattr(self, name)
            ]
        names = [
            "google_cloud_project",
            "google_cloud_location",
            "vertex_ai_endpoint_id",
            "gemma_model_id",
        ]
        return [name.upper() for name in names if not getattr(self, name)]

    @property
    def endpoint_url(self) -> str:
        if self.gemma_provider == "google-ai":
            return (
                "https://generativelanguage.googleapis.com/v1beta/models/"
                f"{self.gemma_model_id}:generateContent"
            )
        host = (
            self.vertex_ai_endpoint_host
            or f"{self.google_cloud_location}-aiplatform.googleapis.com"
        )
        return (
            f"https://{host}/v1beta1/projects/{self.google_cloud_project}"
            f"/locations/{self.google_cloud_location}/endpoints/{self.vertex_ai_endpoint_id}/chat/completions"
        )
