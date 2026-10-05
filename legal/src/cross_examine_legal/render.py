"""Stage 5 — Render: check results as plain data for a host product's report.

Rendering never re-decides anything; it validates receipt integrity and copies.
"""

from __future__ import annotations

from cross_examine_legal.schema import CheckOutcome, CheckResult


class ReceiptError(ValueError):
    """A decided finding lacks its command/output or its receipt does not match."""


def validate(result: CheckResult) -> CheckResult:
    decided = result.outcome is not CheckOutcome.INCOMPLETE
    if decided and (not result.command.strip() or not result.output.strip()):
        raise ReceiptError("decided finding lacks its command or captured output")
    r = result.receipt
    if (r.command, r.output, r.exit_status) != (result.command, result.output, result.exit_status):
        raise ReceiptError("receipt does not belong to this finding")
    if not r.is_intact():
        raise ReceiptError("receipt hash does not match its command and output")
    return result


def to_dict(result: CheckResult) -> dict[str, object]:
    validate(result)
    return {
        "kind": result.kind.value,
        "outcome": result.outcome.value,
        "command": result.command,
        "output": result.output,
        "exit_status": result.exit_status,
        "receipt_sha256": result.receipt.evidence_hash,
        "source_dependencies": list(result.source_dependencies),
        "parameters": result.parameters,
        "establishes": result.establishes,
        "detail": result.detail,
        "output_truncated": result.output_truncated,
    }
