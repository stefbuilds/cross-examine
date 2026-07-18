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
from cross_examine.schema import (
    BehaviorFixture,
    Claim,
    ClaimKind,
    EvidenceReceipt,
    Finding,
    Layer,
    Outcome,
)
from cross_examine.probe_plans import (
    ProbePlan,
    ProbePlanError,
    schedule_probe_plans,
    validate_probe_plan,
)
from cross_examine.settings import DEFAULT_COMMAND_TIMEOUT_SECONDS

_RUNNER_MODULE = "cross_examine.cross_examine.probe_runner"


def capture_base(
    claims: Sequence[Claim],
    base_path: str | Path,
    state_dir: str | Path,
    timeout: float = DEFAULT_COMMAND_TIMEOUT_SECONDS,
    deadline: float | None = None,
    corpus_coverage: dict[str, int] | None = None,
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
                    receipt=result.evidence.receipt,
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
                        receipts=_receipts(actual.evidence.receipt),
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
                    command=f"{fixture.command}\n{actual.evidence.command}",
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
                    receipts=_receipts(fixture.receipt, actual.evidence.receipt),
                )
            )
    return findings


def run_probe_plans(
    claims: Sequence[Claim],
    plans: Sequence[ProbePlan],
    base_path: str | Path,
    head_path: str | Path,
    state_dir: str | Path,
    timeout: float = DEFAULT_COMMAND_TIMEOUT_SECONDS,
    deadline: float | None = None,
    corpus_coverage: dict[str, int] | None = None,
) -> list[Finding]:
    """Execute validated relation plans, preserving every execution artifact.

    A plan only refutes when the relation holds on base and fails on head.
    If base cannot establish the relation, execution abstains rather than
    treating a raw base/head difference as the requested property.
    """
    base, head, state = Path(base_path).resolve(), Path(head_path).resolve(), Path(state_dir).resolve()
    state.mkdir(parents=True, exist_ok=True)
    claims_by_id = {claim.id: claim for claim in claims}
    allowed_targets = {claim.target_symbol for claim in claims}
    ranked = schedule_probe_plans(list(plans), corpus_coverage)
    findings: list[Finding] = []
    signatures: dict[str, dict[str, object]] = {}
    for plan in ranked:
        claim = claims_by_id.get(plan.claim_id)
        if claim is None or claim.target_symbol != plan.target_symbol:
            findings.append(_plan_abstention(plan, "plan does not match a characterized claim"))
            continue
        signature = signatures.get(plan.target_symbol)
        if signature is None:
            described = _probe("describe", plan.target_symbol, base, timeout=timeout, deadline=deadline)
            if described.envelope is None or not described.envelope.get("ok") or not isinstance(described.envelope.get("value"), dict):
                findings.append(_plan_abstention(plan, described.error or "could not discover signature", described))
                continue
            signature = described.envelope["value"]
            signatures[plan.target_symbol] = signature
        try:
            validate_probe_plan(plan, signature, allowed_targets)
            seed = _plan_seed(plan)
            base_ok, base_calls = _relation_holds(plan, base, state, "base", seed, timeout, deadline)
            head_ok, head_calls = _relation_holds(plan, head, state, "head", seed, timeout, deadline)
        except ProbePlanError as exc:
            findings.append(_plan_abstention(plan, str(exc)))
            continue
        except ValueError as exc:
            findings.append(_plan_abstention(plan, str(exc)))
            continue
        if not base_ok or head_ok:
            outcome = Outcome.UNVERIFIABLE if not base_ok else Outcome.VERIFIED
        elif claim.preserve_critical:
            outcome = Outcome.REFUTED
        else:
            outcome = Outcome.UNVERIFIABLE
        calls = {"base": base_calls, "head": head_calls}
        command = "\n".join(call.evidence.command for call in [*base_calls, *head_calls])
        output = _relation_output(plan, seed, base_ok, head_ok, base_calls, head_calls)
        findings.append(
            Finding(
                claim_id=claim.id,
                layer=Layer.BEHAVIORAL_DIFF,
                outcome=outcome,
                command=command,
                output=output,
                repro_input=_canonical_json(seed),
                expected=_canonical_json([call.envelope for call in base_calls]),
                actual=_canonical_json([call.envelope for call in head_calls]),
                confidence=1.0,
                provenance={"probe_plan": plan.__dict__, "calls": _calls_provenance(calls)},
                receipts=_receipts(
                    *(call.evidence.receipt for call in [*base_calls, *head_calls])
                ),
            )
        )
    return findings


