"""Capture base behavior and replay the identical inputs against head."""

from __future__ import annotations

import hashlib
import json
import sys
from collections.abc import Sequence
from pathlib import Path
from typing import Any

from cross_examine.characterize.edge_catalog import generate_inputs
from cross_examine.cross_examine.probe_protocol import (
    ProbeResult,
    canonical_envelope,
    display_result,
    parse_probe_output,
)
from cross_examine.execution import run_command
from cross_examine.schema import BehaviorFixture, Claim, ClaimKind, Finding, Layer, Outcome
from cross_examine.settings import DEFAULT_COMMAND_TIMEOUT_SECONDS

_RUNNER_MODULE = "cross_examine.cross_examine.probe_runner"


def capture_base(
    claims: Sequence[Claim],
    base_path: str | Path,
    state_dir: str | Path,
    timeout: float = DEFAULT_COMMAND_TIMEOUT_SECONDS,
    deadline: float | None = None,
) -> list[BehaviorFixture]:
    base = Path(base_path).resolve()
    state = Path(state_dir).resolve()
    state.mkdir(parents=True, exist_ok=True)
    descriptions: dict[str, ProbeResult] = {}
    fixtures: list[BehaviorFixture] = []

    for claim in claims:
        description = descriptions.get(claim.target_symbol)
        if description is None:
            description = _probe(
                "describe", claim.target_symbol, base, timeout=timeout, deadline=deadline
            )
            descriptions[claim.target_symbol] = description
        if description.envelope is None or not description.envelope.get("ok"):
            continue
        signature = description.envelope.get("value")
        if not isinstance(signature, dict):
            continue
        inputs, _ = generate_inputs(signature)
        for index, (args, kwargs) in enumerate(inputs):
            fixture_id = _fixture_id(claim, index)
            request_path = _write_request(state, "base", fixture_id, args, kwargs)
            result = _probe(
                "call",
                claim.target_symbol,
                base,
                request_path=request_path,
                timeout=timeout,
                deadline=deadline,
            )
            if result.envelope is None:
                continue
            fixtures.append(
                BehaviorFixture(
                    id=fixture_id,
                    claim_id=claim.id,
                    target_symbol=claim.target_symbol,
                    args_json=_canonical_json(args),
                    kwargs_json=_canonical_json(kwargs),
                    expected_json=canonical_envelope(result.envelope),
                    command=result.evidence.command,
                    output=result.evidence.output,
                )
            )
    return fixtures


