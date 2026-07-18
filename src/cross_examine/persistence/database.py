"""SQLite connection and schema management."""

from __future__ import annotations

import sqlite3
from collections.abc import Iterator
from contextlib import contextmanager
from pathlib import Path


RUNS_SCHEMA = """
CREATE TABLE IF NOT EXISTS runs (
  id TEXT PRIMARY KEY,
  repo TEXT NOT NULL,
  base_ref TEXT NOT NULL,
  head_ref TEXT NOT NULL,
  status TEXT NOT NULL,
  stage TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  report_json TEXT
);

CREATE TABLE IF NOT EXISTS corpus_checks (
  id TEXT PRIMARY KEY,
  repo TEXT NOT NULL,
  target_symbol TEXT NOT NULL,
  input_json TEXT NOT NULL,
  expected_json TEXT NOT NULL,
  command TEXT NOT NULL,
  output TEXT NOT NULL,
  evidence_hash TEXT NOT NULL DEFAULT '',
  first_run_id TEXT NOT NULL,
  last_run_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS corpus_repo_idx ON corpus_checks(repo);
"""


class Database:
    """Own a SQLite path and initialize its application schema."""

    def __init__(self, path: str | Path) -> None:
        self.path = Path(path)
        self.path.parent.mkdir(parents=True, exist_ok=True)
        with self.connect() as connection:
            connection.executescript(RUNS_SCHEMA)
            columns = {
                row["name"] for row in connection.execute("PRAGMA table_info(corpus_checks)")
            }
            if "evidence_hash" not in columns:
                connection.execute(
                    "ALTER TABLE corpus_checks ADD COLUMN evidence_hash TEXT NOT NULL DEFAULT ''"
                )

    @contextmanager
    def connect(self) -> Iterator[sqlite3.Connection]:
        connection = sqlite3.connect(self.path)
        connection.row_factory = sqlite3.Row
        connection.execute("PRAGMA journal_mode=WAL")
        connection.execute("PRAGMA foreign_keys=ON")
        try:
            yield connection
            connection.commit()
        except BaseException:
            connection.rollback()
            raise
        finally:
            connection.close()