def _plan_seed(plan: ProbePlan) -> object:
    parameters = plan.input_domain["parameters"]
    name = plan.relation_parameters["parameter"]
    values = parameters[name]
    value = values[0]
    return value


def _relation_holds(
    plan: ProbePlan, worktree: Path, state: Path, revision: str, seed: object, timeout: float, deadline: float | None
) -> tuple[bool, list[ProbeResult]]:
    def call(index: int, value: object) -> ProbeResult:
        request = _write_request(state, revision, f"{plan.id}-{index}", [value], {})
        result = _probe("call", plan.target_symbol, worktree, request_path=request, timeout=timeout, deadline=deadline)
        if result.envelope is None:
            raise ValueError(result.error or "relation probe did not produce an envelope")
        return result

    first = call(0, seed)
    if plan.relation_type == "permutation_invariance":
        if not isinstance(seed, list):
            raise ValueError("permutation relation seed is not a JSON list")
        second = call(1, list(reversed(seed)))
        return canonical_envelope(first.envelope) == canonical_envelope(second.envelope), [first, second]
    if plan.relation_type == "partition_concatenation":
        if not isinstance(seed, list):
            raise ValueError("partition relation seed is not a JSON list")
        midpoint = max(1, len(seed) // 2)
        left, right = call(1, seed[:midpoint]), call(2, seed[midpoint:])
        if not all(result.envelope and result.envelope.get("ok") for result in (first, left, right)):
            return False, [first, left, right]
        if not isinstance(left.envelope["value"], list) or not isinstance(right.envelope["value"], list):
            return False, [first, left, right]
        joined = left.envelope["value"] + right.envelope["value"]
        return first.envelope["value"] == joined, [first, left, right]
    if not first.envelope or not first.envelope.get("ok"):
        return False, [first]
    second = call(1, first.envelope["value"])
    return canonical_envelope(first.envelope) == canonical_envelope(second.envelope), [first, second]


def _calls_provenance(calls: dict[str, list[ProbeResult]]) -> dict[str, object]:
    return {
        revision: [
            {"command": call.evidence.command, "output": call.evidence.output, "envelope": call.envelope}
            for call in results
        ]
        for revision, results in calls.items()
    }


def _relation_output(plan: ProbePlan, seed: object, base_ok: bool, head_ok: bool, base_calls: list[ProbeResult], head_calls: list[ProbeResult]) -> str:
    return (
        f"PROBE PLAN\nplan_id={plan.id}\nrelation={plan.relation_type}\nseed={_canonical_json(seed)}\n"
        f"base_relation_holds={base_ok}\nhead_relation_holds={head_ok}\n"
        f"BASE RESULTS\n{_calls_output(base_calls)}\n"
        f"HEAD RESULTS\n{_calls_output(head_calls)}\n"
        f"MINIMIZED COUNTEREXAMPLE\n{_canonical_json(seed)}\n"
    )


def _calls_output(calls: Sequence[ProbeResult]) -> str:
    return "\n".join(
        f"COMMAND\n{call.evidence.command}\nOUTPUT\n{call.evidence.output}"
        for call in calls
    )


def _receipts(*receipts: EvidenceReceipt | None) -> list[EvidenceReceipt]:
    return [receipt for receipt in receipts if receipt is not None]


def _plan_abstention(plan: ProbePlan, reason: str, result: ProbeResult | None = None) -> Finding:
    return Finding(
        claim_id=plan.claim_id,
        layer=Layer.BEHAVIORAL_DIFF,
        outcome=Outcome.UNVERIFIABLE,
        command=result.evidence.command if result else f"probe-plan:{plan.id}",
        output=(result.evidence.output + "\n" if result else "") + f"ProbePlan {plan.id}: {reason}",
        provenance={"probe_plan": plan.__dict__},
    )


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
