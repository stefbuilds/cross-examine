"""Strict model-owned shapes for Characterize output."""

from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field


class ClaimPayload(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: str
    text: str
    target_symbol: str
    risk: Literal["high", "med", "low"]
    proposed_check: str
    preserve_critical: bool
    kind: Literal["preservation", "intended_change"]


class ProbePlanPayload(BaseModel):
    """Untrusted proposal; runtime validation checks the discovered signature."""

    model_config = ConfigDict(extra="forbid")

    id: str
    version: Literal[1]
    claim_id: str
    target_symbol: str
    input_domain: dict[str, Any]
    relation_type: Literal[
        "identity_idempotence",
        "permutation_invariance",
        "normalization_stability",
        "partition_concatenation",
    ]
    relation_parameters: dict[str, Any]
    oracle_category: Literal["metamorphic"]
    priority: int = Field(ge=0, le=10)
    budget: int = Field(ge=1, le=16)
    provenance: dict[str, Any]


class CharacterizationPayload(BaseModel):
    model_config = ConfigDict(extra="forbid")

    claims: list[ClaimPayload]
    probe_plans: list[ProbePlanPayload] = Field(default_factory=list)
