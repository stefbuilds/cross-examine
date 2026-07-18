from __future__ import annotations

import os
import subprocess
import sys
import time
from pathlib import Path

import pytest

from cross_examine import execution
from cross_examine.execution import (
    BoundedHostProcessRunner,
    CommandNotAllowedError,
    ExecutionPolicy,
    PolicyValidationError,
    capability_report,
    render_command,
    run_command,
)
from cross_examine.settings import MAX_OUTPUT_BYTES
from cross_examine.schema import evidence_hash


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
    assert evidence.receipt is not None
    assert evidence.receipt.command == evidence.command
    assert evidence.receipt.output == evidence.output
    assert evidence.receipt.evidence_hash == evidence_hash(evidence.command, evidence.output)


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


@pytest.mark.skipif(os.name == "nt", reason="process-group assertion is POSIX-specific")
def test_timeout_terminates_spawned_children(tmp_path: Path) -> None:
    child_pid = tmp_path / "child.pid"
    program = (
        "import pathlib, subprocess, sys, time; "
        "child = subprocess.Popen([sys.executable, '-c', 'import time; time.sleep(30)']); "
        f"pathlib.Path({str(child_pid)!r}).write_text(str(child.pid)); time.sleep(30)"
    )

    evidence = run_command([sys.executable, "-c", program], cwd=tmp_path, timeout=2.0)

    assert evidence.timed_out is True
    deadline = time.monotonic() + 2
    while not child_pid.exists() and time.monotonic() < deadline:
        time.sleep(0.01)
    pid = int(child_pid.read_text())
    while time.monotonic() < deadline:
        try:
            os.kill(pid, 0)
        except ProcessLookupError:
            break
        time.sleep(0.01)
    else:
        pytest.fail("spawned child survived the process-tree cleanup")


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


def test_explicit_policy_rejects_executables_and_cwds_outside_its_boundary(
    tmp_path: Path,
) -> None:
    policy = ExecutionPolicy(
        version="test-v1",
        wall_clock_seconds=1,
        output_limit_bytes=1024,
        allowed_executables=frozenset({Path(sys.executable).name}),
        environment_allowlist=frozenset({"PATH"}),
        working_directory_roots=(tmp_path,),
    )

    with pytest.raises(CommandNotAllowedError):
        run_command(["git", "status"], cwd=tmp_path, policy=policy)
    with pytest.raises(CommandNotAllowedError):
        run_command([sys.executable, "-c", "pass"], cwd=tmp_path.parent, policy=policy)


@pytest.mark.parametrize(
    "kwargs",
    [
        {"wall_clock_seconds": 0},
        {"output_limit_bytes": 0},
        {"allowed_executables": frozenset()},
        {"environment_allowlist": frozenset({"OPENAI_API_KEY"})},
        {"working_directory_roots": ()},
    ],
)
def test_policy_validation_fails_closed_for_unsafe_or_contradictory_values(
    tmp_path: Path, kwargs: dict[str, object]
) -> None:
    values: dict[str, object] = {
        "version": "test-v1",
        "wall_clock_seconds": 1,
        "output_limit_bytes": 1024,
        "allowed_executables": frozenset({Path(sys.executable).name}),
        "environment_allowlist": frozenset({"PATH"}),
        "working_directory_roots": (tmp_path,),
    }
    values.update(kwargs)

    with pytest.raises(PolicyValidationError):
        ExecutionPolicy(**values)  # type: ignore[arg-type]


def test_manifest_is_a_redacted_auditable_receipt(tmp_path: Path) -> None:
    secret = "manifest-secret-value"
    policy = ExecutionPolicy(
        version="audit-v1",
        wall_clock_seconds=1,
        output_limit_bytes=4096,
        allowed_executables=frozenset({Path(sys.executable).name}),
        environment_allowlist=frozenset({"PATH"}),
        working_directory_roots=(tmp_path,),
    )

    evidence = run_command(
        [sys.executable, "-c", f"print('{secret}')"],
        cwd=tmp_path,
        env={"OPENAI_API_KEY": secret},
        policy=policy,
    )

    assert evidence.manifest is not None
    assert evidence.manifest.policy_version == "audit-v1"
    assert evidence.manifest.argv_digest
    assert evidence.manifest.rendered_argv == evidence.command
    assert evidence.manifest.cwd_identity.path == str(tmp_path.resolve())
    assert evidence.manifest.executable_identity.resolved_path
    assert evidence.manifest.redaction_applied is True
    assert secret not in evidence.manifest.rendered_argv
    assert secret not in evidence.output


def test_manifest_stable_fields_are_deterministic(tmp_path: Path) -> None:
    policy = ExecutionPolicy.default_for(tmp_path)
    runner = BoundedHostProcessRunner()
    argv = [sys.executable, "-c", "print('ok')"]

    first = runner.run(argv, cwd=tmp_path, policy=policy).manifest
    second = runner.run(argv, cwd=tmp_path, policy=policy).manifest

    assert first is not None and second is not None
    assert first.stable_identity() == second.stable_identity()


def test_host_runner_capabilities_do_not_claim_sandboxing() -> None:
    report = capability_report()

    assert report.adapter == "bounded-host-process"
    assert report.controls["filesystem_isolation"].status == "not_supported"
    assert report.controls["network_isolation"].status == "not_supported"
    assert report.controls["process_tree_cleanup"].status in {"enforced", "best_effort"}
