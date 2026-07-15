import pytest

from cross_examine.schema import Finding, Layer, Outcome, Report, Verdict
from cross_examine.validation import GroundingError, validate_report


@pytest.mark.parametrize("outcome", [Outcome.VERIFIED, Outcome.REFUTED])
def test_grounded_outcomes_require_command_and_output(outcome: Outcome) -> None:
    report = Report(
        repo="repo",
        pr_ref="base..head",
        verdict=Verdict.RISKY,
        findings=[Finding("c", Layer.ADVERSARIAL, outcome, "", "")],
    )

    with pytest.raises(GroundingError, match="lacks execution grounding"):
        validate_report(report)


def test_grounded_outcomes_reject_whitespace_evidence() -> None:
    report = Report(
        repo="repo",
        pr_ref="base..head",
        verdict=Verdict.RISKY,
        findings=[Finding("c", Layer.ADVERSARIAL, Outcome.REFUTED, "  ", "\n")],
    )

    with pytest.raises(GroundingError):
        validate_report(report)


def test_unverifiable_may_have_no_execution_evidence() -> None:
    report = Report(
        repo="repo",
        pr_ref="base..head",
        verdict=Verdict.RISKY,
        findings=[Finding("c", Layer.ADVERSARIAL, Outcome.UNVERIFIABLE, "", "")],
    )

    assert validate_report(report) is report

