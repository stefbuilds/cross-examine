from __future__ import annotations

import os
import subprocess
import sys
import time
from pathlib import Path

import pytest

from cross_examine import execution
from cross_examine.execution import CommandNotAllowedError, render_command, run_command
from cross_examine.settings import MAX_OUTPUT_BYTES


@pytest.mark.parametrize("executable", ["cmd.exe", "sh"])
def test_shell_executables_are_rejected(executable: str, tmp_path: Path) -> None:
    with pytest.raises(CommandNotAllowedError):
        run_command([executable, "-c", "echo unsafe"], cwd=tmp_path)


def test_command_and_output_are_captured_exactly(tmp_path: Path) -> None:
    argv = [sys.executable, "-c", "print('ok')"]

    evidence = run_command(argv, cwd=tmp_path)

    assert evidence.command == render_command(argv)
    assert evidence.exit_code == 0
    assert evidence.stdout == "ok\n"
    assert evidence.stderr == ""
    assert evidence.timed_out is False
    assert evidence.output_truncated is False


def test_child_stdio_is_utf8_for_adversarial_unicode(tmp_path: Path) -> None:
    evidence = run_command(
        [sys.executable, "-c", "print(chr(128))"],
        cwd=tmp_path,
    )

    assert evidence.exit_code == 0
    assert evidence.stdout == "\x80\n"
    assert evidence.stderr == ""


def test_target_code_cannot_read_ambient_api_keys(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setenv("OPENAI_API_KEY", "operator-secret-value")

    evidence = run_command(
        [
            sys.executable,
            "-c",
            "import os; print(os.environ.get('OPENAI_API_KEY', 'absent'))",
        ],
        cwd=tmp_path,
    )

    assert evidence.exit_code == 0
    assert evidence.stdout == "absent\n"


def test_timeout_terminates_the_process(tmp_path: Path) -> None:
    evidence = run_command(
        [sys.executable, "-c", "import time; time.sleep(10)"],
        cwd=tmp_path,
        timeout=0.2,
    )

    assert evidence.timed_out is True
    assert evidence.exit_code is not None


def test_run_deadline_caps_a_larger_command_timeout(tmp_path: Path) -> None:
    started = time.monotonic()
    evidence = run_command(
        [sys.executable, "-c", "import time; time.sleep(2)"],
        cwd=tmp_path,
        timeout=5,
        deadline=started + 0.2,
    )

    assert evidence.timed_out is True
    assert evidence.duration_seconds < 1
    assert evidence.duration_seconds < 5


def test_output_beyond_two_megabytes_is_capped_and_terminated(tmp_path: Path) -> None:
    evidence = run_command(
        [sys.executable, "-c", f"print('x' * {MAX_OUTPUT_BYTES + 8192})"],
        cwd=tmp_path,
        timeout=10,
    )

    assert evidence.output_truncated is True
    assert len(evidence.stdout.encode("utf-8")) <= MAX_OUTPUT_BYTES
    assert "[OUTPUT TRUNCATED: limit exceeded]" in evidence.stderr


@pytest.mark.skipif(os.name == "nt", reason="POSIX process-group fallback")
def test_process_tree_termination_falls_back_when_group_kill_is_denied(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    process = subprocess.Popen(
        [sys.executable, "-c", "import time; time.sleep(10)"],
        start_new_session=True,
    )

    def deny_group_kill(_process_group: int, _signal: int) -> None:
        raise PermissionError("process group is unavailable")

    monkeypatch.setattr(os, "killpg", deny_group_kill)
    try:
        execution._terminate_process_tree(process)
        process.wait(timeout=2)
    finally:
        if process.poll() is None:
            process.kill()
            process.wait(timeout=2)

    assert process.returncode is not None


def test_sensitive_environment_values_are_redacted(tmp_path: Path) -> None:
    secret = "sk-test-secret-value"
    evidence = run_command(
        [
            sys.executable,
            "-c",
            "import os; print(os.environ.get('OPENAI_API_KEY', 'absent'))",
        ],
        cwd=tmp_path,
        env={"OPENAI_API_KEY": secret, "PATH": os.environ.get("PATH", "")},
    )

    assert secret not in evidence.output
    assert evidence.stdout == "absent\n"
