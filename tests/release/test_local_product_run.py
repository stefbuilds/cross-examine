"""Release check for a packaged local run from outside the checkout."""

from __future__ import annotations

import os
import shutil
import sqlite3
import subprocess
from pathlib import Path

import pytest

from cross_examine.codec import report_from_json


RELEASE_SUBPROCESS_TIMEOUT_SECONDS = 300


def test_packaged_hero_runs_from_outside_space_bearing_checkout(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
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
    operator_database = tmp_path / "operator-state" / "cross-examine.db"
    operator_runs = tmp_path / "operator-state" / "runs"
    outside_cwd.mkdir()

    monkeypatch.setenv("OPENAI_API_KEY", "must-not-be-used")
    monkeypatch.setenv("CROSS_EXAMINE_DB", str(operator_database))
    monkeypatch.setenv("CROSS_EXAMINE_RUNS", str(operator_runs))
    poison_pythonpath = tmp_path / "operator-pythonpath"
    poison_package = poison_pythonpath / "cross_examine"
    poison_package.mkdir(parents=True)
    (poison_package / "__init__.py").write_text(
        "raise RuntimeError('ambient PYTHONPATH reached packaged smoke')\n",
        encoding="utf-8",
    )
    monkeypatch.setenv("PYTHONPATH", str(poison_pythonpath))
    monkeypatch.setenv("PYTHONHOME", str(tmp_path / "operator-python-home"))
    monkeypatch.setenv("VIRTUAL_ENV", str(tmp_path / "operator-virtualenv"))
    monkeypatch.setenv("UV_PROJECT_ENVIRONMENT", str(tmp_path / "operator-uv-environment"))
    environment = os.environ.copy()
    for variable in (
        "OPENAI_API_KEY",
        "CROSS_EXAMINE_DB",
        "CROSS_EXAMINE_RUNS",
        "PYTHONHOME",
        "PYTHONPATH",
        "VIRTUAL_ENV",
        "UV_PROJECT_ENVIRONMENT",
    ):
        environment.pop(variable, None)
    environment["CROSS_EXAMINE_DEMO_CHARACTERIZER"] = "fixture"
    environment["PYTHONNOUSERSITE"] = "1"
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
        timeout=RELEASE_SUBPROCESS_TIMEOUT_SECONDS,
    )

    assert result.returncode == 0, result.stderr
    assert "Verdict: BROKEN" in result.stdout
    assert "Refuted claim: preserve-empty" in result.stdout
    assert "Reproducing input: []" in result.stdout
    assert "cross_examine.cross_examine.probe_runner" in result.stdout
    assert not operator_database.exists()
    assert not operator_runs.exists()

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
