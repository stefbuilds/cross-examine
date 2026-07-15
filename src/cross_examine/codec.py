"""Lossless JSON codec for the render contract."""

from __future__ import annotations

import json
from dataclasses import asdict
from typing import Any

from cross_examine.schema import (
    Claim,
    ClaimKind,
    CorpusDelta,
    Finding,
    Layer,
    Outcome,
    Report,
    Verdict,
)


def report_to_json(report: Report) -> str:
    """Serialize a report using stable enum values and compact JSON."""

    return json.dumps(asdict(report), ensure_ascii=False, separators=(",", ":"), sort_keys=True)


def report_from_json(raw: str) -> Report:
    """Deserialize and validate the required report shape."""

    try:
        payload: dict[str, Any] = json.loads(raw)
        findings = [
            Finding(
                claim_id=item["claim_id"],
                layer=Layer(item["layer"]),
                outcome=Outcome(item["outcome"]),
                command=item["command"],
                output=item["output"],
                repro_input=item.get("repro_input"),
                expected=item.get("expected"),
                actual=item.get("actual"),
                confidence=float(item.get("confidence", 1.0)),
                provenance=item.get("provenance"),
            )
            for item in payload.get("findings", [])
        ]
        claims = [
            Claim(
                id=item["id"],
                text=item["text"],
                target_symbol=item["target_symbol"],
                risk=item["risk"],
                proposed_check=item["proposed_check"],
                preserve_critical=bool(item.get("preserve_critical", False)),
                kind=ClaimKind(item.get("kind", "preservation")),
                probe_plans=list(item.get("probe_plans", [])),
            )
            for item in payload.get("claims", [])
        ]
        corpus_payload = payload.get("corpus")
        corpus = (
            CorpusDelta(
                pinned_this_run=int(corpus_payload["pinned_this_run"]),
                corpus_total=int(corpus_payload["corpus_total"]),
            )
            if corpus_payload is not None
            else None
        )
        return Report(
            repo=payload["repo"],
            pr_ref=payload["pr_ref"],
            verdict=Verdict(payload["verdict"]),
            findings=findings,
            claims=claims,
            corpus=corpus,
        )
    except (json.JSONDecodeError, KeyError, TypeError, ValueError) as exc:
        raise ValueError("Invalid report payload") from exc
