import json

import pytest

from cross_examine.codec import report_from_json, report_to_json
from cross_examine.schema import Report


def test_report_round_trip_preserves_contract(sample_report: Report) -> None:
    assert report_from_json(report_to_json(sample_report)) == sample_report


def test_report_json_uses_enum_values(sample_report: Report) -> None:
    payload = json.loads(report_to_json(sample_report))

    assert payload["verdict"] == "broken"
    assert payload["findings"][0]["outcome"] == "refuted"
    assert payload["findings"][0]["layer"] == "behavioral_diff"
    assert payload["findings"][0]["receipts"][0]["evidence_hash"]


def test_report_from_json_rejects_missing_required_keys() -> None:
    with pytest.raises(ValueError, match="Invalid report payload"):
        report_from_json('{"repo":"owner/repo"}')


def test_report_from_json_rejects_legacy_decided_findings_without_receipts(
    sample_report: Report,
) -> None:
    payload = json.loads(report_to_json(sample_report))
    payload["findings"][0].pop("receipts")

    with pytest.raises(ValueError, match="Invalid report payload"):
        report_from_json(json.dumps(payload))


def test_report_from_json_rejects_a_tampered_verdict(sample_report: Report) -> None:
    payload = json.loads(report_to_json(sample_report))
    payload["verdict"] = "safe"

    with pytest.raises(ValueError, match="Invalid report payload"):
        report_from_json(json.dumps(payload))
