"""Dedupe and select execution-grounded behavioral checks."""

from __future__ import annotations

import hashlib
import json
from dataclasses import dataclass
from datetime import UTC, datetime
from typing import Any

from cross_examine.persistence.database import Database
from cross_examine.schema import BehaviorFixture, Finding, Layer, Outcome


@dataclass(frozen=True)
class CorpusCheck:
    id: str
    repo: str
    target_symbol: str
    input_json: str
    expected_json: str
    command: str
    output: str
    first_run_id: str
    last_run_id: str
    created_at: str
    updated_at: str


@dataclass(frozen=True)
class CorpusSummary:
    repo: str
    corpus_total: int
    latest_growth: int
    last_run_id: str
    updated_at: str


class CorpusRepository:
    def __init__(self, database: Database) -> None:
        self.database = database

    def pin(
        self,
        repo: str,
        run_id: str,
        fixture: BehaviorFixture,
        finding: Finding,
    ) -> bool:
        if finding.outcome is not Outcome.VERIFIED:
            return False
        if finding.layer is not Layer.BEHAVIORAL_DIFF:
            return False
        if finding.claim_id != fixture.claim_id:
            return False

        input_payload = {
            "args": json.loads(fixture.args_json),
            "kwargs": json.loads(fixture.kwargs_json),
        }
        identity_payload = {
            "repo": repo,
            "target_symbol": fixture.target_symbol,
            **input_payload,
            "expected": json.loads(fixture.expected_json),
        }
        check_id = hashlib.sha256(_canonical_json(identity_payload).encode()).hexdigest()
        input_json = _canonical_json(input_payload)
        now = datetime.now(UTC).isoformat()
        with self.database.connect() as connection:
            cursor = connection.execute(
                """
                INSERT OR IGNORE INTO corpus_checks (
                  id, repo, target_symbol, input_json, expected_json, command, output,
                  first_run_id, last_run_id, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    check_id,
                    repo,
                    fixture.target_symbol,
                    input_json,
                    fixture.expected_json,
                    fixture.command,
                    fixture.output,
                    run_id,
                    run_id,
                    now,
                    now,
                ),
            )
            inserted = cursor.rowcount == 1
            if not inserted:
                connection.execute(
                    """
                    UPDATE corpus_checks
                    SET last_run_id = ?, updated_at = ?, command = ?, output = ?
                    WHERE id = ?
                    """,
                    (run_id, now, fixture.command, fixture.output, check_id),
                )
        return inserted

    def applicable(self, repo: str, target_symbol: str | None = None) -> list[CorpusCheck]:
        query = "SELECT * FROM corpus_checks WHERE repo = ?"
        parameters: tuple[str, ...] = (repo,)
        if target_symbol is not None:
            query += " AND target_symbol = ?"
            parameters = (repo, target_symbol)
        query += " ORDER BY created_at, id"
        with self.database.connect() as connection:
            rows = connection.execute(query, parameters).fetchall()
        return [CorpusCheck(**dict(row)) for row in rows]

    def total(self, repo: str | None = None) -> int:
        with self.database.connect() as connection:
            if repo is None:
                row = connection.execute("SELECT COUNT(*) AS count FROM corpus_checks").fetchone()
            else:
                row = connection.execute(
                    "SELECT COUNT(*) AS count FROM corpus_checks WHERE repo = ?", (repo,)
                ).fetchone()
        assert row is not None
        return int(row["count"])

    def summaries(self) -> list[CorpusSummary]:
        with self.database.connect() as connection:
            rows = connection.execute(
                "SELECT * FROM corpus_checks ORDER BY repo, updated_at DESC, rowid DESC"
            ).fetchall()
        grouped: dict[str, list[CorpusCheck]] = {}
        for row in rows:
            check = CorpusCheck(**dict(row))
            grouped.setdefault(check.repo, []).append(check)
        return [
            CorpusSummary(
                repo=repo,
                corpus_total=len(checks),
                latest_growth=sum(
                    check.last_run_id == checks[0].last_run_id for check in checks
                ),
                last_run_id=checks[0].last_run_id,
                updated_at=checks[0].updated_at,
            )
            for repo, checks in sorted(grouped.items())
        ]


def _canonical_json(value: Any) -> str:
    return json.dumps(value, ensure_ascii=False, separators=(",", ":"), sort_keys=True)
