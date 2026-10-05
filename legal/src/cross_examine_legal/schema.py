"""Cross-Examine legal domain contracts.

The legal adapter keeps Cross-Examine's discipline — proposals are untrusted,
fixed deterministic predicates decide mechanical outcomes, every decided finding
carries the exact replayable command and its captured output, and aggregation is
pure — but its domain objects are new: versioned sources with page locators,
typed predicate requests and legal-claim aggregation. Nothing here names a
repository, a symbol or a SAFE/RISKY/BROKEN verdict.
"""

from __future__ import annotations

import hashlib
import json
from dataclasses import dataclass, field
from enum import Enum

PREDICATE_VERSION = "1"
RECEIPT_DOMAIN = "cross-examine-legal-evidence-v1"


class CheckOutcome(str, Enum):
    """What a fixed predicate decided. INCOMPLETE is never upgraded."""

    VERIFIED = "verified"
    REFUTED = "refuted"
    INCOMPLETE = "incomplete"


EXIT_STATUS = {CheckOutcome.VERIFIED: 0, CheckOutcome.REFUTED: 1, CheckOutcome.INCOMPLETE: 2}


class PredicateKind(str, Enum):
    QUOTE_AT = "quote_at"
    SOURCE_CURRENT = "source_current"
    EVIDENCE_PROCESSED = "evidence_processed"


class PageStatus(str, Enum):
    EXTRACTED = "extracted"
    UNREADABLE = "unreadable"


@dataclass(frozen=True)
class SourcePage:
    index: int  # 0-based position in the original file — never a printed label
    status: PageStatus
    text: str  # exact extracted code points; empty when unreadable
    printed_label: str | None = None  # e.g. a Bates number, as printed
    reason: str | None = None  # why a page is unreadable


@dataclass(frozen=True)
class SourceVersion:
    """One immutable version of one logical document."""

    logical_id: str
    version: int
    sha256: str  # digest of the original bytes
    media_type: str
    extractor: str  # e.g. "text-v1"; part of every receipt
    pages: tuple[SourcePage, ...]
    rejected: tuple[str, ...] = ()  # rejected portions, human-readable

    @property
    def ref(self) -> str:
        return f"sha256:{self.sha256}"


@dataclass(frozen=True)
class RecordManifest:
    """The approved set of source versions a run may cite (one per logical id)."""

    record_version: int
    current: dict[str, str]  # logical_id -> sha256 of the approved version

    def canonical_json(self) -> str:
        return json.dumps(
            {"record_version": self.record_version, "current": self.current},
            sort_keys=True,
            separators=(",", ":"),
        )

    @property
    def sha256(self) -> str:
        return hashlib.sha256(self.canonical_json().encode()).hexdigest()


@dataclass(frozen=True)
class QuoteAt:
    source_sha256: str
    quote: str
    page: int | None = None  # 0-based original page; None = anywhere in the source
    char_start: int | None = None  # offset within the page; requires page

    kind: PredicateKind = field(default=PredicateKind.QUOTE_AT, init=False)


@dataclass(frozen=True)
class SourceCurrent:
    source_sha256: str
    manifest_sha256: str

    kind: PredicateKind = field(default=PredicateKind.SOURCE_CURRENT, init=False)


@dataclass(frozen=True)
class EvidenceProcessed:
    source_sha256: str
    page: int

    kind: PredicateKind = field(default=PredicateKind.EVIDENCE_PROCESSED, init=False)


PredicateRequest = QuoteAt | SourceCurrent | EvidenceProcessed


def evidence_hash(command: str, output: str, exit_status: int) -> str:
    """Stable digest binding one invocation to its captured output and status."""

    payload = json.dumps(
        {"command": command, "exit_status": exit_status, "output": output},
        ensure_ascii=False,
        separators=(",", ":"),
        sort_keys=True,
    )
    return hashlib.sha256(f"{RECEIPT_DOMAIN}\0{payload}".encode()).hexdigest()


@dataclass(frozen=True)
class Receipt:
    command: str
    output: str
    exit_status: int
    evidence_hash: str

    def is_intact(self) -> bool:
        return self.evidence_hash == evidence_hash(self.command, self.output, self.exit_status)


@dataclass(frozen=True)
class CheckResult:
    """One executed predicate. `detail` is structured data for rendering only."""

    kind: PredicateKind
    outcome: CheckOutcome
    command: str
    output: str
    exit_status: int
    receipt: Receipt
    source_dependencies: tuple[str, ...]  # sha256 of every source version consulted
    parameters: dict[str, object]  # canonical parameters, as in the command
    establishes: str  # what this outcome does and does not establish
    detail: dict[str, object] = field(default_factory=dict)
    output_truncated: bool = False


class ClaimStatus(str, Enum):
    """Mechanical status of a legal claim — never a truth or merits finding."""

    MECHANICALLY_SUPPORTED = "mechanically_supported"
    CONTRADICTED = "contradicted"
    UNRESOLVED = "unresolved"


class RecordRisk(str, Enum):
    CONTRADICTED_MATERIAL_CLAIM = "contradicted_material_claim"
    UNRESOLVED_MATERIAL_CLAIM = "unresolved_material_claim"
    NO_MECHANICAL_DEFECT_FOUND = "no_mechanical_defect_found"


@dataclass(frozen=True)
class ClaimChecks:
    """A claim and the check results it requires (empty results = not yet checked)."""

    claim_id: str
    material: bool
    required: tuple[PredicateKind, ...]
    results: tuple[CheckResult, ...]


@dataclass(frozen=True)
class Aggregate:
    claims: dict[str, ClaimStatus]
    risk: RecordRisk
