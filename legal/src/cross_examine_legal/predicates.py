"""Layer A fixed predicates — deterministic, pure functions of (source, request).

Each predicate returns an outcome plus the exact lines that become the captured
output. They never call a model, never execute input, and never read anything but
the SourceVersion / RecordManifest they are handed. Every output states what the
outcome does and does not establish.
"""

from __future__ import annotations

import hashlib
import re
import unicodedata
from dataclasses import dataclass, field

from cross_examine_legal.schema import (
    CheckOutcome,
    EvidenceProcessed,
    PageStatus,
    QuoteAt,
    RecordManifest,
    SourceCurrent,
    SourceVersion,
)

ESTABLISHES = {
    "quote_at": (
        "Establishes only whether this exact character sequence occurs at the stated location "
        "of this source version. It does not establish that the statement is true, authentic, "
        "credible, complete in context or admissible."
    ),
    "source_current": (
        "Establishes only whether the cited source version is the approved current version in "
        "this record manifest. It does not establish the content's accuracy."
    ),
    "evidence_processed": (
        "Establishes only whether this page of this source version was extracted and is "
        "available to checks. It does not establish what the page means."
    ),
}

# N1 — the only disclosed normalisation. Reported beside, never instead of, exact.
_N1_TRANSLATE = str.maketrans(
    {
        "‘": "'", "’": "'", "‚": "'", "‛": "'",
        "“": '"', "”": '"', "„": '"', "‟": '"',
        "–": "-", "—": "-", "−": "-", " ": " ",
    }
)
_WS = re.compile(r"\s+")
N1_DESCRIPTION = (
    "N1 = Unicode NFC, typographic quotes/dashes/no-break space mapped to ASCII, "
    "whitespace runs collapsed to one space, ends trimmed"
)


def normalize_n1(text: str) -> str:
    return _WS.sub(" ", unicodedata.normalize("NFC", text).translate(_N1_TRANSLATE)).strip()


@dataclass
class PredicateOutput:
    outcome: CheckOutcome
    lines: list[str]
    detail: dict[str, object] = field(default_factory=dict)


def _offsets(haystack: str, needle: str) -> list[int]:
    out, start = [], 0
    while True:
        i = haystack.find(needle, start)
        if i < 0:
            return out
        out.append(i)
        start = i + 1


def _quote_header(source: SourceVersion | None, req: QuoteAt) -> list[str]:
    qsha = hashlib.sha256(req.quote.encode()).hexdigest()
    where = "any page" if req.page is None else f"page {req.page}"
    if req.char_start is not None:
        where += f" char {req.char_start}"
    pages = "unavailable" if source is None else str(len(source.pages))
    extractor = "unavailable" if source is None else source.extractor
    return [
        "predicate quote_at v1",
        f"source sha256:{req.source_sha256} extractor {extractor} pages {pages}",
        f"quote sha256:{qsha} length {len(req.quote)} code points",
        f"claimed location {where} (0-based original page index)",
    ]


