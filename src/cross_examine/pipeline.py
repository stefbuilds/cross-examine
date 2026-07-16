"""Five-stage orchestration with deterministic verdict aggregation."""

from __future__ import annotations

import json
import os
import re
import sys
import time
from collections.abc import Callable, Sequence
from pathlib import Path
from typing import Protocol
from uuid import uuid4

from cross_examine.corpus.repository import CorpusRepository
from cross_examine.cross_examine.layer_a import capture_base, run_layer_a, run_probe_plans
from cross_examine.cross_examine.layer_b import run_layer_b
from cross_examine.execution import RunDeadlineExceeded, run_command
from cross_examine.ingest.service import IngestService
from cross_examine.schema import (
    BehaviorFixture,
    Claim,
    ClaimKind,
    CommandEvidence,
    CorpusDelta,
    Finding,
    Layer,
    Outcome,
    Report,
    RunProgress,
    RunSpec,
    aggregate,
)
from cross_examine.probe_plans import ProbePlan
from cross_examine.validation import validate_report

ProgressCallback = Callable[[RunProgress], None]


class CharacterizerLike(Protocol):
    def characterize(self, ingest: object, *, timeout: float | None = None) -> list[Claim]: ...


class Pipeline:
    def __init__(
        self,
        *,
        characterizer: CharacterizerLike,
        corpus: CorpusRepository,
        runs_root: str | Path,
        ingest: IngestService | None = None,
    ) -> None:
        self.characterizer = characterizer
        self.corpus = corpus
        self.runs_root = Path(runs_root).resolve()
        self.ingest = ingest or IngestService()

    def run(
        self,
        spec: RunSpec,
        progress: ProgressCallback | None = None,
        *,
        run_id: str | None = None,
    ) -> Report:
        identifier = run_id or uuid4().hex
        started = time.monotonic()
        deadline = started + float(spec.run_timeout_seconds)
        emit = _emitter(identifier, started, progress)
        claims: list[Claim] = []
        findings: list[Finding] = []

        try:
            emit("ingesting", "Materializing base and head revisions")
            ingest = self.ingest.ingest(
                spec,
                self.runs_root / identifier,
                deadline=deadline,
            )
            _remaining_timeout(deadline, spec.command_timeout_seconds)
        except Exception as exc:  # noqa: BLE001 - stage failures become abstentions
            return self._failure_report(spec, "ingesting", exc, claims, findings, emit)

        try:
            emit("characterizing", "Deriving schema-constrained behavioral claims")
            claims = self.characterizer.characterize(
                ingest,
                timeout=_remaining_timeout(deadline, spec.command_timeout_seconds),
            )
            _remaining_timeout(deadline, spec.command_timeout_seconds)
        except Exception as exc:  # noqa: BLE001 - stage failures become abstentions
            return self._failure_report(spec, "characterizing", exc, claims, findings, emit)

        try:
            emit("capturing", "Executing deterministic probes against base")
            fixtures = capture_base(
                claims,
                ingest.base_path,
                self.runs_root / identifier / "probe-state",
                timeout=spec.command_timeout_seconds,
                deadline=deadline,
            )
            fixtures = _dedupe_fixtures([*self._applicable_corpus(spec.repo, claims), *fixtures])
        except Exception as exc:  # noqa: BLE001 - stage failures become abstentions
            return self._failure_report(spec, "capturing", exc, claims, findings, emit)

        try:
            emit("layer_a", "Replaying captured base behavior against head")
            findings = run_layer_a(
                claims,
                fixtures,
                ingest.head_path,
                self.runs_root / identifier / "probe-state",
                timeout=spec.command_timeout_seconds,
                deadline=deadline,
            )
            plans = _probe_plans(claims)
            if plans:
                findings.extend(
                    run_probe_plans(
                        claims,
                        plans,
                        ingest.base_path,
                        ingest.head_path,
                        self.runs_root / identifier / "probe-plan-state",
                        timeout=spec.command_timeout_seconds,
                        deadline=deadline,
                        corpus_coverage={
                            claim.target_symbol: len(
                                self.corpus.applicable(spec.repo, claim.target_symbol)
                            )
                            for claim in claims
                        },
                    )
                )
        except Exception as exc:  # noqa: BLE001 - stage failures become abstentions
            return self._failure_report(spec, "layer_a", exc, claims, findings, emit)

        if spec.layer_b:
            try:
                emit("layer_b", "Hunting and shrinking adversarial differential inputs")
                findings.extend(
                    run_layer_b(
                        claims,
                        ingest.base_path,
                        ingest.head_path,
                        self.runs_root / identifier / "layer-b-state",
                        timeout=spec.command_timeout_seconds,
                        deadline=deadline,
                        planned_claim_ids={plan.claim_id for plan in _probe_plans(claims)},
                    )
                )
            except Exception as exc:  # noqa: BLE001 - stage failures become abstentions
                return self._failure_report(spec, "layer_b", exc, claims, findings, emit)

        try:
            if ingest.test_commands:
                emit("testing", "Executing discovered repository tests against head")
                test_claim, test_findings = _run_discovered_tests(
                    ingest.test_commands,
                    ingest.base_path,
                    ingest.head_path,
                    timeout=spec.command_timeout_seconds,
                    deadline=deadline,
                )
                claims.append(test_claim)
                findings.extend(test_findings)
            else:
                emit("testing", "No conservative repository test command was discovered")
        except Exception as exc:  # noqa: BLE001 - test runner failures become abstentions
            return self._failure_report(spec, "testing", exc, claims, findings, emit)

        emit("aggregating", "Computing verdict and pinning verified behavior")
        try:
            _remaining_timeout(deadline, spec.command_timeout_seconds)
            verdict = aggregate(findings, _critical_claim_ids(claims))
            pinned = self._pin_verified(spec.repo, identifier, fixtures, findings)
            corpus = CorpusDelta(pinned_this_run=pinned, corpus_total=self.corpus.total(spec.repo))
        except Exception as exc:  # noqa: BLE001 - aggregation failures become abstentions
            return self._failure_report(spec, "aggregating", exc, claims, findings, emit)

        report = validate_report(
            Report(
                repo=spec.repo,
                pr_ref=f"{ingest.base_sha}..{ingest.head_sha}",
                verdict=verdict,
                findings=findings,
                claims=claims,
                corpus=corpus,
            )
        )
        emit("complete", "Report ready")
        return report

    def _pin_verified(
        self,
        repo: str,
        run_id: str,
        fixtures: Sequence[BehaviorFixture],
        findings: Sequence[Finding],
    ) -> int:
        finding_by_input = {
            (finding.claim_id, finding.repro_input): finding
            for finding in findings
            if finding.repro_input is not None
        }
        pinned = 0
        for fixture in fixtures:
            args = json.loads(fixture.args_json)
            kwargs = json.loads(fixture.kwargs_json)
            repro = _display_input(args, kwargs)
            finding = finding_by_input.get((fixture.claim_id, repro))
            if finding is not None and self.corpus.pin(repo, run_id, fixture, finding):
                pinned += 1
        return pinned

    def _applicable_corpus(
        self,
        repo: str,
        claims: Sequence[Claim],
    ) -> list[BehaviorFixture]:
        fixtures: list[BehaviorFixture] = []
        for claim in claims:
            for check in self.corpus.applicable(repo, claim.target_symbol):
                inputs = json.loads(check.input_json)
                fixtures.append(
                    BehaviorFixture(
                        id=f"corpus-{check.id[:20]}",
                        claim_id=claim.id,
                        target_symbol=check.target_symbol,
                        args_json=json.dumps(
                            inputs["args"],
                            ensure_ascii=False,
                            separators=(",", ":"),
                            sort_keys=True,
                        ),
                        kwargs_json=json.dumps(
                            inputs["kwargs"],
                            ensure_ascii=False,
                            separators=(",", ":"),
                            sort_keys=True,
                        ),
                        expected_json=check.expected_json,
                        command=check.command,
                        output=check.output,
                    )
                )
        return fixtures

    def _failure_report(
        self,
        spec: RunSpec,
        stage: str,
        error: Exception,
        claims: list[Claim],
        findings: list[Finding],
        emit: Callable[[str, str], None],
    ) -> Report:
        synthetic_id = f"system:{stage}"
        synthetic_claim = Claim(
            id=synthetic_id,
            text=f"{stage} must complete for the verdict to be trusted",
            target_symbol=synthetic_id,
            risk="high",
            proposed_check=f"complete the {stage} stage",
            preserve_critical=True,
        )
        synthetic_finding = Finding(
            claim_id=synthetic_id,
            layer=Layer.BEHAVIORAL_DIFF,
            outcome=Outcome.UNVERIFIABLE,
            command=synthetic_id,
            output=f"{type(error).__name__}: {error}",
            confidence=1.0,
        )
        final_claims = [*claims, synthetic_claim]
        final_findings = [*findings, synthetic_finding]
        if stage != "aggregating":
            emit("aggregating", f"Abstaining after {stage} failed")
        report = validate_report(
            Report(
                repo=spec.repo,
                pr_ref=f"{spec.base_ref}..{spec.head_ref}",
                verdict=aggregate(
                    final_findings,
                    _critical_claim_ids(final_claims),
                ),
                findings=final_findings,
                claims=final_claims,
                corpus=None,
            )
        )
        emit("complete", "Risky report ready with an unverifiable stage")
        return report


