from __future__ import annotations

from pathlib import Path
from types import SimpleNamespace
from typing import Any

import pytest
from pydantic import ValidationError

from cross_examine.characterize.models import CharacterizationPayload, ClaimPayload
from cross_examine.characterize.service import CharacterizationError, Characterizer
from cross_examine.schema import IngestResult, TouchedSymbol


class FakeResponses:
    def __init__(self, payload: CharacterizationPayload | None) -> None:
        self.payload = payload
        self.calls: list[dict[str, Any]] = []

    def parse(self, **kwargs: Any) -> SimpleNamespace:
        self.calls.append(kwargs)
        return SimpleNamespace(
            output_parsed=self.payload,
            id="resp_123",
            _request_id="req_123",
        )


class FakeClient:
    def __init__(self, payload: CharacterizationPayload | None) -> None:
        self.responses = FakeResponses(payload)


def ingest_result(tmp_path: Path) -> IngestResult:
    head = tmp_path / "head"
    source = head / "src" / "sample" / "math.py"
    source.parent.mkdir(parents=True)
    source.write_text(
        "def clamp(value: int, lower: int, upper: int) -> int:\n"
        "    return max(lower, min(value, upper))\n",
        encoding="utf-8",
    )
    return IngestResult(
        repo="sample",
        base_sha="a" * 40,
        head_sha="b" * 40,
        base_path=str(tmp_path / "base"),
        head_path=str(head),
        diff="+def clamp(value, lower, upper): ...",
        touched_symbols=[
            TouchedSymbol(
                module="sample.math",
                qualname="clamp",
                target_symbol="sample.math:clamp",
                file_path="src/sample/math.py",
            )
        ],
        test_commands=[["python", "-m", "pytest", "-q"]],
        evidence=[],
    )


def claim_payload(**overrides: Any) -> ClaimPayload:
    values: dict[str, Any] = {
        "id": "preserve-clamp",
        "text": "preserves clamping inside valid bounds",
        "target_symbol": "sample.math:clamp",
        "risk": "high",
        "proposed_check": "exercise values below, inside, and above the bounds",
        "preserve_critical": True,
        "kind": "preservation",
    }
    values.update(overrides)
    return ClaimPayload(**values)


def test_characterizer_uses_sol_structured_output_and_returns_only_claims(
    tmp_path: Path,
) -> None:
    client = FakeClient(CharacterizationPayload(claims=[claim_payload()]))
    characterizer = Characterizer(client)

    claims = characterizer.characterize(ingest_result(tmp_path))

    assert [claim.target_symbol for claim in claims] == ["sample.math:clamp"]
    assert claims[0].preserve_critical is True
    assert claims[0].kind.value == "preservation"
    call = client.responses.calls[0]
    assert call["model"] == "gpt-5.6-sol"
    assert call["text_format"] is CharacterizationPayload
    assert call["store"] is False
    assert "sample.math:clamp" in call["input"][1]["content"]
    assert characterizer.last_request_id == "req_123"


def test_payload_forbids_a_model_supplied_verdict() -> None:
    values = claim_payload().model_dump()
    values["verdict"] = "safe"

    with pytest.raises(ValidationError):
        CharacterizationPayload.model_validate({"claims": [values]})


@pytest.mark.parametrize(
    ("payload", "message"),
    [
        (None, "parsed output"),
        (CharacterizationPayload(claims=[]), "at least one"),
        (
            CharacterizationPayload(
                claims=[claim_payload(), claim_payload(text="duplicate claim")]
            ),
            "Duplicate claim ID",
        ),
        (
            CharacterizationPayload(
                claims=[claim_payload(target_symbol="sample.math:not_discovered")]
            ),
            "Unknown target symbol",
        ),
        (
            CharacterizationPayload(claims=[claim_payload(proposed_check="   ")]),
            "proposed check",
        ),
        (
            CharacterizationPayload(
                claims=[claim_payload(kind="intended_change", preserve_critical=True)]
            ),
            "intended-change claim",
        ),
        (
            CharacterizationPayload(
                claims=[claim_payload(id=f"claim-{index}") for index in range(21)]
            ),
            "at most 20",
        ),
    ],
)
def test_characterizer_rejects_unsafe_or_ambiguous_outputs(
    tmp_path: Path,
    payload: CharacterizationPayload | None,
    message: str,
) -> None:
    characterizer = Characterizer(FakeClient(payload))

    with pytest.raises(CharacterizationError, match=message):
        characterizer.characterize(ingest_result(tmp_path))


def test_verdict_module_has_no_openai_dependency() -> None:
    schema_source = Path(__file__).parents[2] / "src" / "cross_examine" / "schema.py"

    assert "openai" not in schema_source.read_text(encoding="utf-8").casefold()
