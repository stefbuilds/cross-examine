from __future__ import annotations

import json
import os
import socket
import subprocess
import sys
import time
from pathlib import Path
from urllib.request import urlopen

import pytest

ROOT = Path(__file__).parents[2]
DEMO_TIMEOUT_SECONDS = 120


def command(*arguments: str) -> list[str]:
    return [sys.executable, "-m", "cross_examine.cli", *arguments]


def test_cli_help_lists_all_product_commands() -> None:
    result = subprocess.run(command("--help"), cwd=ROOT, capture_output=True, text=True)

    assert result.returncode == 0, result.stderr
    assert "serve" in result.stdout
    assert "run" in result.stdout
    assert "demo" in result.stdout


def test_hero_builder_produces_stable_base_and_head_refs(tmp_path: Path) -> None:
    outputs: list[dict[str, str]] = []
    for name in ("first", "second"):
        result = subprocess.run(
            [sys.executable, "scripts/build_hero_repo.py", str(tmp_path / name)],
            cwd=ROOT,
            capture_output=True,
            text=True,
        )
        assert result.returncode == 0, result.stderr
        outputs.append(json.loads(result.stdout))

    assert outputs[0]["base"] == outputs[1]["base"]
    assert outputs[0]["head"] == outputs[1]["head"]
    assert outputs[0]["base"] != outputs[0]["head"]
    tagged_base = subprocess.run(
        ["git", "-C", outputs[0]["repo"], "rev-parse", "hero-base"],
        check=True,
        capture_output=True,
        text=True,
    ).stdout.strip()
    assert tagged_base == outputs[0]["base"]


def test_demo_exits_zero_and_prints_the_grounded_catch(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    operator_database = tmp_path / "operator-state" / "cross-examine.db"
    operator_runs = tmp_path / "operator-state" / "runs"
    workspace = tmp_path / "demo-workspace"
    monkeypatch.setenv("OPENAI_API_KEY", "must-not-be-used")
    monkeypatch.setenv("CROSS_EXAMINE_DB", str(operator_database))
    monkeypatch.setenv("CROSS_EXAMINE_RUNS", str(operator_runs))
    environment = os.environ.copy()
    for variable in ("OPENAI_API_KEY", "CROSS_EXAMINE_DB", "CROSS_EXAMINE_RUNS"):
        environment.pop(variable, None)
    environment["CROSS_EXAMINE_DEMO_CHARACTERIZER"] = "fixture"
    result = subprocess.run(
        command("demo", "--no-open", "--workspace", str(workspace)),
        cwd=ROOT,
        capture_output=True,
        text=True,
        timeout=DEMO_TIMEOUT_SECONDS,
        env=environment,
    )

    assert result.returncode == 0, result.stderr
    assert "Verdict: BROKEN" in result.stdout
    assert "http://127.0.0.1:8765/runs/" in result.stdout
    assert "Reproducing input: []" in result.stdout
    assert "Characterization: deterministic hero fixture" in result.stdout
    assert "Corpus: +2 this run · 2 total" in result.stdout

    rerun = subprocess.run(
        command("demo", "--no-open", "--workspace", str(workspace)),
        cwd=ROOT,
        capture_output=True,
        text=True,
        timeout=DEMO_TIMEOUT_SECONDS,
        env=environment,
    )
    assert rerun.returncode == 0, rerun.stderr
    assert "Corpus: +0 this run · 2 total" in rerun.stdout
    assert (workspace / "cross-examine.db").is_file()
    assert (workspace / "runs").is_dir()
    assert not operator_database.exists()
    assert not operator_runs.exists()


def test_serve_starts_health_endpoint_on_requested_port(tmp_path: Path) -> None:
    with socket.socket() as listener:
        listener.bind(("127.0.0.1", 0))
        port = listener.getsockname()[1]

    environment = {
        **os.environ,
        "CROSS_EXAMINE_DB": str(tmp_path / "serve.db"),
        "CROSS_EXAMINE_RUNS": str(tmp_path / "runs"),
    }
    process = subprocess.Popen(
        command("serve", "--host", "127.0.0.1", "--port", str(port), "--no-open"),
        cwd=ROOT,
        env=environment,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
    )
    try:
        startup_timeout_seconds = 60
        startup_deadline = time.monotonic() + startup_timeout_seconds
        while time.monotonic() < startup_deadline:
            try:
                with urlopen(f"http://127.0.0.1:{port}/api/health", timeout=0.2) as response:
                    assert json.load(response) == {"status": "ok"}
                    break
            except OSError:
                if process.poll() is not None:
                    stdout, stderr = process.communicate()
                    raise AssertionError(f"serve exited early\n{stdout}\n{stderr}")
                time.sleep(0.05)
        else:
            raise AssertionError(
                f"serve did not become healthy within {startup_timeout_seconds} seconds"
            )
    finally:
        process.terminate()
        try:
            process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            process.kill()
            process.wait(timeout=5)
