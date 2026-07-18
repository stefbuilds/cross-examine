from __future__ import annotations

import subprocess
import time
from pathlib import Path

import pytest

from cross_examine.corpus.repository import CorpusRepository
from cross_examine.persistence.database import Database
from cross_examine.pipeline import Pipeline, _run_discovered_tests
from cross_examine.schema import (
    BehaviorFixture,
    Claim,
    EvidenceReceipt,
    Finding,
    IngestResult,
    Layer,
    Outcome,
    Report,
    RunProgress,
    RunSpec,
    TouchedSymbol,
    Verdict,
    evidence_hash,
)


class FakeCharacterizer:
    def characterize(
        self,
        _ingest: object,
        *,
        timeout: float | None = None,
    ) -> list[Claim]:
        del timeout
        return [
            Claim(
                id="preserve-empty",
                text="preserves empty-list normalization",
                target_symbol="normalizer.core:normalize",
                risk="high",
                proposed_check="exercise empty and non-empty integer lists",
                preserve_critical=True,
            )
        ]


class FailingIngest:
    def ingest(
        self,
        _spec: RunSpec,
        _run_dir: Path,
        *,
        deadline: float | None = None,
    ) -> object:
        del deadline
        raise RuntimeError("clone unavailable")


class ImmediateIngest:
    def __init__(self, root: Path) -> None:
        self.root = root

    def ingest(
        self,
        _spec: RunSpec,
        _run_dir: Path,
        *,
        deadline: float | None = None,
    ) -> IngestResult:
        del deadline
        for revision in ("base", "head"):
            source = self.root / revision / "src" / "normalizer" / "core.py"
            source.parent.mkdir(parents=True, exist_ok=True)
            source.write_text(
                "def normalize(items: list[int]) -> list[int]:\n    return sorted(items)\n",
                encoding="utf-8",
            )
        return IngestResult(
            repo="budget",
            base_sha="a" * 40,
            head_sha="b" * 40,
            base_path=str(self.root / "base"),
            head_path=str(self.root / "head"),
            diff="",
            touched_symbols=[
                TouchedSymbol(
                    module="normalizer.core",
                    qualname="normalize",
                    target_symbol="normalizer.core:normalize",
                    file_path="src/normalizer/core.py",
                )
            ],
            test_commands=[],
            evidence=[],
        )


class SlowCharacterizer(FakeCharacterizer):
    def __init__(self) -> None:
        self.seen_timeout: float | None = None

    def characterize(
        self,
        ingest: object,
        *,
        timeout: float | None = None,
    ) -> list[Claim]:
        self.seen_timeout = timeout
        time.sleep(0.08)
        return super().characterize(ingest)


def git(repo: Path, *args: str) -> str:
    result = subprocess.run(
        ["git", "-C", str(repo), *args],
        check=True,
        capture_output=True,
        text=True,
    )
    return result.stdout.strip()


def hero_repository(root: Path) -> tuple[Path, str, str]:
    repo = root / "hero"
    package = repo / "src" / "normalizer"
    package.mkdir(parents=True)
    (package / "__init__.py").write_text("", encoding="utf-8")
    source = package / "core.py"
    source.write_text(
        "def normalize(items: list[int]) -> list[int]:\n    return sorted(items)\n",
        encoding="utf-8",
    )
    (repo / "pyproject.toml").write_text(
        "[tool.pytest.ini_options]\ntestpaths = ['tests']\n",
        encoding="utf-8",
    )
    (repo / "tests").mkdir()
    (repo / "tests" / "test_core.py").write_text(
        "from normalizer.core import normalize\n\n"
        "def test_normalize_orders_values() -> None:\n"
        "    assert normalize([3, 1, 2]) == [1, 2, 3]\n",
        encoding="utf-8",
    )
    git(repo, "init")
    git(repo, "config", "user.name", "Cross Examine Test")
    git(repo, "config", "user.email", "cross-examine@example.test")
    git(repo, "add", ".")
    git(repo, "commit", "-m", "base")
    base_sha = git(repo, "rev-parse", "HEAD")

    source.write_text(
        "def normalize(items: list[int]) -> list[int] | None:\n"
        "    if not items:\n"
        "        return None\n"
        "    return sorted(items)\n",
        encoding="utf-8",
    )
    git(repo, "add", ".")
    git(repo, "commit", "-m", "regress empty normalization")
    return repo, base_sha, git(repo, "rev-parse", "HEAD")


