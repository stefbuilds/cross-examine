from __future__ import annotations

from pathlib import Path

from cross_examine.cross_examine.layer_a import capture_base, run_layer_a
from cross_examine.schema import Claim, Outcome, Verdict, aggregate


def write_normalizer(root: Path, implementation: str) -> None:
    package = root / "src" / "normalizer"
    package.mkdir(parents=True)
    (package / "__init__.py").write_text("", encoding="utf-8")
    (package / "core.py").write_text(implementation, encoding="utf-8")


def test_layer_a_refutes_the_empty_input_regression(tmp_path: Path) -> None:
    base = tmp_path / "base"
    head = tmp_path / "head"
    write_normalizer(
        base,
        "def normalize(items: list[int]) -> list[int]:\n    return sorted(items)\n",
    )
    write_normalizer(
        head,
        "def normalize(items: list[int]) -> list[int] | None:\n"
        "    if not items:\n"
        "        return None\n"
        "    return sorted(items)\n",
    )
    claim = Claim(
        id="preserve-empty",
        text="preserves empty-list normalization",
        target_symbol="normalizer.core:normalize",
        risk="high",
        proposed_check="exercise empty and non-empty integer lists",
        preserve_critical=True,
    )

    fixtures = capture_base([claim], base, tmp_path / "probe-state")
    findings = run_layer_a([claim], fixtures, head, tmp_path / "probe-state")

    assert len(fixtures) == 3
    refuted = [finding for finding in findings if finding.outcome is Outcome.REFUTED]
    assert len(refuted) == 1
    assert refuted[0].claim_id == "preserve-empty"
    assert refuted[0].repro_input == "[]"
    assert refuted[0].expected == "[]"
    assert refuted[0].actual == "null"
    assert "probe_runner call normalizer.core:normalize" in refuted[0].command
    assert '"cross_examine_probe": 1' in refuted[0].output
    assert sum(finding.outcome is Outcome.VERIFIED for finding in findings) == 2


def test_non_json_behavior_abstains_instead_of_verifying(tmp_path: Path) -> None:
    base = tmp_path / "base"
    head = tmp_path / "head"
    implementation = "def unsupported() -> set[int]:\n    return {1}\n"
    write_normalizer(base, implementation)
    write_normalizer(head, implementation)
    claim = Claim(
        id="preserve-unsupported",
        text="preserves a set return value",
        target_symbol="normalizer.core:unsupported",
        risk="high",
        proposed_check="call unsupported",
        preserve_critical=True,
    )

    fixtures = capture_base([claim], base, tmp_path / "probe-state")
    findings = run_layer_a([claim], fixtures, head, tmp_path / "probe-state")

    assert fixtures == []
    assert len(findings) == 1
    assert findings[0].outcome is Outcome.UNVERIFIABLE
    assert "not JSON serializable" in findings[0].output


def test_matching_target_exceptions_are_verified_behavior(tmp_path: Path) -> None:
    base = tmp_path / "base"
    head = tmp_path / "head"
    implementation = (
        "def parse(value: int) -> int:\n"
        "    if value < 0:\n"
        "        raise ValueError('negative')\n"
        "    return value\n"
    )
    write_normalizer(base, implementation)
    write_normalizer(head, implementation)
    claim = Claim(
        id="preserve-exception",
        text="preserves negative input rejection",
        target_symbol="normalizer.core:parse",
        risk="high",
        proposed_check="call parse across the integer boundary catalog",
        preserve_critical=True,
    )

    fixtures = capture_base([claim], base, tmp_path / "probe-state")
    findings = run_layer_a([claim], fixtures, head, tmp_path / "probe-state")

    assert len(findings) == 5
    assert all(finding.outcome is Outcome.VERIFIED for finding in findings)
    negative = next(finding for finding in findings if finding.repro_input == "-1")
    assert negative.expected == '{"message":"negative","type":"ValueError"}'


def test_lazy_missing_dependency_abstains_instead_of_verifying(tmp_path: Path) -> None:
    base = tmp_path / "base"
    head = tmp_path / "head"
    implementation = (
        "def parse(value: int) -> int:\n"
        "    import dependency_that_is_not_installed\n"
        "    return value\n"
    )
    write_normalizer(base, implementation)
    write_normalizer(head, implementation)
    claim = Claim(
        id="preserve-lazy-import",
        text="preserves parsing with runtime dependencies available",
        target_symbol="normalizer.core:parse",
        risk="high",
        proposed_check="call parse across the integer boundary catalog",
        preserve_critical=True,
    )

    fixtures = capture_base([claim], base, tmp_path / "probe-state")
    findings = run_layer_a([claim], fixtures, head, tmp_path / "probe-state")

    assert fixtures == []
    assert [finding.outcome for finding in findings] == [Outcome.UNVERIFIABLE]
    assert "ModuleNotFoundError" in findings[0].output
    assert aggregate(findings, {claim.id}) is Verdict.RISKY


def test_intended_change_without_an_oracle_abstains_on_equal_behavior(tmp_path: Path) -> None:
    base = tmp_path / "base"
    head = tmp_path / "head"
    implementation = "def normalize(items: list[int]) -> list[int]:\n    return sorted(items)\n"
    write_normalizer(base, implementation)
    write_normalizer(head, implementation)
    claim = Claim(
        id="change-empty",
        text="changes empty-list normalization to a new sentinel",
        target_symbol="normalizer.core:normalize",
        risk="high",
        proposed_check="verify the new sentinel with a deterministic oracle",
        preserve_critical=False,
        kind="intended_change",
    )

    fixtures = capture_base([claim], base, tmp_path / "probe-state")
    findings = run_layer_a([claim], fixtures, head, tmp_path / "probe-state")

    assert findings
    assert all(finding.outcome is Outcome.UNVERIFIABLE for finding in findings)
    assert "preservation evidence cannot verify an intended change" in findings[0].output
