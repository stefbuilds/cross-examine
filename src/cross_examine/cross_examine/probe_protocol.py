"""Tagged JSON protocol shared by the parent and isolated probe process."""

from __future__ import annotations

import json
from dataclasses import dataclass
from typing import Any

from cross_examine.schema import CommandEvidence

PROBE_VERSION = 1


@dataclass(frozen=True)
class ProbeResult:
    evidence: CommandEvidence
    envelope: dict[str, Any] | None
    error: str | None = None


def parse_probe_output(evidence: CommandEvidence) -> ProbeResult:
    if evidence.timed_out:
        return ProbeResult(evidence=evidence, envelope=None, error="probe timed out")
    if evidence.output_truncated:
        return ProbeResult(evidence=evidence, envelope=None, error="probe output exceeded limit")
    if evidence.exit_code != 0:
        return ProbeResult(
            evidence=evidence,
            envelope=None,
            error=f"probe exited with code {evidence.exit_code}",
        )
    for line in reversed(evidence.stdout.splitlines()):
        try:
            candidate = json.loads(line)
        except json.JSONDecodeError:
            continue
        if isinstance(candidate, dict) and candidate.get("cross_examine_probe") == PROBE_VERSION:
            if candidate.get("probe_error"):
                exception = candidate.get("exception") or {}
                detail = f"{exception.get('type', 'ProbeError')}: {exception.get('message', '')}"
                return ProbeResult(evidence=evidence, envelope=None, error=detail.rstrip())
            return ProbeResult(evidence=evidence, envelope=candidate)
    return ProbeResult(evidence=evidence, envelope=None, error="probe emitted no tagged envelope")


def canonical_envelope(envelope: dict[str, Any]) -> str:
    return json.dumps(envelope, ensure_ascii=False, separators=(",", ":"), sort_keys=True)


def display_result(envelope: dict[str, Any]) -> str:
    value = envelope.get("value") if envelope.get("ok") else envelope.get("exception")
    return json.dumps(value, ensure_ascii=False, separators=(",", ":"), sort_keys=True)
