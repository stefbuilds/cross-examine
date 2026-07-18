from __future__ import annotations

from pathlib import Path

from cross_examine.cross_examine.layer_a import capture_base, run_layer_a, run_probe_plans
from cross_examine.probe_plans import ProbePlan
from cross_examine.schema import Claim, Outcome, aggregate


def write_target(root: Path, implementation: str) -> None:
    package = root / "src" / "sample"
    package.mkdir(parents=True)
    (package / "__init__.py").write_text("", encoding="utf-8")
    (package / "core.py").write_text(implementation, encoding="utf-8")


def relation_plan(relation_type: str, values: list[list[int]]) -> ProbePlan:
    return ProbePlan(
        id=f"{relation_type}-plan",
        version=1,
        claim_id="preserve-transform",
        target_symbol="sample.core:transform",
        input_domain={"parameters": {"items": values}},
        relation_type=relation_type,
        relation_parameters={"parameter": "items"},
        oracle_category="metamorphic",
        priority=5,
        budget=4,
        provenance={"source": "test"},
    )


def claim() -> Claim:
    return Claim(
        id="preserve-transform",
        text="preserves transform relation",
        target_symbol="sample.core:transform",
        risk="high",
        proposed_check="execute a constrained relation",
        preserve_critical=True,
    )


def test_permutation_relation_detects_a_length_three_defect_missed_by_catalog(tmp_path: Path) -> None:
    base, head = tmp_path / "base", tmp_path / "head"
    write_target(base, "def transform(items: list[int]) -> list[int]:\n    return sorted(items)\n")
    write_target(
        head,
        "def transform(items: list[int]) -> list[int]:\n"
        "    return items if len(items) == 3 else sorted(items)\n",
    )

    legacy_fixtures = capture_base([claim()], base, tmp_path / "legacy")
    legacy_findings = run_layer_a([claim()], legacy_fixtures, head, tmp_path / "legacy")
    assert all(finding.outcome is Outcome.VERIFIED for finding in legacy_findings)

    findings = run_probe_plans([claim()], [relation_plan("permutation_invariance", [[3, 1, 2]])], base, head, tmp_path / "state")

    assert [finding.outcome for finding in findings] == [Outcome.REFUTED]
    assert "permutation_invariance" in findings[0].output
    assert "plan_id=permutation_invariance-plan" in findings[0].output
    assert findings[0].receipts
    assert all(receipt.command in findings[0].command for receipt in findings[0].receipts)
    assert all(receipt.output in findings[0].output for receipt in findings[0].receipts)


def test_partition_relation_detects_a_length_three_defect_missed_by_catalog(tmp_path: Path) -> None:
    base, head = tmp_path / "base", tmp_path / "head"
    write_target(base, "def transform(items: list[int]) -> list[int]:\n    return [item + 1 for item in items]\n")
    write_target(
        head,
        "def transform(items: list[int]) -> list[int]:\n"
        "    return items if len(items) == 3 else [item + 1 for item in items]\n",
    )

    legacy_fixtures = capture_base([claim()], base, tmp_path / "legacy")
    legacy_findings = run_layer_a([claim()], legacy_fixtures, head, tmp_path / "legacy")
    assert all(finding.outcome is Outcome.VERIFIED for finding in legacy_findings)

    findings = run_probe_plans([claim()], [relation_plan("partition_concatenation", [[1, 2, 3]])], base, head, tmp_path / "state")

    assert [finding.outcome for finding in findings] == [Outcome.REFUTED]
    assert "partition_concatenation" in findings[0].output


def test_malformed_plan_becomes_unverifiable_and_never_refutes(tmp_path: Path) -> None:
    root = tmp_path / "root"
    write_target(root, "def transform(items: list[int]) -> list[int]:\n    return items\n")
    unsafe = relation_plan("permutation_invariance", [[1, 2]])
    unsafe.input_domain = {"parameters": {"items": [{"code": "False"}]}}

    findings = run_probe_plans([claim()], [unsafe], root, root, tmp_path / "state")

    assert [finding.outcome for finding in findings] == [Outcome.UNVERIFIABLE]
    assert aggregate(findings, {"preserve-transform"}).value == "risky"


def test_probe_plans_accept_pipeline_corpus_coverage(tmp_path: Path) -> None:
    root = tmp_path / "root"
    write_target(root, "def transform(items: list[int]) -> list[int]:\n    return sorted(items)\n")

    findings = run_probe_plans(
        [claim()],
        [relation_plan("permutation_invariance", [[2, 1]])],
        root,
        root,
        tmp_path / "state",
        corpus_coverage={"sample.core:transform": 1},
    )

    assert [finding.outcome for finding in findings] == [Outcome.VERIFIED]
