import pytest

from cross_examine.schema import Finding, Layer, Outcome, Verdict, aggregate


def finding(claim_id: str, outcome: Outcome) -> Finding:
    return Finding(
        claim_id=claim_id,
        layer=Layer.BEHAVIORAL_DIFF,
        outcome=outcome,
        command="python -m check",
        output="captured",
    )


@pytest.mark.parametrize(
    ("findings", "critical", "expected"),
    [
        ([], set(), Verdict.SAFE),
        ([], {"c1"}, Verdict.RISKY),
        ([finding("other", Outcome.VERIFIED)], {"c1"}, Verdict.RISKY),
        ([finding("c1", Outcome.VERIFIED)], {"c1", "c2"}, Verdict.RISKY),
        ([finding("c1", Outcome.VERIFIED)], {"c1"}, Verdict.SAFE),
        ([finding("c1", Outcome.REFUTED)], {"c1"}, Verdict.BROKEN),
        ([finding("c1", Outcome.REFUTED)], set(), Verdict.RISKY),
        ([finding("c1", Outcome.UNVERIFIABLE)], {"c1"}, Verdict.RISKY),
        ([finding("c1", Outcome.UNVERIFIABLE)], set(), Verdict.SAFE),
    ],
)
def test_aggregate_decision_table(
    findings: list[Finding], critical: set[str], expected: Verdict
) -> None:
    assert aggregate(findings, critical) is expected


def test_report_refuted_property_filters_findings() -> None:
    from cross_examine.schema import Report

    refuted = finding("refuted", Outcome.REFUTED)
    verified = finding("verified", Outcome.VERIFIED)

    report = Report(repo="repo", pr_ref="base..head", verdict=Verdict.RISKY, findings=[refuted, verified])

    assert report.refuted == [refuted]
