from pathlib import Path

import cross_examine.pipeline as pipeline_module
from pytest import MonkeyPatch
from cross_examine.corpus.repository import CorpusRepository
from cross_examine.cross_examine.layer_b import run_layer_b
from cross_examine.persistence.database import Database
from cross_examine.pipeline import Pipeline
from cross_examine.schema import Claim, IngestResult, Layer, Outcome, RunProgress, RunSpec


def write_target(root: Path, implementation: str) -> None:
    package = root / "src" / "sample"
    package.mkdir(parents=True)
    (package / "__init__.py").write_text("", encoding="utf-8")
    (package / "normalizer.py").write_text(implementation, encoding="utf-8")


def test_layer_b_shrinks_list_regression_to_empty_input(tmp_path: Path) -> None:
    base = tmp_path / "base"
    head = tmp_path / "head"
    write_target(
        base,
        "def normalize(items: list[int]) -> list[int]:\n    return sorted(items)\n",
    )
    write_target(
        head,
        "def normalize(items: list[int]) -> list[int] | None:\n"
        "    if len(items) == 0:\n"
        "        return None\n"
        "    return sorted(items)\n",
    )
    claim = Claim(
        id="preserve-normalize",
        text="preserves list normalization",
        target_symbol="sample.normalizer:normalize",
        risk="high",
        proposed_check="hunt list boundaries",
        preserve_critical=True,
    )

    findings = run_layer_b(
        [claim],
        base,
        head,
        tmp_path / "layer-b-state",
        timeout=120,
    )

    assert len(findings) == 1
    finding = findings[0]
    assert finding.layer is Layer.ADVERSARIAL
    assert finding.outcome is Outcome.REFUTED
    assert finding.repro_input == "[]"
    assert finding.expected == "[]"
    assert finding.actual == "null"
    assert "hypothesis_worker" in finding.command
    assert '"cross_examine_layer_b": 1' in finding.output
    assert len(finding.receipts) == 1
    assert finding.receipts[0].command == finding.command


def test_pipeline_never_enters_layer_b_before_layer_a(
    tmp_path: Path, monkeypatch: MonkeyPatch
) -> None:
    entered: list[str] = []

    class FakeIngest:
        def ingest(
            self,
            _spec: RunSpec,
            _run_dir: Path,
            *,
            deadline: float | None = None,
        ) -> IngestResult:
            del deadline
            return IngestResult(
                repo="sample",
                base_sha="a" * 40,
                head_sha="b" * 40,
                base_path=str(tmp_path / "base"),
                head_path=str(tmp_path / "head"),
                diff="",
                touched_symbols=[],
                test_commands=[],
                evidence=[],
            )

    class FakeCharacterizer:
        def characterize(
            self,
            _ingest: object,
            *,
            timeout: float | None = None,
        ) -> list[Claim]:
            del timeout
            return []

    monkeypatch.setattr(
        pipeline_module,
        "capture_base",
        lambda *_args, **_kwargs: [],
    )

    def layer_a(*_args: object, **_kwargs: object) -> list[object]:
        entered.append("layer_a")
        return []

    def layer_b(*_args: object, **_kwargs: object) -> list[object]:
        entered.append("layer_b")
        return []

    monkeypatch.setattr(pipeline_module, "run_layer_a", layer_a)
    monkeypatch.setattr(pipeline_module, "run_layer_b", layer_b)
    progress: list[RunProgress] = []
    pipeline = Pipeline(
        characterizer=FakeCharacterizer(),
        corpus=CorpusRepository(Database(tmp_path / "app.db")),
        runs_root=tmp_path / "runs",
        ingest=FakeIngest(),  # type: ignore[arg-type]
    )

    pipeline.run(
        RunSpec(repo="sample", base_ref="base", head_ref="head", layer_b=True),
        progress.append,
    )

    assert entered == ["layer_a", "layer_b"]
    stages = [event.stage for event in progress]
    assert stages.index("layer_a") < stages.index("layer_b")