def test_complete_layer_a_pipeline_produces_broken_grounded_report(tmp_path: Path) -> None:
    repo, base_sha, head_sha = hero_repository(tmp_path)
    corpus = CorpusRepository(Database(tmp_path / "app.db"))
    progress: list[RunProgress] = []
    pipeline = Pipeline(
        characterizer=FakeCharacterizer(),
        corpus=corpus,
        runs_root=tmp_path / "runs",
    )

    report = pipeline.run(
        RunSpec(repo=str(repo), base_ref=base_sha, head_ref=head_sha, layer_b=False),
        progress.append,
        run_id="hero-run",
    )

    assert [event.stage for event in progress] == [
        "ingesting",
        "characterizing",
        "capturing",
        "layer_a",
        "testing",
        "aggregating",
        "complete",
    ]
    assert report.verdict is Verdict.BROKEN
    refuted = [item for item in report.findings if item.outcome is Outcome.REFUTED]
    assert len(refuted) == 1
    assert refuted[0].repro_input == "[]"
    assert refuted[0].command
    assert refuted[0].output
    assert report.corpus is not None
    assert report.corpus.pinned_this_run == 2
    assert report.corpus.corpus_total == 2
    test_finding = next(item for item in report.findings if item.claim_id == "system:head-tests")
    assert test_finding.outcome is Outcome.VERIFIED
    assert "-m pytest -q" in test_finding.command
    assert "1 passed" in test_finding.output
    assert len(test_finding.receipts) == 2
    assert all(receipt.command in test_finding.command for receipt in test_finding.receipts)
    assert all(receipt.output in test_finding.output for receipt in test_finding.receipts)


