"""Clearly labeled fixture data for contract-first UI development."""

from cross_examine.schema import (
    Claim,
    CorpusDelta,
    Finding,
    Layer,
    Outcome,
    Report,
    Verdict,
)
from cross_examine.validation import validate_report


def broken_fixture_report() -> Report:
    report = Report(
        repo="cross-examine/hero-normalizer",
        pr_ref="base-empty-safe..head-empty-regression",
        verdict=Verdict.BROKEN,
        claims=[
            Claim(
                id="preserve-empty",
                text="preserves empty-list normalization",
                target_symbol="normalizer.core:normalize",
                risk="high",
                proposed_check="Call normalize with an empty list",
                preserve_critical=True,
            )
        ],
        findings=[
            Finding(
                claim_id="preserve-empty",
                layer=Layer.BEHAVIORAL_DIFF,
                outcome=Outcome.REFUTED,
                command="python -m pytest -q tests/test_normalize.py -k empty",
                output=(
                    "FAILED tests/test_normalize.py::test_empty\nAssertionError: assert None == []"
                ),
                repro_input="[]",
                expected="[]",
                actual="None",
                confidence=1.0,
            )
        ],
        corpus=CorpusDelta(pinned_this_run=6, corpus_total=47),
    )
    return validate_report(report)
