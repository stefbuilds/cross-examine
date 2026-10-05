from __future__ import annotations

import ast
import json
from pathlib import Path

import pytest

from cross_examine_legal import (
    CheckOutcome,
    ClaimChecks,
    ClaimStatus,
    EvidenceProcessed,
    IngestError,
    PageStatus,
    PredicateKind,
    QuoteAt,
    QuoteProposal,
    RecordManifest,
    RecordRisk,
    Rejection,
    SourceCurrent,
    SourcePage,
    SourceVersion,
    aggregate,
    characterize_quote,
    extract_text_v1,
    run_check,
)
from cross_examine_legal.cli import main as cli_main
from cross_examine_legal.ingest import reject_duplicate_ids
from cross_examine_legal.render import ReceiptError, to_dict, validate

DEPOSITION = (
    "Q. When did you first see the alarm?\nA. At 4:12 that afternoon.\f"
    "Q. Did you call the supervisor?\nA. I called him twice. He said “leave it running.”\f"
    "Q. Anything else?\nA. I called him twice."
)


class Resolver:
    def __init__(self, *sources: SourceVersion, manifests: tuple[RecordManifest, ...] = ()):
        self.sources = {s.sha256: s for s in sources}
        self.manifests = {m.sha256: m for m in manifests}

    def source(self, sha256: str) -> SourceVersion | None:
        return self.sources.get(sha256)

    def manifest(self, sha256: str) -> RecordManifest | None:
        return self.manifests.get(sha256)


@pytest.fixture
def depo() -> SourceVersion:
    return extract_text_v1("DEP-1", 1, DEPOSITION.encode(), "text/plain", {1: "ACME-0042"})


# ---- ingest -----------------------------------------------------------------


def test_ingest_preserves_identity_pages_and_printed_labels(depo: SourceVersion) -> None:
    import hashlib

    assert depo.sha256 == hashlib.sha256(DEPOSITION.encode()).hexdigest()
    assert [p.index for p in depo.pages] == [0, 1, 2]
    assert depo.pages[1].printed_label == "ACME-0042"  # printed label ≠ original index
    assert depo.pages[0].printed_label is None
    assert "“" in depo.pages[1].text  # no normalisation at ingest


def test_ingest_rejects_invalid_utf8_and_unsupported_types() -> None:
    with pytest.raises(IngestError, match="not valid UTF-8"):
        extract_text_v1("X", 1, b"ok \xff\xfe broken", "text/plain")
    with pytest.raises(IngestError, match="unsupported media type"):
        extract_text_v1("X", 1, b"%PDF-1.7", "application/pdf")


def test_ingest_discloses_removed_bom() -> None:
    sv = extract_text_v1("X", 1, "﻿hello".encode(), "text/plain")
    assert sv.pages[0].text == "hello"
    assert sv.rejected and "byte-order mark" in sv.rejected[0]


def test_duplicate_logical_ids_are_reported() -> None:
    assert reject_duplicate_ids(["A", "B", "A", "C", "B", "A"]) == ["A", "B"]


# ---- quote_at ---------------------------------------------------------------


def test_exact_quote_on_cited_page_is_verified_with_receipt(depo: SourceVersion) -> None:
    r = run_check(QuoteAt(depo.sha256, "At 4:12 that afternoon.", page=0), Resolver(depo))
    assert r.outcome is CheckOutcome.VERIFIED and r.exit_status == 0
    assert "exact match: page 0 chars" in r.output
    assert "does not establish that the statement is true" in r.output
    assert r.receipt.is_intact()
    assert r.command.startswith("cross-examine-legal check quote_at --source sha256:")


def test_quote_without_page_matching_twice_is_incomplete_ambiguous(depo: SourceVersion) -> None:
    r = run_check(QuoteAt(depo.sha256, "I called him twice."), Resolver(depo))
    assert r.outcome is CheckOutcome.INCOMPLETE and r.exit_status == 2
    assert r.detail["reason"] == "ambiguous_location"


def test_ambiguity_is_resolved_by_citing_a_page(depo: SourceVersion) -> None:
    r = run_check(QuoteAt(depo.sha256, "I called him twice.", page=2), Resolver(depo))
    assert r.outcome is CheckOutcome.VERIFIED


