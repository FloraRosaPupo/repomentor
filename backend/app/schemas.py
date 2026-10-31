import re
from typing import Annotated, Literal
from urllib.parse import urlsplit

from pydantic import AfterValidator, BaseModel, ConfigDict, Field


def normalize_repository(value: str) -> str:
    value = value.strip()
    if "://" in value and not value.startswith("https://"):
        raise ValueError(
            "A URL deve começar com https:// e incluir o repositório. Exemplo: https://github.com/meteor/meteor."
        )
    if value.startswith("https://"):
        parsed = urlsplit(value)
        if parsed.netloc != "github.com" or parsed.query or parsed.fragment:
            raise ValueError("Use uma URL https://github.com/organização/repositório.")
        value = parsed.path.strip("/")
    if re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9-]{0,38}/?", value):
        raise ValueError(
            "Falta o nome do repositório depois da organização ou perfil. Para o Meteor, use meteor/meteor."
        )
    if value.endswith(".git"):
        value = value[:-4]
    if not re.fullmatch(r"[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})/[A-Za-z0-9_.-]{1,100}", value):
        raise ValueError("Informe organização/repositório ou sua URL pública no GitHub.")
    if value.split("/")[1] in (".", ".."):
        raise ValueError("Nome de repositório inválido.")
    return value.lower()


RepositoryName = Annotated[str, Field(max_length=200), AfterValidator(normalize_repository)]


class StrictModel(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)


class RepositoryRequest(StrictModel):
    repository: RepositoryName
    language: Literal["pt", "en"] = "pt"


class AnalyzeRequest(RepositoryRequest):
    issue_number: int = Field(gt=0)


class Evidence(StrictModel):
    path: str = Field(min_length=1, max_length=300)
    reason: str = Field(min_length=1, max_length=1500)


class Analysis(StrictModel):
    summary: str = Field(min_length=1, max_length=4000)
    architecture: str = Field(min_length=1, max_length=4000)
    difficulty: Literal["beginner", "intermediate", "advanced", "unclear"]
    reasoning: str = Field(min_length=1, max_length=4000)
    required_knowledge: list[str] = Field(max_length=15)
    evidence: list[Evidence] = Field(max_length=15)
    limitations: list[str] = Field(min_length=1, max_length=15)


class Guide(StrictModel):
    summary: str = Field(min_length=1, max_length=4000)
    steps: list[str] = Field(min_length=1, max_length=12)
    testing_strategy: list[str] = Field(min_length=1, max_length=12)
    questions_for_maintainers: list[str] = Field(max_length=10)
    evidence: list[Evidence] = Field(max_length=15)
    limitations: list[str] = Field(min_length=1, max_length=15)


class RepositoryOverview(StrictModel):
    summary: str = Field(min_length=1, max_length=4000)
    architecture: str = Field(min_length=1, max_length=4000)
    technologies: list[str] = Field(max_length=15)
    next_steps: list[str] = Field(min_length=1, max_length=12)
    evidence: list[Evidence] = Field(max_length=15)
    limitations: list[str] = Field(min_length=1, max_length=15)


class ServiceError(Exception):
    def __init__(self, code: str, message: str, status: int = 502):
        self.code, self.message, self.status = code, message, status
        super().__init__(message)