def test_pipeline_validates_report_before_pinning_corpus(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    import cross_examine.pipeline as pipeline_module

    events: list[str] = []
    database = Database(tmp_path / "app.db")
    corpus = CorpusRepository(database)
    original_pin = corpus.pin
    original_validate = pipeline_module.validate_report

    def recording_pin(*args: object, **kwargs: object) -> bool:
        events.append("pin")
        return original_pin(*args, **kwargs)  # type: ignore[arg-type]

    def recording_validate(report: Report) -> Report:
        events.append("validate")
        return original_validate(report)

    command = "python probe.py"
    output = "captured"
    receipt = EvidenceReceipt(command, output, evidence_hash(command, output))
    fixture = BehaviorFixture(
        id="fixture",
        claim_id="preserve-empty",
        target_symbol="normalizer.core:normalize",
        args_json="[[]]",
        kwargs_json="{}",
        expected_json="null",
        command=command,
        output=output,
        receipt=receipt,
    )
    finding = Finding(
        claim_id="preserve-empty",
        layer=Layer.BEHAVIORAL_DIFF,
        outcome=Outcome.VERIFIED,
        command=command,
        output=output,
        repro_input="[]",
        receipts=[receipt],
    )

    monkeypatch.setattr(corpus, "pin", recording_pin)
    monkeypatch.setattr(pipeline_module, "validate_report", recording_validate)
    monkeypatch.setattr(pipeline_module, "capture_base", lambda *args, **kwargs: [fixture])
    monkeypatch.setattr(pipeline_module, "run_layer_a", lambda *args, **kwargs: [finding])
    pipeline = Pipeline(
        characterizer=FakeCharacterizer(),
        corpus=corpus,
        runs_root=tmp_path / "runs",
        ingest=ImmediateIngest(tmp_path / "materialized"),  # type: ignore[arg-type]
    )

    pipeline.run(
        RunSpec(repo="sample", base_ref="base", head_ref="head", layer_b=False),
        run_id="validate-before-pin",
    )

    assert "pin" in events
    assert events.index("validate") < events.index("pin")


def test_stage_failure_becomes_a_risky_unverifiable_report(tmp_path: Path) -> None:
    progress: list[RunProgress] = []
    pipeline = Pipeline(
        characterizer=FakeCharacterizer(),
        corpus=CorpusRepository(Database(tmp_path / "app.db")),
        runs_root=tmp_path / "runs",
        ingest=FailingIngest(),  # type: ignore[arg-type]
    )

    report = pipeline.run(
        RunSpec(repo="missing", base_ref="base", head_ref="head", layer_b=False),
        progress.append,
        run_id="failed-run",
    )

    assert report.verdict is Verdict.RISKY
    assert report.claims[-1].id == "system:ingesting"
    assert report.findings[-1].outcome is Outcome.UNVERIFIABLE
    assert "clone unavailable" in report.findings[-1].output
    assert [event.stage for event in progress] == ["ingesting", "aggregating", "complete"]


def test_total_run_budget_reaches_characterization_and_abstains_when_exhausted(
    tmp_path: Path,
) -> None:
    characterizer = SlowCharacterizer()
    pipeline = Pipeline(
        characterizer=characterizer,
        corpus=CorpusRepository(Database(tmp_path / "app.db")),
        runs_root=tmp_path / "runs",
        ingest=ImmediateIngest(tmp_path / "materialized"),  # type: ignore[arg-type]
    )

    report = pipeline.run(
        RunSpec(
            repo="budget",
            base_ref="base",
            head_ref="head",
            layer_b=False,
            run_timeout_seconds=0.05,  # type: ignore[arg-type]
        ),
        run_id="budget-run",
    )

    assert characterizer.seen_timeout is not None
    assert characterizer.seen_timeout <= 0.05 + 1e-9
    assert report.verdict is Verdict.RISKY
    assert report.findings[-1].outcome is Outcome.UNVERIFIABLE
    assert "Total run deadline exceeded" in report.findings[-1].output


def test_missing_optional_test_dependency_abstains_instead_of_refuting(
    tmp_path: Path,
) -> None:
    for revision in ("base", "head"):
        directory = tmp_path / revision
        directory.mkdir()
        (directory / "test_optional.py").write_text(
            "def test_optional_extra() -> None:\n"
            "    raise ImportError('Do pip install sample[crypto] to run this test')\n",
            encoding="utf-8",
        )

    _claim, findings = _run_discovered_tests(
        [["python", "-m", "pytest", "-q"]],
        tmp_path / "base",
        tmp_path / "head",
        timeout=10,
    )

    assert findings[0].outcome is Outcome.UNVERIFIABLE
    assert "1 failed" in findings[0].output


def test_preexisting_test_failure_does_not_blame_the_head_revision(tmp_path: Path) -> None:
    for revision in ("base", "head"):
        directory = tmp_path / revision
        directory.mkdir()
        (directory / "test_existing.py").write_text(
            "def test_existing_failure() -> None:\n    assert False\n",
            encoding="utf-8",
        )

    _claim, findings = _run_discovered_tests(
        [["python", "-m", "pytest", "-q"]],
        tmp_path / "base",
        tmp_path / "head",
        timeout=10,
    )

    assert findings[0].outcome is Outcome.UNVERIFIABLE
    assert "BASE OUTPUT" in findings[0].output
    assert "HEAD OUTPUT" in findings[0].output


def test_failing_base_test_that_passes_on_head_is_unverifiable(tmp_path: Path) -> None:
    base = tmp_path / "base"
    head = tmp_path / "head"
    base.mkdir()
    head.mkdir()
    (base / "test_recovery.py").write_text(
        "def test_behavior() -> None:\n    assert False\n",
        encoding="utf-8",
    )
    (head / "test_recovery.py").write_text(
        "def test_behavior() -> None:\n    assert True\n",
        encoding="utf-8",
    )

    _claim, findings = _run_discovered_tests(
        [["python", "-m", "pytest", "-q"]],
        base,
        head,
        timeout=10,
    )

    assert findings[0].outcome is Outcome.UNVERIFIABLE
    assert "1 failed" in findings[0].output
    assert "1 passed" in findings[0].output


def test_passing_base_test_that_fails_on_head_is_refuted(tmp_path: Path) -> None:
    base = tmp_path / "base"
    head = tmp_path / "head"
    base.mkdir()
    head.mkdir()
    (base / "test_regression.py").write_text(
        "def test_behavior() -> None:\n    assert True\n",
        encoding="utf-8",
    )
    (head / "test_regression.py").write_text(
        "def test_behavior() -> None:\n    assert False\n",
        encoding="utf-8",
    )

    _claim, findings = _run_discovered_tests(
        [["python", "-m", "pytest", "-q"]],
        base,
        head,
        timeout=10,
    )

    assert findings[0].outcome is Outcome.REFUTED
    assert "1 passed" in findings[0].output
    assert "1 failed" in findings[0].output
