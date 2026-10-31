import re
from pathlib import Path

from pydantic import Field, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

ROOT = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=ROOT / ".env", extra="ignore")

    google_cloud_project: str = ""
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

    @model_validator(mode="after")
    def validate_endpoint(self):
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
        names = [
            "google_cloud_project",
            "google_cloud_location",
            "vertex_ai_endpoint_id",
            "gemma_model_id",
        ]
        return [name.upper() for name in names if not getattr(self, name)]

    @property
    def endpoint_url(self) -> str:
        host = (
            self.vertex_ai_endpoint_host
            or f"{self.google_cloud_location}-aiplatform.googleapis.com"
        )
        return (
            f"https://{host}/v1beta1/projects/{self.google_cloud_project}"
            f"/locations/{self.google_cloud_location}/endpoints/{self.vertex_ai_endpoint_id}/chat/completions"
        )