def _emitter(
    run_id: str,
    started: float,
    callback: ProgressCallback | None,
) -> Callable[[str, str], None]:
    def emit(stage: str, message: str) -> None:
        if callback is not None:
            callback(
                RunProgress(
                    run_id=run_id,
                    stage=stage,
                    message=message,
                    elapsed_seconds=time.monotonic() - started,
                )
            )

    return emit


def _display_input(args: list[object], kwargs: dict[str, object]) -> str:
    value: object = args[0] if len(args) == 1 and not kwargs else {"args": args, "kwargs": kwargs}
    return json.dumps(value, ensure_ascii=False, separators=(",", ":"), sort_keys=True)


def _dedupe_fixtures(fixtures: Sequence[BehaviorFixture]) -> list[BehaviorFixture]:
    unique: dict[tuple[str, str, str, str], BehaviorFixture] = {}
    for fixture in fixtures:
        key = (
            fixture.claim_id,
            fixture.args_json,
            fixture.kwargs_json,
            fixture.expected_json,
        )
        unique[key] = fixture
    return list(unique.values())


def _critical_claim_ids(claims: Sequence[Claim]) -> set[str]:
    return {
        claim.id
        for claim in claims
        if claim.preserve_critical or claim.kind is ClaimKind.INTENDED_CHANGE
    }


