"""Release check for a packaged local run from outside the checkout."""

from __future__ import annotations

import os
import shutil
import sqlite3
import subprocess
from pathlib import Path

from cross_examine.codec import report_from_json


def test_packaged_hero_runs_from_outside_space_bearing_checkout(tmp_path: Path) -> None:
    uv = shutil.which("uv")
    assert uv is not None
    source_root = Path(__file__).resolve().parents[2]
    project_root = tmp_path / "checkout with spaces"
    project_root.mkdir()
    for filename in ("LICENSE", "pyproject.toml", "uv.lock"):
        shutil.copy2(source_root / filename, project_root / filename)
    shutil.copytree(source_root / "src", project_root / "src")
    outside_cwd = tmp_path / "outside cwd"
    workspace = tmp_path / "demo workspace"
    outside_cwd.mkdir()

    environment = os.environ.copy()
    environment["CROSS_EXAMINE_DEMO_CHARACTERIZER"] = "fixture"
    result = subprocess.run(
        [
            uv,
            "run",
            "--project",
            str(project_root),
            "--isolated",
            "--no-editable",
            "cross-examine",
            "demo",
            "--no-open",
            "--workspace",
            str(workspace),
        ],
        cwd=outside_cwd,
        env=environment,
        capture_output=True,
        text=True,
        check=False,
    )

    assert result.returncode == 0, result.stderr
    assert "Verdict: BROKEN" in result.stdout
    assert "Refuted claim: preserve-empty" in result.stdout
    assert "Reproducing input: []" in result.stdout
    assert "cross_examine.cross_examine.probe_runner" in result.stdout

    database = sqlite3.connect(workspace / "cross-examine.db")
    raw_report = database.execute(
        "select report_json from runs where status='complete' order by created_at desc limit 1"
    ).fetchone()[0]
    report = report_from_json(raw_report)
    grounded = [
        finding
        for finding in report.findings
        if finding.outcome.value in {"verified", "refuted"}
    ]
    assert grounded
    assert all(finding.command and finding.output for finding in grounded)
