"""Stage 2 — Characterize: untrusted proposals → typed predicate requests.

A juror, attorney or model proposes "this quote is at doc X page P". Here that
proposal is validated against the record manifest and either becomes a typed
request for a fixed predicate or is rejected with a reason. A rejection is not a
refutation: it means the proposal could not be checked as stated, and callers must
carry it as unresolved.
"""

from __future__ import annotations

from dataclasses import dataclass

from cross_examine_legal.schema import QuoteAt, RecordManifest

MAX_QUOTE_CHARS = 2000


@dataclass(frozen=True)
class Rejection:
    reason: str


@dataclass(frozen=True)
class QuoteProposal:
    """A citation as proposed: logical document id, optional page/offset, quote text."""

    logical_id: str
    quote: str
    page: int | None = None
    char_start: int | None = None


def characterize_quote(proposal: QuoteProposal, manifest: RecordManifest) -> QuoteAt | Rejection:
    sha = manifest.current.get(proposal.logical_id)
    if sha is None:
        return Rejection(f"document {proposal.logical_id!r} is not in record version "
                         f"{manifest.record_version}")
    if not proposal.quote or not proposal.quote.strip():
        return Rejection("empty quotation")
    if len(proposal.quote) > MAX_QUOTE_CHARS:
        return Rejection(f"quotation longer than {MAX_QUOTE_CHARS} characters")
    if proposal.page is not None and proposal.page < 0:
        return Rejection("negative page index")
    if proposal.char_start is not None:
        if proposal.page is None:
            return Rejection("a character offset requires a page")
        if proposal.char_start < 0:
            return Rejection("negative character offset")
    return QuoteAt(
        source_sha256=sha,
        quote=proposal.quote,
        page=proposal.page,
        char_start=proposal.char_start,
    )
