"""Validation at the persistence and render boundary."""

from cross_examine.schema import Outcome, Report


class GroundingError(ValueError):
    """Raised when a decided finding lacks executable evidence."""


def validate_report(report: Report) -> Report:
    """Reject verified or refuted findings that lack command or output."""

    for finding in report.findings:
        if finding.outcome in {Outcome.VERIFIED, Outcome.REFUTED} and (
            not finding.command.strip() or not finding.output.strip()
        ):
            raise GroundingError(f"{finding.claim_id} lacks execution grounding")
    return report

