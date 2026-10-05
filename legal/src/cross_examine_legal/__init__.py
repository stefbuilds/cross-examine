"""Cross-Examine legal adapter: Ingest → Characterize → Cross-examine → Aggregate → Render."""

from cross_examine_legal.aggregate import aggregate, claim_status
from cross_examine_legal.characterize import QuoteProposal, Rejection, characterize_quote
from cross_examine_legal.cross_examine import SourceResolver, run_check
from cross_examine_legal.ingest import IngestError, extract, extract_text_v1, sha256_hex
from cross_examine_legal.schema import (
    Aggregate,
    CheckOutcome,
    CheckResult,
    ClaimChecks,
    ClaimStatus,
    EvidenceProcessed,
    PageStatus,
    PredicateKind,
    QuoteAt,
    Receipt,
    RecordManifest,
    RecordRisk,
    SourceCurrent,
    SourcePage,
    SourceVersion,
)

__all__ = [
    "Aggregate", "CheckOutcome", "CheckResult", "ClaimChecks", "ClaimStatus",
    "EvidenceProcessed", "IngestError", "PageStatus", "PredicateKind", "QuoteAt",
    "QuoteProposal", "Receipt", "RecordManifest", "RecordRisk", "Rejection", "SourceCurrent",
    "SourcePage", "SourceResolver", "SourceVersion", "aggregate", "characterize_quote",
    "claim_status", "extract", "extract_text_v1", "run_check", "sha256_hex",
]
