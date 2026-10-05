from __future__ import annotations

from cross_examine_legal import QuoteProposal, RecordManifest, extract_text_v1
from cross_examine_legal.layer_b import LABEL, SuggestionProposal, retrieve, validate

LOG = ("The alarm was acknowledged at 14:02 by the supervisor. "
       "The supervisor then left the console to assist on line 5.\f"
       "Procedure SP-11 requires the supervisor to remain at the console until the light is green. "
       "The maintenance ticket was closed by the night shift.")
EXPERT = "Response intervals of ten to twenty minutes are within observed industry variance."


class Res:
    def __init__(self, *svs):
        self.s = {v.sha256: v for v in svs}

    def source(self, sha):
        return self.s.get(sha)

    def manifest(self, sha):
        return None


def docs():
    a = extract_text_v1("LOG", 1, LOG.encode(), "text/plain")
    b = extract_text_v1("EXPERT", 1, EXPERT.encode(), "text/plain")
    return a, b, RecordManifest(1, {"LOG": a.sha256, "EXPERT": b.sha256})


def test_retrieval_is_bounded_deterministic_and_reports_coverage() -> None:
    a, b, _ = docs()
    q = "supervisor stayed at the console as procedure requires"
    top, cov = retrieve([a, b], q, k=2)
    again, _ = retrieve([a, b], q, k=2)
    assert top == again and len(top) == 2
    assert all("supervisor" in p.text.lower() or "console" in p.text.lower() for p in top)
    assert cov.pages_searched == 3 and cov.returned == 2 and "not considered" in cov.note
    excluded = {(top[0].sha256, top[0].page, top[0].text)}
    top2, _ = retrieve([a, b], q, k=2, exclude=excluded)
    assert top[0] not in top2


def test_validation_checks_citations_and_labels_everything() -> None:
    a, b, m = docs()
    s = validate(SuggestionProposal(
        "contrary_passage", "SP-11 suggests leaving the console breached procedure.",
        (QuoteProposal("LOG", "Procedure SP-11 requires the supervisor to remain at the console "
                              "until the light is green.", 1),
         QuoteProposal("LOG", "He was told to stay put.", 0),
         QuoteProposal("NOPE", "anything"))), m, Res(a, b))
    assert s is not None and s.label == LABEL
    outcomes = [c.result.outcome.value if c.result else c.rejection for c in s.citations]
    assert outcomes[0] == "verified" and outcomes[1] == "refuted" and "not in record" in outcomes[2]
    assert not s.citations_all_verified


def test_unusable_proposals_are_dropped() -> None:
    a, b, m = docs()
    assert validate(SuggestionProposal("verdict", "Find for plaintiff."), m, Res(a, b)) is None
    assert validate(SuggestionProposal("question", "   "), m, Res(a, b)) is None
    s = validate(SuggestionProposal("contrary_passage", "Something contradicts it."), m, Res(a, b))
    assert s is not None and "cannot be traced" in s.problems[0]
