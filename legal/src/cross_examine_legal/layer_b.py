"""Layer B — interpretive challenge proposals (untrusted until a person reviews them).

Layer B may *propose* unsupported inferences, contrary passages, missing assumptions,
alternative interpretations and questions. Nothing here decides anything:

* `retrieve` is bounded, deterministic lexical retrieval over extracted pages. It
  reports exactly what it covered (`Coverage`) so a reader knows what was NOT searched.
* `validate` turns a proposer's output into a `Suggestion`: its citations are checked
  by the fixed Layer A `quote_at` predicate, and the suggestion is always labelled as an
  unreviewed interpretation. A verified citation shows only that the quoted text exists
  where cited — it does not verify the interpretation built on it.

The proposer itself (a model, or a deterministic stand-in) lives in the host product;
this package stays free of model and network dependencies.
"""

from __future__ import annotations

import math
import re
from collections import Counter
from dataclasses import dataclass, field

from cross_examine_legal.characterize import QuoteProposal, Rejection, characterize_quote
from cross_examine_legal.cross_examine import SourceResolver, run_check
from cross_examine_legal.schema import CheckResult, PageStatus, RecordManifest, SourceVersion

RETRIEVAL_VERSION = "lexical-v1"
KINDS = ("contrary_passage", "unsupported_inference", "missing_assumption",
         "alternative_interpretation", "question")
LABEL = ("Interpretive suggestion — unreviewed. Not evidence and not a finding. A verified "
         "citation shows only that the quoted text exists where cited; it does not verify "
         "this interpretation.")

_WORD = re.compile(r"[A-Za-z0-9][A-Za-z0-9'\-]{2,}")
_SENTENCE = re.compile(r"[^.!?\n]{12,600}[.!?]?")
_STOP = frozenset(["the", "and", "for", "that", "with", "this", "from", "was", "were", "are", "been", "have", "has", "had", "not", "but", "its", "his", "her", "their", "they", "them", "then", "than", "there", "which", "who", "whom", "what", "when", "where", "while", "would", "could", "should", "shall", "will", "into", "onto", "upon", "about", "above", "below", "after", "before", "over", "under", "also", "only", "very", "such", "any", "all", "each", "other", "some", "most", "more", "less", "same", "own", "just"])


def _terms(text: str) -> list[str]:
    return [w for w in (m.group(0).lower() for m in _WORD.finditer(text)) if w not in _STOP]


@dataclass(frozen=True)
class Passage:
    doc: str
    sha256: str
    page: int
    start: int
    text: str
    score: float


@dataclass(frozen=True)
class Coverage:
    method: str
    documents: int
    pages_searched: int
    pages_unreadable: int
    passages_considered: int
    returned: int
    note: str


def retrieve(sources: list[SourceVersion], query: str, k: int = 5,
             exclude: set[tuple[str, int, str]] | None = None) -> tuple[list[Passage], Coverage]:
    """Top-k sentence passages by idf-weighted term overlap. Deterministic.

    `exclude` holds (sha256, page, text) of passages the proposer must not be pointed to
    (e.g. the juror's own citations).
    """

    exclude = exclude or set()
    candidates: list[tuple[str, str, int, int, str]] = []
    unreadable = searched = 0
    for sv in sources:
        for p in sv.pages:
            if p.status is not PageStatus.EXTRACTED:
                unreadable += 1
                continue
            searched += 1
            for m in _SENTENCE.finditer(p.text):
                text = m.group(0).strip()
                if text and (sv.sha256, p.index, text) not in exclude:
                    candidates.append((sv.logical_id, sv.sha256, p.index, m.start(), text))
    df: Counter[str] = Counter()
    for c in candidates:
        df.update(set(_terms(c[4])))
    n = max(len(candidates), 1)
    q = set(_terms(query))
    scored = []
    for doc, sha, page, start, text in candidates:
        overlap = q & set(_terms(text))
        if not overlap:
            continue
        score = sum(math.log(1 + n / df[t]) for t in overlap)
        scored.append(Passage(doc, sha, page, start, text, round(score, 6)))
    scored.sort(key=lambda p: (-p.score, p.doc, p.page, p.start))
    top = scored[:k]
    cov = Coverage(
        method=RETRIEVAL_VERSION, documents=len(sources), pages_searched=searched,
        pages_unreadable=unreadable, passages_considered=len(candidates), returned=len(top),
        note=(f"Searched {searched} extracted page(s) by word overlap and returned the top "
              f"{len(top)} of {len(candidates)} sentence(s). Unreadable pages ({unreadable}) "
              "and passages without shared words were not considered; relevant material may "
              "exist that this search did not surface."))
    return top, cov


@dataclass(frozen=True)
class SuggestionProposal:
    """Raw proposer output (untrusted)."""

    kind: str
    text: str
    references: tuple[QuoteProposal, ...] = ()


@dataclass(frozen=True)
class CitedCheck:
    proposal: QuoteProposal
    rejection: str | None
    result: CheckResult | None


@dataclass(frozen=True)
class Suggestion:
    kind: str
    text: str
    citations: tuple[CitedCheck, ...]
    label: str = LABEL
    problems: tuple[str, ...] = field(default_factory=tuple)

    @property
    def citations_all_verified(self) -> bool:
        return bool(self.citations) and all(
            c.result is not None and c.result.outcome.value == "verified" for c in self.citations)


def validate(proposal: SuggestionProposal, manifest: RecordManifest,
             resolver: SourceResolver, max_refs: int = 3) -> Suggestion | None:
    """Check a proposal's shape and citations. Returns None if it is unusable."""

    problems: list[str] = []
    if proposal.kind not in KINDS:
        return None
    text = proposal.text.strip()
    if not text or len(text) > 1200:
        return None
    refs = proposal.references[:max_refs]
    if len(proposal.references) > max_refs:
        problems.append(f"only the first {max_refs} citations were checked")
    checks = []
    for ref in refs:
        req = characterize_quote(ref, manifest)
        if isinstance(req, Rejection):
            checks.append(CitedCheck(ref, req.reason, None))
        else:
            checks.append(CitedCheck(ref, None, run_check(req, resolver)))
    if proposal.kind == "contrary_passage" and not refs:
        problems.append("a contrary-passage suggestion without a citation cannot be traced")
    return Suggestion(kind=proposal.kind, text=text, citations=tuple(checks),
                      problems=tuple(problems))
