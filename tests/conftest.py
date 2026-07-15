import pytest

from cross_examine.schema import (
    Claim,
    CorpusDelta,
    Finding,
    Layer,
    Outcome,
    Report,
    Verdict,
)


@pytest.fixture
def sample_report() -> Report:
    return Report(
        repo="owner/repo",
        pr_ref="abc..def",
        verdict=Verdict.BROKEN,
        claims=[
            Claim(
                id="c1",
                text="preserves empty input",
                target_symbol="pkg.fn",
                risk="high",
                proposed_check="call with []",
                preserve_critical=True,
            )
        ],
        findings=[
            Finding(
                claim_id="c1",
                layer=Layer.BEHAVIORAL_DIFF,
                outcome=Outcome.REFUTED,
                command="python probe.py",
                output="AssertionError",
                repro_input="[]",
                expected="[]",
                actual="null",
                confidence=0.95,
            )
        ],
        corpus=CorpusDelta(pinned_this_run=1, corpus_total=7),
    )

