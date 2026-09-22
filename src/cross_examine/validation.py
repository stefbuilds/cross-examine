"""Validation at the persistence and render boundary."""

from cross_examine.schema import ClaimKind, ClaimOrigin, Outcome, Report, aggregate, evidence_hash


class GroundingError(ValueError):
    """Raised when a decided finding lacks executable evidence."""


def validate_report(report: Report) -> Report:
    """Reject reports whose evidence, links, or deterministic verdict disagree."""

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

    claim_ids = [claim.id for claim in report.claims]
    if len(claim_ids) != len(set(claim_ids)):
        raise GroundingError("report contains a duplicate claim ID")
    for claim in report.claims:
        is_system_id = claim.id.startswith("system:")
        if is_system_id != (claim.origin is ClaimOrigin.SYSTEM):
            raise GroundingError(f"{claim.id} has an invalid claim origin")

    known_claim_ids = set(claim_ids)
    for finding in report.findings:
        if finding.claim_id not in known_claim_ids:
            raise GroundingError(f"{finding.claim_id} references an unknown claim")

    critical_claim_ids = {
        claim.id
        for claim in report.claims
        if claim.preserve_critical or claim.kind is ClaimKind.INTENDED_CHANGE
    }
    expected_verdict = aggregate(report.findings, critical_claim_ids)
    if report.verdict is not expected_verdict:
        raise GroundingError(
            f"report verdict disagrees with deterministic aggregation: "
            f"expected {expected_verdict.value}"
        )
    return report
