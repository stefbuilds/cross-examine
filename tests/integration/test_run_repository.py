from pathlib import Path

import pytest

from cross_examine.persistence.database import Database
from cross_examine.persistence.runs import RunRepository
from cross_examine.schema import Report, RunSpec, Verdict
from cross_examine.validation import GroundingError


def open_repository(path: Path) -> RunRepository:
    return RunRepository(Database(path))


def test_run_survives_database_reopen(tmp_path: Path, sample_report: Report) -> None:
    path = tmp_path / "cross-examine.db"
    spec = RunSpec(repo="owner/repo", base_ref="abc", head_ref="def")
    repository = open_repository(path)

    created = repository.create(spec, run_id="run-1")
    progressed = repository.set_progress("run-1", stage="layer_a", message="Replaying fixtures")
    completed = repository.complete("run-1", sample_report)

    assert created.status == "queued"
    assert progressed.stage == "layer_a"
    assert completed.status == "complete"
    assert completed.report is not None
    assert completed.report.verdict is Verdict.BROKEN

    reopened = open_repository(path)
    restored = reopened.get("run-1")

    assert restored == completed
    assert reopened.list() == [completed]


def test_missing_run_returns_none(tmp_path: Path) -> None:
    repository = open_repository(tmp_path / "cross-examine.db")

    assert repository.get("missing") is None


def test_complete_rejects_a_report_with_a_tampered_verdict(
    tmp_path: Path,
    sample_report: Report,
) -> None:
    repository = open_repository(tmp_path / "cross-examine.db")
    repository.create(RunSpec(repo="owner/repo", base_ref="abc", head_ref="def"), run_id="run-1")
    sample_report.verdict = Verdict.SAFE

    with pytest.raises(GroundingError, match="verdict disagrees"):
        repository.complete("run-1", sample_report)