def test_quote_on_wrong_page_is_refuted(depo: SourceVersion) -> None:
    r = run_check(QuoteAt(depo.sha256, "At 4:12 that afternoon.", page=1), Resolver(depo))
    assert r.outcome is CheckOutcome.REFUTED


def test_typographic_variant_is_refuted_with_disclosed_normalised_match(depo) -> None:
    r = run_check(QuoteAt(depo.sha256, 'He said "leave it running."'), Resolver(depo))
    assert r.outcome is CheckOutcome.REFUTED
    assert r.detail["reason"] == "normalized_match_only"
    assert r.detail["n1_pages"] == [1]
    assert "exact predicate is not satisfied" in r.output


def test_paraphrase_is_refuted(depo: SourceVersion) -> None:
    r = run_check(QuoteAt(depo.sha256, "He told me to keep the line running."), Resolver(depo))
    assert r.outcome is CheckOutcome.REFUTED and r.detail["reason"] == "not_found"


def test_offset_predicate(depo: SourceVersion) -> None:
    text = depo.pages[0].text
    start = text.index("At 4:12")
    ok = run_check(QuoteAt(depo.sha256, "At 4:12", page=0, char_start=start), Resolver(depo))
    bad = run_check(QuoteAt(depo.sha256, "At 4:12", page=0, char_start=start + 1), Resolver(depo))
    assert ok.outcome is CheckOutcome.VERIFIED
    assert bad.outcome is CheckOutcome.REFUTED and "exact match elsewhere" in bad.output


def test_missing_page_is_refuted_and_missing_source_is_incomplete(depo: SourceVersion) -> None:
    assert run_check(QuoteAt(depo.sha256, "x", page=9), Resolver(depo)).outcome is (
        CheckOutcome.REFUTED
    )
    assert run_check(QuoteAt("0" * 64, "x"), Resolver(depo)).outcome is CheckOutcome.INCOMPLETE


def test_unreadable_page_leaves_quote_incomplete() -> None:
    sv = SourceVersion(
        "S", 1, "a" * 64, "text/plain", "text-v1",
        (SourcePage(0, PageStatus.EXTRACTED, "one"),
         SourcePage(1, PageStatus.UNREADABLE, "", reason="scan")),
    )
    r = run_check(QuoteAt(sv.sha256, "two"), Resolver(sv))
    assert r.outcome is CheckOutcome.INCOMPLETE and r.detail["reason"] == "pages_unprocessed"
    e = run_check(EvidenceProcessed(sv.sha256, 1), Resolver(sv))
    assert e.outcome is CheckOutcome.REFUTED


# ---- source_current / characterize -------------------------------------------


def test_source_current_against_manifest(depo: SourceVersion) -> None:
    newer = extract_text_v1("DEP-1", 2, (DEPOSITION + " errata").encode(), "text/plain")
    m = RecordManifest(record_version=3, current={"DEP-1": newer.sha256})
    res = Resolver(depo, newer, manifests=(m,))
    assert run_check(SourceCurrent(newer.sha256, m.sha256), res).outcome is CheckOutcome.VERIFIED
    stale = run_check(SourceCurrent(depo.sha256, m.sha256), res)
    assert stale.outcome is CheckOutcome.REFUTED  # superseded version cited
    assert run_check(SourceCurrent(depo.sha256, "f" * 64), res).outcome is CheckOutcome.INCOMPLETE


def test_characterize_rejects_unknown_documents_and_bad_locators(depo: SourceVersion) -> None:
    m = RecordManifest(1, {"DEP-1": depo.sha256})
    assert isinstance(characterize_quote(QuoteProposal("NOPE", "x"), m), Rejection)
    assert isinstance(characterize_quote(QuoteProposal("DEP-1", "  "), m), Rejection)
    assert isinstance(characterize_quote(QuoteProposal("DEP-1", "x", char_start=3), m), Rejection)
    req = characterize_quote(QuoteProposal("DEP-1", "At 4:12", page=0), m)
    assert isinstance(req, QuoteAt) and req.source_sha256 == depo.sha256


# ---- receipts / replay -------------------------------------------------------


