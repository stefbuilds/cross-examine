"""HTTP response models that wrap the domain contract."""

from typing import Any

from pydantic import BaseModel, Field, field_validator


class HealthResponse(BaseModel):
    status: str
    hosted: bool = False


class FixtureResponse(BaseModel):
    fixture: bool
    report: dict[str, Any]


class RunResponse(BaseModel):
    id: str
    repo: str
    base_ref: str
    head_ref: str
    status: str
    stage: str
    message: str
    report: dict[str, Any] | None


class RunSummaryResponse(BaseModel):
    id: str
    repo: str
    base_ref: str
    head_ref: str
    status: str
    stage: str
    message: str
    created_at: str
    updated_at: str
    verdict: str | None


class RunCreateRequest(BaseModel):
    repo: str = Field(min_length=1, max_length=2048)
    base_ref: str = Field(min_length=1, max_length=512)
    head_ref: str = Field(min_length=1, max_length=512)
    layer_b: bool = True
    command_timeout_seconds: int = Field(default=120, ge=1, le=600)
    run_timeout_seconds: int = Field(default=600, ge=1, le=3600)

    @field_validator("repo", "base_ref", "head_ref")
    @classmethod
    def strip_nonempty(cls, value: str) -> str:
        stripped = value.strip()
        if not stripped:
            raise ValueError("must not be blank")
        return stripped

    @field_validator("repo")
    @classmethod
    def reject_option_like_repo(cls, value: str) -> str:
        if value.startswith("-") or any(ord(character) < 32 for character in value):
            raise ValueError("must be a path or Git URL, not an option")
        return value

    @field_validator("base_ref", "head_ref")
    @classmethod
    def reject_unsafe_ref(cls, value: str) -> str:
        if value.startswith("-") or any(character.isspace() for character in value):
            raise ValueError("must be a safe Git revision")
        return value


class RunAcceptedResponse(BaseModel):
    id: str
    status: str


class CorpusSummaryResponse(BaseModel):
    repo: str
    corpus_total: int
    latest_growth: int
    last_run_id: str
    updated_at: str
