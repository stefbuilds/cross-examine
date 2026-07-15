"""Strict model-owned shapes for Characterize output."""

from typing import Literal

from pydantic import BaseModel, ConfigDict


class ClaimPayload(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: str
    text: str
    target_symbol: str
    risk: Literal["high", "med", "low"]
    proposed_check: str
    preserve_critical: bool
    kind: Literal["preservation", "intended_change"]


class CharacterizationPayload(BaseModel):
    model_config = ConfigDict(extra="forbid")

    claims: list[ClaimPayload]