def test_cli_replay_reproduces_output_and_status_byte_for_byte(
    depo: SourceVersion, tmp_path: Path, capsys: pytest.CaptureFixture[str]
) -> None:
    import shlex

    blobs = tmp_path / "sha256"
    blobs.mkdir()
    (blobs / depo.sha256).write_bytes(DEPOSITION.encode())
    m = RecordManifest(1, {"DEP-1": depo.sha256})
    (blobs / m.sha256).write_bytes(m.canonical_json().encode())
    res = Resolver(depo, manifests=(m,))
    for req in (
        QuoteAt(depo.sha256, "At 4:12 that afternoon.", page=0),
        QuoteAt(depo.sha256, "I called him twice."),
        QuoteAt(depo.sha256, 'He said "leave it running."'),
        SourceCurrent(depo.sha256, m.sha256),
        EvidenceProcessed(depo.sha256, 2),
    ):
        stored = run_check(req, res)
        argv = shlex.split(stored.command)[1:] + ["--blobs", str(tmp_path)]
        status = cli_main(argv)
        assert capsys.readouterr().out == stored.output
        assert status == stored.exit_status


def test_tampered_receipt_is_rejected(depo: SourceVersion) -> None:
    from dataclasses import replace

    r = run_check(QuoteAt(depo.sha256, "At 4:12", page=0), Resolver(depo))
    assert to_dict(r)["receipt_sha256"] == r.receipt.evidence_hash
    with pytest.raises(ReceiptError):
        validate(replace(r, output=r.output.replace("VERIFIED", "REFUTED")))
    with pytest.raises(ReceiptError):
        validate(replace(r, receipt=replace(r.receipt, output=r.receipt.output + "x")))


# ---- aggregate ---------------------------------------------------------------


def _result(depo: SourceVersion, quote: str, page: int | None = None):
    return run_check(QuoteAt(depo.sha256, quote, page=page), Resolver(depo))


def test_aggregate_statuses_and_risk(depo: SourceVersion) -> None:
    ok = _result(depo, "At 4:12 that afternoon.")
    bad = _result(depo, "not in the record at all")
    amb = _result(depo, "I called him twice.")
    q = (PredicateKind.QUOTE_AT,)
    agg = aggregate([
        ClaimChecks("c1", True, q, (ok,)),
        ClaimChecks("c2", False, q, (bad,)),
        ClaimChecks("c3", False, q, (amb,)),
        ClaimChecks("c4", False, q, ()),
    ])
    assert agg.claims == {
        "c1": ClaimStatus.MECHANICALLY_SUPPORTED,
        "c2": ClaimStatus.CONTRADICTED,
        "c3": ClaimStatus.UNRESOLVED,
        "c4": ClaimStatus.UNRESOLVED,
    }
    assert agg.risk is RecordRisk.NO_MECHANICAL_DEFECT_FOUND  # only c1 is material


def test_unchecked_material_claim_is_risk_not_safety(depo: SourceVersion) -> None:
    agg = aggregate([ClaimChecks("c1", True, (PredicateKind.QUOTE_AT,), ())])
    assert agg.risk is RecordRisk.UNRESOLVED_MATERIAL_CLAIM
    bad = _result(depo, "nope")
    agg = aggregate([ClaimChecks("c1", True, (PredicateKind.QUOTE_AT,), (bad,))])
    assert agg.risk is RecordRisk.CONTRADICTED_MATERIAL_CLAIM


def test_aggregate_rejects_duplicate_claim_ids() -> None:
    with pytest.raises(ValueError, match="duplicate"):
        aggregate([ClaimChecks("c", True, (), ()), ClaimChecks("c", True, (), ())])


def test_aggregate_and_predicates_are_pure() -> None:
    allowed = {"__future__", "collections", "collections.abc", "dataclasses", "enum", "hashlib",
               "json", "re", "unicodedata", "typing", "cross_examine_legal.schema"}
    root = Path(__file__).parents[1] / "src" / "cross_examine_legal"
    for name in ("aggregate.py", "predicates.py", "schema.py"):
        tree = ast.parse((root / name).read_text())
        for node in ast.walk(tree):
            if isinstance(node, ast.Import):
                mods = [a.name for a in node.names]
            elif isinstance(node, ast.ImportFrom):
                mods = [node.module or ""]
            else:
                continue
            for mod in mods:
                assert mod in allowed, f"{name} imports {mod}"


def test_manifest_digest_is_canonical() -> None:
    a = RecordManifest(1, {"B": "2", "A": "1"})
    b = RecordManifest(1, {"A": "1", "B": "2"})
    assert a.sha256 == b.sha256 and json.loads(a.canonical_json())["current"]["A"] == "1"
