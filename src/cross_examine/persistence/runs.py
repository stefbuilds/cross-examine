"""Restart-safe repository for runs and completed reports."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import UTC, datetime
from uuid import uuid4

from cross_examine.codec import report_from_json, report_to_json
from cross_examine.persistence.database import Database
from cross_examine.schema import Report, RunSpec
from cross_examine.validation import validate_report


@dataclass(frozen=True)
class RunRecord:
    id: str
    repo: str
    base_ref: str
    head_ref: str
    status: str
    stage: str
    message: str
    created_at: str
    updated_at: str
    report: Report | None = None


class RunRepository:
    def __init__(self, database: Database) -> None:
        self.database = database

    def create(self, spec: RunSpec, run_id: str | None = None) -> RunRecord:
        identifier = run_id or uuid4().hex
        now = _timestamp()
        with self.database.connect() as connection:
            connection.execute(
                """
                INSERT INTO runs (
                  id, repo, base_ref, head_ref, status, stage, message,
                  created_at, updated_at, report_json
                ) VALUES (?, ?, ?, ?, 'queued', 'queued', 'Waiting to start', ?, ?, NULL)
                """,
                (identifier, spec.repo, spec.base_ref, spec.head_ref, now, now),
            )
        record = self.get(identifier)
        assert record is not None
        return record

    def set_progress(self, run_id: str, stage: str, message: str) -> RunRecord:
        with self.database.connect() as connection:
            cursor = connection.execute(
                """
                UPDATE runs
                SET status = 'running', stage = ?, message = ?, updated_at = ?
                WHERE id = ?
                """,
                (stage, message, _timestamp(), run_id),
            )
            if cursor.rowcount != 1:
                raise KeyError(run_id)
        record = self.get(run_id)
        assert record is not None
        return record

    def complete(self, run_id: str, report: Report) -> RunRecord:
        validate_report(report)
        with self.database.connect() as connection:
            cursor = connection.execute(
                """
                UPDATE runs
                SET status = 'complete', stage = 'complete', message = 'Report ready',
                    updated_at = ?, report_json = ?
                WHERE id = ?
                """,
                (_timestamp(), report_to_json(report), run_id),
            )
            if cursor.rowcount != 1:
                raise KeyError(run_id)
        record = self.get(run_id)
        assert record is not None
        return record

    def fail(self, run_id: str, message: str) -> RunRecord:
        with self.database.connect() as connection:
            cursor = connection.execute(
                """
                UPDATE runs
                SET status = 'failed', stage = 'failed', message = ?, updated_at = ?
                WHERE id = ?
                """,
                (message, _timestamp(), run_id),
            )
            if cursor.rowcount != 1:
                raise KeyError(run_id)
        record = self.get(run_id)
        assert record is not None
        return record

    def get(self, run_id: str) -> RunRecord | None:
        with self.database.connect() as connection:
            row = connection.execute("SELECT * FROM runs WHERE id = ?", (run_id,)).fetchone()
        return _from_row(row) if row is not None else None

    def list(self, limit: int = 50) -> list[RunRecord]:
        with self.database.connect() as connection:
            rows = connection.execute(
                "SELECT * FROM runs ORDER BY created_at DESC LIMIT ?", (limit,)
            ).fetchall()
        return [_from_row(row) for row in rows]


def _from_row(row: object) -> RunRecord:
    report_json = row["report_json"]  # type: ignore[index]
    return RunRecord(
        id=row["id"],  # type: ignore[index]
        repo=row["repo"],  # type: ignore[index]
        base_ref=row["base_ref"],  # type: ignore[index]
        head_ref=row["head_ref"],  # type: ignore[index]
        status=row["status"],  # type: ignore[index]
        stage=row["stage"],  # type: ignore[index]
        message=row["message"],  # type: ignore[index]
        created_at=row["created_at"],  # type: ignore[index]
        updated_at=row["updated_at"],  # type: ignore[index]
        report=report_from_json(report_json) if report_json else None,
    )


def _timestamp() -> str:
    return datetime.now(UTC).isoformat()