def run_layer_a(
    claims: Sequence[Claim],
    fixtures: Sequence[BehaviorFixture],
    head_path: str | Path,
    state_dir: str | Path,
    timeout: float = DEFAULT_COMMAND_TIMEOUT_SECONDS,
    deadline: float | None = None,
) -> list[Finding]:
    head = Path(head_path).resolve()
    state = Path(state_dir).resolve()
    state.mkdir(parents=True, exist_ok=True)
    by_claim: dict[str, list[BehaviorFixture]] = {}
    for fixture in fixtures:
        by_claim.setdefault(fixture.claim_id, []).append(fixture)

    findings: list[Finding] = []
    for claim in claims:
        claim_fixtures = by_claim.get(claim.id, [])
        if not claim_fixtures:
            attempt = _probe(
                "describe", claim.target_symbol, head, timeout=timeout, deadline=deadline
            )
            if attempt.envelope is not None and attempt.envelope.get("ok"):
                signature = attempt.envelope.get("value")
                inputs, reason = (
                    generate_inputs(signature) if isinstance(signature, dict) else ([], None)
                )
                if inputs:
                    args, kwargs = inputs[0]
                    request_path = _write_request(
                        state,
                        "head",
                        _fixture_id(claim, 0),
                        args,
                        kwargs,
                    )
                    attempt = _probe(
                        "call",
                        claim.target_symbol,
                        head,
                        request_path=request_path,
                        timeout=timeout,
                        deadline=deadline,
                    )
                elif reason:
                    attempt = ProbeResult(
                        evidence=attempt.evidence,
                        envelope=None,
                        error=reason,
                    )
            findings.append(
                Finding(
                    claim_id=claim.id,
                    layer=Layer.BEHAVIORAL_DIFF,
                    outcome=Outcome.UNVERIFIABLE,
                    command=attempt.evidence.command,
                    output=_diagnostic_output(attempt, "No runnable base inputs were captured."),
                    confidence=1.0,
                )
            )
            continue

        for fixture in claim_fixtures:
            args = json.loads(fixture.args_json)
            kwargs = json.loads(fixture.kwargs_json)
            request_path = _write_request(state, "head", fixture.id, args, kwargs)
            actual = _probe(
                "call",
                fixture.target_symbol,
                head,
                request_path=request_path,
                timeout=timeout,
                deadline=deadline,
            )
            if actual.envelope is None:
                findings.append(
                    Finding(
                        claim_id=claim.id,
                        layer=Layer.BEHAVIORAL_DIFF,
                        outcome=Outcome.UNVERIFIABLE,
                        command=actual.evidence.command,
                        output=_diagnostic_output(actual, "Head replay did not produce a result."),
                        repro_input=_display_input(args, kwargs),
                        confidence=1.0,
                    )
                )
                continue

            expected_envelope = json.loads(fixture.expected_json)
            actual_json = canonical_envelope(actual.envelope)
            equal = fixture.expected_json == actual_json
            if claim.kind is ClaimKind.INTENDED_CHANGE:
                outcome = Outcome.UNVERIFIABLE
            elif equal:
                outcome = Outcome.VERIFIED
            elif claim.preserve_critical:
                outcome = Outcome.REFUTED
            else:
                outcome = Outcome.UNVERIFIABLE
            findings.append(
                Finding(
                    claim_id=claim.id,
                    layer=Layer.BEHAVIORAL_DIFF,
                    outcome=outcome,
                    command=actual.evidence.command,
                    output=_comparison_output(fixture, actual)
                    + (
                        "\nABSTENTION\nBase/head preservation evidence cannot verify an intended change.\n"
                        if claim.kind is ClaimKind.INTENDED_CHANGE
                        else ""
                    ),
                    repro_input=_display_input(args, kwargs),
                    expected=display_result(expected_envelope),
                    actual=display_result(actual.envelope),
                    confidence=1.0,
                )
            )
    return findings


def _probe(
    mode: str,
    target_symbol: str,
    worktree: Path,
    *,
    timeout: float,
    deadline: float | None = None,
    request_path: Path | None = None,
) -> ProbeResult:
    argv = [sys.executable, "-P", "-m", _RUNNER_MODULE, mode, target_symbol]
    if request_path is not None:
        argv.append(str(request_path))
    evidence = run_command(
        argv,
        cwd=worktree,
        timeout=timeout,
        deadline=deadline,
        env={"CROSS_EXAMINE_WORKTREE": str(worktree)},
    )
    return parse_probe_output(evidence)


def _write_request(
    state: Path,
    revision: str,
    fixture_id: str,
    args: list[Any],
    kwargs: dict[str, Any],
) -> Path:
    directory = state / "requests" / revision
    directory.mkdir(parents=True, exist_ok=True)
    path = directory / f"{fixture_id}.json"
    path.write_text(_canonical_json({"args": args, "kwargs": kwargs}), encoding="utf-8")
    return path


def _fixture_id(claim: Claim, index: int) -> str:
    material = f"{claim.id}\0{claim.target_symbol}\0{index}".encode()
    return hashlib.sha256(material).hexdigest()[:20]


def _canonical_json(value: Any) -> str:
    return json.dumps(value, ensure_ascii=False, separators=(",", ":"), sort_keys=True)


def _display_input(args: list[Any], kwargs: dict[str, Any]) -> str:
    if len(args) == 1 and not kwargs:
        return _canonical_json(args[0])
    return _canonical_json({"args": args, "kwargs": kwargs})


def _comparison_output(fixture: BehaviorFixture, actual: ProbeResult) -> str:
    return (
        f"BASE COMMAND\n{fixture.command}\nBASE OUTPUT\n{fixture.output.rstrip()}\n\n"
        f"HEAD OUTPUT\n{actual.evidence.output.rstrip()}\n"
    )


def _diagnostic_output(result: ProbeResult, message: str) -> str:
    details = result.evidence.output.rstrip()
    reason = result.error or message
    return f"{details}\n{reason}\n".lstrip("\n")
