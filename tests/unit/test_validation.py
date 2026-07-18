import pytest

from cross_examine.schema import EvidenceReceipt, Finding, Layer, Outcome, Report, Verdict, evidence_hash
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


def _receipt(command: str = "python probe.py", output: str = "captured") -> EvidenceReceipt:
    return EvidenceReceipt(command, output, evidence_hash(command, output))


@pytest.mark.parametrize("outcome", [Outcome.VERIFIED, Outcome.REFUTED])
def test_decided_outcomes_require_structural_receipts(outcome: Outcome) -> None:
    report = Report(
        repo="repo",
        pr_ref="base..head",
        verdict=Verdict.RISKY,
        findings=[Finding("c", Layer.ADVERSARIAL, outcome, "python probe.py", "captured")],
    )

    with pytest.raises(GroundingError, match="lacks execution receipts"):
        validate_report(report)


def test_decided_outcomes_reject_tampered_receipt_hashes() -> None:
    receipt = EvidenceReceipt("python probe.py", "captured", "0" * 64)
    report = Report(
        repo="repo",
        pr_ref="base..head",
        verdict=Verdict.BROKEN,
        findings=[
            Finding(
                "c",
                Layer.ADVERSARIAL,
                Outcome.REFUTED,
                "python probe.py",
                "captured",
                receipts=[receipt],
            )
        ],
    )

    with pytest.raises(GroundingError, match="invalid evidence hash"):
        validate_report(report)


def test_decided_outcomes_reject_receipts_unrelated_to_displayed_evidence() -> None:
    report = Report(
        repo="repo",
        pr_ref="base..head",
        verdict=Verdict.BROKEN,
        findings=[
            Finding(
                "c",
                Layer.ADVERSARIAL,
                Outcome.REFUTED,
                "python probe.py",
                "captured",
                receipts=[_receipt("python other.py", "other output")],
            )
        ],
    )

    with pytest.raises(GroundingError, match="unrelated execution receipt"):
        validate_report(report)


def test_decided_outcomes_accept_matching_receipts() -> None:
    receipt = _receipt()
    report = Report(
        repo="repo",
        pr_ref="base..head",
        verdict=Verdict.BROKEN,
        findings=[
            Finding(
                "c",
                Layer.ADVERSARIAL,
                Outcome.REFUTED,
                receipt.command,
                receipt.output,
                receipts=[receipt],
            )
        ],
    )

    assert validate_report(report) is report
