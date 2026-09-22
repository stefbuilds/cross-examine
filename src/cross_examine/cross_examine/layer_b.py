"""Parent-side adapter for the isolated Hypothesis differential worker."""

from __future__ import annotations

import hashlib
import json
import sys
from collections.abc import Sequence
from pathlib import Path
from typing import Any

from cross_examine.execution import run_command
from cross_examine.schema import Claim, Finding, Layer, Outcome
from cross_examine.settings import DEFAULT_COMMAND_TIMEOUT_SECONDS

_WORKER_MODULE = "cross_examine.cross_examine.hypothesis_worker"


def run_layer_b(
    claims: Sequence[Claim],
    base_path: str | Path,
    head_path: str | Path,
    state_dir: str | Path,
    timeout: float = DEFAULT_COMMAND_TIMEOUT_SECONDS,
    deadline: float | None = None,
    planned_claim_ids: set[str] | None = None,
) -> list[Finding]:
    base = Path(base_path).resolve()
    head = Path(head_path).resolve()
    state = Path(state_dir).resolve()
    state.mkdir(parents=True, exist_ok=True)
    findings: list[Finding] = []
    planned_claim_ids = planned_claim_ids or set()

    for claim in claims:
        # A relation plan defines the property under test. Do not silently
        # downgrade it to "any base/head difference" in the search worker.
        if claim.id in planned_claim_ids:
            continue
        if not claim.preserve_critical:
            continue
        claim_state = state / hashlib.sha256(claim.id.encode()).hexdigest()[:20]
        claim_state.mkdir(parents=True, exist_ok=True)
        argv = [
            sys.executable,
            "-P",
            "-m",
            _WORKER_MODULE,
            claim.target_symbol,
            str(base),
            str(head),
            str(claim_state),
        ]
        evidence = run_command(argv, cwd=state, timeout=timeout, deadline=deadline)
        payload = _parse_worker(evidence.stdout)
        if (
            payload is None
            or evidence.timed_out
            or evidence.output_truncated
            or evidence.exit_code != 0
        ):
            findings.append(
                Finding(
                    claim_id=claim.id,
                    layer=Layer.ADVERSARIAL,
                    outcome=Outcome.UNVERIFIABLE,
                    command=evidence.command,
                    output=evidence.output or "Layer-B worker produced no grounded output",
                    confidence=1.0,
                    receipts=[evidence.receipt] if evidence.receipt is not None else [],
                )
            )
            continue

        status = payload.get("status")
        outcome = {
            "verified": Outcome.VERIFIED,
            "refuted": Outcome.REFUTED,
            "unverifiable": Outcome.UNVERIFIABLE,
        }.get(status, Outcome.UNVERIFIABLE)
        findings.append(
            Finding(
                claim_id=claim.id,
                layer=Layer.ADVERSARIAL,
                outcome=outcome,
                command=evidence.command,
                output=evidence.output,
                repro_input=payload.get("repro_input"),
                expected=payload.get("expected"),
                actual=payload.get("actual"),
                confidence=1.0,
                receipts=[evidence.receipt] if evidence.receipt is not None else [],
            )
        )
    return findings


def _parse_worker(stdout: str) -> dict[str, Any] | None:
    for line in reversed(stdout.splitlines()):
        try:
            payload = json.loads(line)
        except json.JSONDecodeError:
            continue
        if isinstance(payload, dict) and payload.get("cross_examine_layer_b") == 1:
            return payload
    return None
