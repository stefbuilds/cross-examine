"""Judge-facing smoke test for the distributable wheel."""

from __future__ import annotations

import os
import shutil
import subprocess
from pathlib import Path


def _run(argv: list[str], *, cwd: Path) -> subprocess.CompletedProcess[str]:
    return subprocess.run(argv, cwd=cwd, capture_output=True, text=True, check=False)


def test_wheel_installs_and_runs_the_offline_hero(tmp_path: Path) -> None:
    uv = shutil.which("uv")
    assert uv is not None
    project_root = Path(__file__).resolve().parents[2]
    wheel_dir = tmp_path / "wheel"
    environment = tmp_path / "judge-environment"

    build = _run(
        [uv, "build", "--wheel", "--out-dir", str(wheel_dir)],
        cwd=project_root,
    )
    assert build.returncode == 0, build.stderr
    wheel = next(wheel_dir.glob("cross_examine-*.whl"))

    create = _run([uv, "venv", "--python", "3.12", str(environment)], cwd=tmp_path)
    assert create.returncode == 0, create.stderr
    python = environment / ("Scripts/python.exe" if os.name == "nt" else "bin/python")

    install = _run(
        [uv, "pip", "install", "--python", str(python), str(wheel)],
        cwd=tmp_path,
    )
    assert install.returncode == 0, install.stderr

    imported = _run(
        [
            str(python),
            "-c",
            "import cross_examine.cli, cross_examine.cross_examine.probe_runner",
        ],
        cwd=tmp_path,
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
            str(tmp_path / "demo"),
        ],
        cwd=tmp_path,
    )
    assert demo.returncode == 0, demo.stderr
    assert "Verdict: BROKEN" in demo.stdout
    assert "Refuted claim: preserve-empty" in demo.stdout
    assert "Reproducing input: []" in demo.stdout
