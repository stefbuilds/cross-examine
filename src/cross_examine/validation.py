"""Validation at the persistence and render boundary."""

from cross_examine.schema import Outcome, Report, evidence_hash


class GroundingError(ValueError):
    """Raised when a decided finding lacks executable evidence."""


def validate_report(report: Report) -> Report:
    """Reject verified or refuted findings that lack command or output."""

    for finding in report.findings:
        if finding.outcome not in {Outcome.VERIFIED, Outcome.REFUTED}:
            continue
        if not finding.command.strip() or not finding.output.strip():
            raise GroundingError(f"{finding.claim_id} lacks execution grounding")
        if not finding.receipts:
            raise GroundingError(f"{finding.claim_id} lacks execution receipts")
        for receipt in finding.receipts:
            if receipt.evidence_hash != evidence_hash(receipt.command, receipt.output):
                raise GroundingError(f"{finding.claim_id} has an invalid evidence hash")
            if receipt.command not in finding.command or (
                receipt.output and receipt.output not in finding.output
            ):
                raise GroundingError(f"{finding.claim_id} has an unrelated execution receipt")
    return report
