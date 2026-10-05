"""Stage 4 — Aggregate: pure, deterministic claim status from executed checks.

No IO, models, network, subprocess, database or framework imports (enforced by a
test). Missing or incomplete required checks leave a claim UNRESOLVED, and an
unresolved material claim contributes to record risk — never toward "no defect".
"""

from __future__ import annotations

from collections.abc import Iterable

from cross_examine_legal.schema import (
    Aggregate,
    CheckOutcome,
    ClaimChecks,
    ClaimStatus,
    RecordRisk,
)


def claim_status(claim: ClaimChecks) -> ClaimStatus:
    if any(r.outcome is CheckOutcome.REFUTED for r in claim.results):
        return ClaimStatus.CONTRADICTED
    verified = {r.kind for r in claim.results if r.outcome is CheckOutcome.VERIFIED}
    if claim.required and set(claim.required) <= verified:
        return ClaimStatus.MECHANICALLY_SUPPORTED
    return ClaimStatus.UNRESOLVED


def aggregate(claims: Iterable[ClaimChecks]) -> Aggregate:
    statuses: dict[str, ClaimStatus] = {}
    material: set[str] = set()
    for claim in claims:
        if claim.claim_id in statuses:
            raise ValueError(f"duplicate claim id: {claim.claim_id}")
        statuses[claim.claim_id] = claim_status(claim)
        if claim.material:
            material.add(claim.claim_id)
    material_statuses = {statuses[c] for c in material}
    if ClaimStatus.CONTRADICTED in material_statuses:
        risk = RecordRisk.CONTRADICTED_MATERIAL_CLAIM
    elif ClaimStatus.UNRESOLVED in material_statuses:
        risk = RecordRisk.UNRESOLVED_MATERIAL_CLAIM
    else:
        risk = RecordRisk.NO_MECHANICAL_DEFECT_FOUND
    return Aggregate(claims=statuses, risk=risk)