def quote_at(source: SourceVersion | None, req: QuoteAt) -> PredicateOutput:
    lines = _quote_header(source, req)

    def done(outcome: CheckOutcome, *more: str, **detail: object) -> PredicateOutput:
        return PredicateOutput(outcome, [*lines, *more, f"result {outcome.name}"], dict(detail))

    if source is None or source.sha256 != req.source_sha256:
        return done(CheckOutcome.INCOMPLETE, "source version not available to the checker",
                    reason="source_unavailable")
    if req.page is not None and req.page >= len(source.pages):
        return done(CheckOutcome.REFUTED,
                    f"page {req.page} does not exist (source has {len(source.pages)} pages)",
                    reason="page_out_of_range")

    pages = [source.pages[req.page]] if req.page is not None else list(source.pages)
    unread = [p.index for p in pages if p.status is not PageStatus.EXTRACTED]
    readable = [p for p in pages if p.status is PageStatus.EXTRACTED]
    hits = {p.index: _offsets(p.text, req.quote) for p in readable}
    hits = {k: v for k, v in hits.items() if v}
    found = [f"page {k} chars {o}-{o + len(req.quote)}" for k, v in hits.items() for o in v]

    if req.char_start is not None:
        page_text = source.pages[req.page].text  # type: ignore[index]
        if source.pages[req.page].status is not PageStatus.EXTRACTED:  # type: ignore[index]
            return done(CheckOutcome.INCOMPLETE, f"page {req.page} was not extracted",
                        reason="page_unprocessed")
        at = page_text[req.char_start : req.char_start + len(req.quote)]
        if at == req.quote:
            return done(CheckOutcome.VERIFIED, f"exact match at page {req.page} chars "
                        f"{req.char_start}-{req.char_start + len(req.quote)}",
                        locations=[[req.page, req.char_start]])
        return done(CheckOutcome.REFUTED, "no exact match at the stated offset",
                    *(["exact match elsewhere: " + "; ".join(found)] if found else []),
                    reason="offset_mismatch",
                    locations=[[k, o] for k, v in hits.items() for o in v])

    if len(found) == 1 or (req.page is not None and found):
        return done(CheckOutcome.VERIFIED, "exact match: " + "; ".join(found),
                    locations=[[k, o] for k, v in hits.items() for o in v])
    if len(found) > 1:
        return done(CheckOutcome.INCOMPLETE,
                    f"ambiguous location: {len(found)} exact matches ({'; '.join(found)}); "
                    "cite a page to decide",
                    reason="ambiguous_location",
                    locations=[[k, o] for k, v in hits.items() for o in v])
    if unread:
        return done(CheckOutcome.INCOMPLETE,
                    f"no exact match in extracted pages; pages {unread} were not extracted",
                    reason="pages_unprocessed")

    nq = normalize_n1(req.quote)
    n1_pages = [p.index for p in readable if nq and nq in normalize_n1(p.text)]
    if n1_pages:
        return done(CheckOutcome.REFUTED, "no exact match",
                    f"disclosed: matches only after normalisation on pages {n1_pages} "
                    f"({N1_DESCRIPTION}); the exact predicate is not satisfied",
                    reason="normalized_match_only", n1_pages=n1_pages)
    return done(CheckOutcome.REFUTED, "no exact match and no N1-normalised match",
                reason="not_found")


def source_current(
    source_sha256: str, manifest: RecordManifest | None, req: SourceCurrent
) -> PredicateOutput:
    lines = [
        "predicate source_current v1",
        f"source sha256:{req.source_sha256}",
        f"manifest sha256:{req.manifest_sha256}",
    ]
    if manifest is None or manifest.sha256 != req.manifest_sha256:
        return PredicateOutput(CheckOutcome.INCOMPLETE,
                               [*lines, "record manifest not available to the checker",
                                "result INCOMPLETE"], {"reason": "manifest_unavailable"})
    owners = sorted(k for k, v in manifest.current.items() if v == source_sha256)
    if owners:
        return PredicateOutput(CheckOutcome.VERIFIED,
                               [*lines, (f"approved current version of {owners} in record "
                                 f"version {manifest.record_version}"), "result VERIFIED"],
                               {"logical_ids": owners})
    return PredicateOutput(CheckOutcome.REFUTED,
                           [*lines, (f"not an approved current version in record version "
                             f"{manifest.record_version}"), "result REFUTED"],
                           {"reason": "not_current"})


def evidence_processed(source: SourceVersion | None, req: EvidenceProcessed) -> PredicateOutput:
    lines = [
        "predicate evidence_processed v1",
        f"source sha256:{req.source_sha256}",
        f"page {req.page} (0-based original page index)",
    ]
    if source is None or source.sha256 != req.source_sha256:
        return PredicateOutput(CheckOutcome.INCOMPLETE,
                               [*lines, "source version not available to the checker",
                                "result INCOMPLETE"], {"reason": "source_unavailable"})
    if req.page >= len(source.pages):
        return PredicateOutput(CheckOutcome.REFUTED,
                               [*lines, f"page does not exist ({len(source.pages)} pages)",
                                "result REFUTED"], {"reason": "page_out_of_range"})
    page = source.pages[req.page]
    if page.status is PageStatus.EXTRACTED:
        return PredicateOutput(CheckOutcome.VERIFIED,
                               [*lines, (f"extracted by {source.extractor}, "
                                 f"{len(page.text)} code points"), "result VERIFIED"])
    return PredicateOutput(CheckOutcome.REFUTED,
                           [*lines, f"not extracted: {page.reason or 'unreadable'}",
                            "result REFUTED"], {"reason": "page_unreadable"})
