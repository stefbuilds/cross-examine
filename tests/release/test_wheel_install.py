"""Judge-facing smoke test for the distributable wheel."""

from __future__ import annotations

import os
import shutil
import subprocess
from pathlib import Path

import pytest


RELEASE_SUBPROCESS_TIMEOUT_SECONDS = 300
ISOLATION_VARIABLES = (
    "OPENAI_API_KEY",
    "CROSS_EXAMINE_DB",
    "CROSS_EXAMINE_RUNS",
    "PYTHONHOME",
    "PYTHONPATH",
    "VIRTUAL_ENV",
    "UV_PROJECT_ENVIRONMENT",
)


def _offline_release_environment() -> dict[str, str]:
    environment = os.environ.copy()
    for variable in ISOLATION_VARIABLES:
        environment.pop(variable, None)
    environment["CROSS_EXAMINE_DEMO_CHARACTERIZER"] = "fixture"
    environment["PYTHONNOUSERSITE"] = "1"
    return environment


def _run(
    argv: list[str], *, cwd: Path, env: dict[str, str] | None = None
) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        argv,
        cwd=cwd,
        env=env,
        capture_output=True,
        text=True,
        check=False,
        timeout=RELEASE_SUBPROCESS_TIMEOUT_SECONDS,
    )


def test_wheel_installs_and_runs_the_offline_hero(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    uv = shutil.which("uv")
    assert uv is not None
    project_root = Path(__file__).resolve().parents[2]
    wheel_dir = tmp_path / "wheel"
    environment = tmp_path / "judge-environment"
    demo_workspace = tmp_path / "demo"
    operator_database = tmp_path / "operator-state" / "cross-examine.db"
    operator_runs = tmp_path / "operator-state" / "runs"
    monkeypatch.setenv("OPENAI_API_KEY", "must-not-be-used")
    monkeypatch.setenv("CROSS_EXAMINE_DEMO_CHARACTERIZER", "fixture")
    monkeypatch.setenv("CROSS_EXAMINE_DB", str(operator_database))
    monkeypatch.setenv("CROSS_EXAMINE_RUNS", str(operator_runs))

    build = _run(
        [uv, "build", "--wheel", "--out-dir", str(wheel_dir)],
        cwd=project_root,
        env=_offline_release_environment(),
    )
    assert build.returncode == 0, build.stderr
    wheel = next(wheel_dir.glob("cross_examine-*.whl"))

    create = _run(
        [uv, "venv", "--python", "3.12", str(environment)],
        cwd=tmp_path,
        env=_offline_release_environment(),
    )
    assert create.returncode == 0, create.stderr
    python = environment / ("Scripts/python.exe" if os.name == "nt" else "bin/python")

    install = _run(
        [uv, "pip", "install", "--python", str(python), str(wheel)],
        cwd=tmp_path,
        env=_offline_release_environment(),
    )
    assert install.returncode == 0, install.stderr

    poison_pythonpath = tmp_path / "operator-pythonpath"
    poison_package = poison_pythonpath / "cross_examine"
    poison_package.mkdir(parents=True)
    (poison_package / "__init__.py").write_text(
        "raise RuntimeError('ambient PYTHONPATH reached installed smoke')\n",
        encoding="utf-8",
    )
    monkeypatch.setenv("PYTHONPATH", str(poison_pythonpath))
    monkeypatch.setenv("PYTHONHOME", str(tmp_path / "operator-python-home"))
    monkeypatch.setenv("VIRTUAL_ENV", str(tmp_path / "operator-virtualenv"))
    monkeypatch.setenv("UV_PROJECT_ENVIRONMENT", str(tmp_path / "operator-uv-environment"))
    imported = _run(
        [
            str(python),
            "-c",
            "import cross_examine.cli, cross_examine.cross_examine.probe_runner",
        ],
        cwd=tmp_path,
        env=_offline_release_environment(),
    )
    assert imported.returncode == 0, imported.stderr

    demo = _run(
        [
            str(python),
            "-m",
            "cross_examine.cli",
            "demo",
            "--no-open",
            "--workspace",
            str(demo_workspace),
        ],
        cwd=tmp_path,
        env=_offline_release_environment(),
    )
    assert demo.returncode == 0, demo.stderr
    assert "Verdict: BROKEN" in demo.stdout
    assert "Refuted claim: preserve-empty" in demo.stdout
    assert "Reproducing input: []" in demo.stdout
    assert (demo_workspace / "cross-examine.db").is_file()
    assert (demo_workspace / "runs").is_dir()
    assert not operator_database.exists()
    assert not operator_runs.exists()
