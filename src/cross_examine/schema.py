"""Cross-Examine domain and stage contracts.

The render layer consumes :class:`Report`; every upstream stage exists to
produce it. Verdict aggregation remains a pure function in this module.
"""

from __future__ import annotations

import hashlib
import json
from dataclasses import dataclass, field
from enum import Enum


class Outcome(str, Enum):
    VERIFIED = "verified"
    REFUTED = "refuted"
    UNVERIFIABLE = "unverifiable"


class Layer(str, Enum):
    BEHAVIORAL_DIFF = "behavioral_diff"
    ADVERSARIAL = "adversarial"


class Verdict(str, Enum):
    SAFE = "safe"
    RISKY = "risky"
    BROKEN = "broken"


class ClaimKind(str, Enum):
    PRESERVATION = "preservation"
    INTENDED_CHANGE = "intended_change"


def evidence_hash(command: str, output: str) -> str:
    """Return the stable digest binding one invocation to its captured output."""

    payload = json.dumps(
        {"command": command, "output": output},
        ensure_ascii=False,
        separators=(",", ":"),
        sort_keys=True,
    )
    return hashlib.sha256(f"cross-examine-evidence-v1\0{payload}".encode()).hexdigest()


@dataclass(frozen=True)
class EvidenceReceipt:
    command: str
    output: str
    evidence_hash: str


@dataclass
class Claim:
    id: str
    text: str
    target_symbol: str
    risk: str
    proposed_check: str
    preserve_critical: bool = False
    kind: ClaimKind = ClaimKind.PRESERVATION
    probe_plans: list[dict[str, object]] = field(default_factory=list)

    def __post_init__(self) -> None:
        self.kind = ClaimKind(self.kind)


@dataclass
class Finding:
    claim_id: str
    layer: Layer
    outcome: Outcome
    command: str
    output: str
    repro_input: str | None = None
    expected: str | None = None
    actual: str | None = None
    confidence: float = 1.0
    provenance: dict[str, object] | None = None
    receipts: list[EvidenceReceipt] = field(default_factory=list)


@dataclass
class CorpusDelta:
    pinned_this_run: int
    corpus_total: int


@dataclass
class Report:
    repo: str
    pr_ref: str
    verdict: Verdict
    findings: list[Finding] = field(default_factory=list)
    claims: list[Claim] = field(default_factory=list)
    corpus: CorpusDelta | None = None

    @property
    def refuted(self) -> list[Finding]:
        return [finding for finding in self.findings if finding.outcome is Outcome.REFUTED]


@dataclass(frozen=True)
class RunSpec:
    repo: str
    base_ref: str
    head_ref: str
    layer_b: bool = True
    command_timeout_seconds: int = 120
    run_timeout_seconds: int = 600


@dataclass(frozen=True)
class CommandEvidence:
    command: str
    exit_code: int | None
    stdout: str
    stderr: str
    duration_seconds: float
    timed_out: bool = False
    output_truncated: bool = False
    manifest: "ExecutionManifest | None" = None
    receipt: EvidenceReceipt | None = None

    @property
    def output(self) -> str:
        return "\n".join(part for part in (self.stdout, self.stderr) if part)


@dataclass(frozen=True)
class CwdIdentity:
    path: str
    digest: str


@dataclass(frozen=True)
class ExecutableIdentity:
    requested: str
    resolved_path: str
    digest: str | None


@dataclass(frozen=True)
class ExecutionManifest:
    """Auditable receipt for one bounded execution attempt."""

    adapter: str
    policy_version: str
    policy_identity: str
    argv_digest: str
    rendered_argv: str
    cwd_identity: CwdIdentity
    executable_identity: ExecutableIdentity
    runtime: str
    operating_system: str
    duration_seconds: float
    exit_code: int | None
    timed_out: bool
    output_truncated: bool
    redaction_applied: bool

    def stable_identity(self) -> tuple[object, ...]:
        """Fields stable across identical executions on one host/runtime."""

        return (
            self.adapter,
            self.policy_version,
            self.policy_identity,
            self.argv_digest,
            self.rendered_argv,
            self.cwd_identity,
            self.executable_identity,
            self.runtime,
            self.operating_system,
        )


@dataclass(frozen=True)
class TouchedSymbol:
    module: str
    qualname: str
    target_symbol: str
    file_path: str


@dataclass(frozen=True)
class IngestResult:
    repo: str
    base_sha: str
    head_sha: str
    base_path: str
    head_path: str
    diff: str
    touched_symbols: list[TouchedSymbol]
    test_commands: list[list[str]]
    evidence: list[CommandEvidence]


@dataclass(frozen=True)
class BehaviorFixture:
    id: str
    claim_id: str
    target_symbol: str
    args_json: str
    kwargs_json: str
    expected_json: str
    command: str
    output: str
    receipt: EvidenceReceipt | None = None


@dataclass(frozen=True)
class RunProgress:
    run_id: str
    stage: str
    message: str
    elapsed_seconds: float


def aggregate(findings: list[Finding], critical_claim_ids: set[str]) -> Verdict:
    """Turn executed findings into a verdict without IO or model judgment."""

    refuted = [finding for finding in findings if finding.outcome is Outcome.REFUTED]
    if any(finding.claim_id in critical_claim_ids for finding in refuted):
        return Verdict.BROKEN

    covered_claim_ids = {finding.claim_id for finding in findings}
    if critical_claim_ids - covered_claim_ids:
        return Verdict.RISKY

    unverifiable_critical = any(
        finding.outcome is Outcome.UNVERIFIABLE
        and finding.claim_id in critical_claim_ids
        for finding in findings
    )
    if refuted or unverifiable_critical:
        return Verdict.RISKY
    return Verdict.SAFE