def _probe_plans(claims: Sequence[Claim]) -> list[ProbePlan]:
    """Deserialize proposed plans without granting malformed payloads authority."""
    plans: list[ProbePlan] = []
    for claim in claims:
        for raw in claim.probe_plans:
            try:
                plans.append(ProbePlan(**raw))
            except (TypeError, ValueError):
                # Preserve a bounded abstention using a synthetic plan shape.
                plans.append(
                    ProbePlan(
                        id=f"malformed-{claim.id}",
                        version=0,
                        claim_id=claim.id,
                        target_symbol=claim.target_symbol,
                        input_domain={},
                        relation_type="malformed",
                        relation_parameters={},
                        oracle_category="invalid",
                        priority=0,
                        budget=1,
                        provenance={"source": "malformed"},
                    )
                )
    return plans


def _run_discovered_tests(
    commands: Sequence[Sequence[str]],
    base_path: str | Path,
    head_path: str | Path,
    *,
    timeout: float,
    deadline: float | None = None,
) -> tuple[Claim, list[Finding]]:
    claim = Claim(
        id="system:head-tests",
        text="the discovered repository tests do not regress on the head revision",
        target_symbol="system:head-tests",
        risk="high",
        proposed_check="execute the conservative discovered test command",
        preserve_critical=True,
    )
    base = Path(base_path).resolve()
    head = Path(head_path).resolve()
    findings: list[Finding] = []
    for command in commands:
        argv = [str(value) for value in command]
        if argv and Path(argv[0]).name.casefold() in {"python", "python.exe"}:
            argv[0] = sys.executable
        base_evidence = _run_test_command(
            argv,
            base,
            timeout=timeout,
            deadline=deadline,
        )
        head_evidence = _run_test_command(
            argv,
            head,
            timeout=timeout,
            deadline=deadline,
        )
        output = _test_comparison_output(base, base_evidence, head, head_evidence)
        base_passed = _command_passed(base_evidence)
        head_passed = _command_passed(head_evidence)
        if head_passed:
            outcome = Outcome.VERIFIED
        elif (
            head_evidence.timed_out
            or head_evidence.output_truncated
            or _looks_environmental_test_failure(head_evidence.output)
        ):
            outcome = Outcome.UNVERIFIABLE
        elif base_passed:
            outcome = Outcome.REFUTED
        else:
            outcome = Outcome.UNVERIFIABLE
        findings.append(
            Finding(
                claim_id=claim.id,
                layer=Layer.BEHAVIORAL_DIFF,
                outcome=outcome,
                command=head_evidence.command,
                output=output,
                confidence=1.0,
            )
        )
    return claim, findings


def _run_test_command(
    argv: Sequence[str],
    worktree: Path,
    *,
    timeout: float,
    deadline: float | None,
) -> CommandEvidence:
    import_roots = [worktree]
    if (worktree / "src").is_dir():
        import_roots.insert(0, worktree / "src")
    return run_command(
        argv,
        cwd=worktree,
        timeout=timeout,
        deadline=deadline,
        env={"PYTHONPATH": os.pathsep.join(str(path) for path in import_roots)},
    )


def _command_passed(evidence: CommandEvidence) -> bool:
    return bool(
        evidence.exit_code == 0
        and not evidence.timed_out
        and not evidence.output_truncated
    )


def _test_comparison_output(
    base: Path,
    base_evidence: CommandEvidence,
    head: Path,
    head_evidence: CommandEvidence,
) -> str:
    base_output = base_evidence.output or "(no output)"
    head_output = head_evidence.output or "(no output)"
    return (
        f"BASE WORKTREE\n{base}\nBASE COMMAND\n{base_evidence.command}\n"
        f"BASE OUTPUT\n{base_output.rstrip()}\n\n"
        f"HEAD WORKTREE\n{head}\nHEAD COMMAND\n{head_evidence.command}\n"
        f"HEAD OUTPUT\n{head_output.rstrip()}\n"
    )


def _looks_environmental_test_failure(output: str) -> bool:
    return bool(
        re.search(
            r"(?:ModuleNotFoundError|PackageNotFoundError|"
            r"ImportError:.*?(?:pip install|No module named|cannot import name))",
            output,
            flags=re.IGNORECASE | re.DOTALL,
        )
    )


def _remaining_timeout(deadline: float, command_timeout: float) -> float:
    remaining = deadline - time.monotonic()
    if remaining <= 0:
        raise RunDeadlineExceeded("Total run deadline exceeded")
    return min(float(command_timeout), remaining)
