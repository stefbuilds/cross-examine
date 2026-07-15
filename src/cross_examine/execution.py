"""The single subprocess boundary for repository and test execution."""

from __future__ import annotations

import os
import re
import shlex
import signal
import subprocess
import sys
import threading
import time
from collections.abc import Mapping, Sequence
from pathlib import Path
from typing import TextIO

from cross_examine.schema import CommandEvidence
from cross_examine.settings import (
    DEFAULT_COMMAND_TIMEOUT_SECONDS,
    MAX_OUTPUT_BYTES,
    PROCESS_POLL_SECONDS,
    READER_CHUNK_SIZE,
)

_SENSITIVE_ENV_NAME = re.compile(
    r"(?:api[_-]?key|token|secret|password|passwd|credential)", re.IGNORECASE
)
_INHERITED_ENV_ALLOWLIST = {
    "COMSPEC",
    "LANG",
    "LC_ALL",
    "LC_CTYPE",
    "PATH",
    "PATHEXT",
    "SYSTEMROOT",
    "TEMP",
    "TMP",
    "TMPDIR",
    "WINDIR",
}
_TRUNCATION_NOTICE = "[OUTPUT TRUNCATED: limit exceeded]"


class CommandNotAllowedError(ValueError):
    """Raised when an argv list tries to cross the executable allowlist."""


class RunDeadlineExceeded(TimeoutError):
    """Raised when a run has no remaining execution budget."""


def render_command(argv: Sequence[str]) -> str:
    """Render the exact argv in the platform's conventional command syntax."""

    values = [str(value) for value in argv]
    return subprocess.list2cmdline(values) if os.name == "nt" else shlex.join(values)


def run_command(
    argv: Sequence[str],
    *,
    cwd: str | Path,
    timeout: float = DEFAULT_COMMAND_TIMEOUT_SECONDS,
    deadline: float | None = None,
    env: Mapping[str, str] | None = None,
    output_limit_bytes: int = MAX_OUTPUT_BYTES,
) -> CommandEvidence:
    """Run one allowlisted argv list and return bounded, redacted evidence."""

    command_argv = [str(value) for value in argv]
    _validate_command(command_argv)
    if timeout <= 0:
        raise ValueError("timeout must be positive")
    if deadline is not None:
        remaining = deadline - time.monotonic()
        if remaining <= 0:
            raise RunDeadlineExceeded("Total run deadline exceeded")
        timeout = min(timeout, remaining)
    if output_limit_bytes <= 0:
        raise ValueError("output_limit_bytes must be positive")

    redaction_environment = os.environ.copy()
    if env is not None:
        redaction_environment.update({str(key): str(value) for key, value in env.items()})
    secrets = _secret_values(redaction_environment)

    child_env = {
        key: value
        for key, value in os.environ.items()
        if key.upper() in _INHERITED_ENV_ALLOWLIST
    }
    if env is not None:
        child_env.update(
            {
                str(key): str(value)
                for key, value in env.items()
                if not _SENSITIVE_ENV_NAME.search(str(key))
            }
        )
    child_env["PYTHONIOENCODING"] = "utf-8"
    child_env["PYTHONUTF8"] = "1"

    creation_flags = subprocess.CREATE_NEW_PROCESS_GROUP if os.name == "nt" else 0
    started = time.monotonic()
    # hackathon: trusted-input sandbox; prod needs real isolation
    process = subprocess.Popen(
        command_argv,
        cwd=Path(cwd),
        env=child_env,
        shell=False,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        encoding="utf-8",
        errors="replace",
        creationflags=creation_flags,
        start_new_session=os.name != "nt",
    )
    assert process.stdout is not None
    assert process.stderr is not None

    lock = threading.Lock()
    limit_reached = threading.Event()
    byte_count = [0]
    stdout_chunks: list[str] = []
    stderr_chunks: list[str] = []
    readers = [
        threading.Thread(
            target=_read_bounded,
            args=(
                process.stdout,
                stdout_chunks,
                byte_count,
                lock,
                limit_reached,
                output_limit_bytes,
            ),
            daemon=True,
        ),
        threading.Thread(
            target=_read_bounded,
            args=(
                process.stderr,
                stderr_chunks,
                byte_count,
                lock,
                limit_reached,
                output_limit_bytes,
            ),
            daemon=True,
        ),
    ]
    for reader in readers:
        reader.start()

    deadline = started + timeout
    timed_out = False
    terminated_for_output = False
    while process.poll() is None:
        if limit_reached.is_set():
            terminated_for_output = True
            _terminate_process_tree(process)
            break
        if time.monotonic() >= deadline:
            timed_out = True
            _terminate_process_tree(process)
            break
        time.sleep(PROCESS_POLL_SECONDS)

    _wait_for_exit(process)
    for reader in readers:
        reader.join(timeout=2)

    output_truncated = terminated_for_output or limit_reached.is_set()
    stdout = _redact("".join(stdout_chunks), secrets)
    stderr = _redact("".join(stderr_chunks), secrets)
    if output_truncated:
        stderr = f"{stderr.rstrip()}\n{_TRUNCATION_NOTICE}\n".lstrip("\n")

    return CommandEvidence(
        command=_redact(render_command(command_argv), secrets),
        exit_code=process.returncode,
        stdout=stdout,
        stderr=stderr,
        duration_seconds=time.monotonic() - started,
        timed_out=timed_out,
        output_truncated=output_truncated,
    )


def _validate_command(argv: Sequence[str]) -> None:
    if not argv or not argv[0].strip():
        raise CommandNotAllowedError("An executable is required")
    executable = Path(argv[0]).name.casefold()
    allowed = {
        "git",
        "git.exe",
        "python",
        "python.exe",
        Path(sys.executable).name.casefold(),
    }
    if executable not in allowed:
        raise CommandNotAllowedError(f"Executable is not allowlisted: {executable}")


def _read_bounded(
    stream: TextIO,
    chunks: list[str],
    byte_count: list[int],
    lock: threading.Lock,
    limit_reached: threading.Event,
    output_limit_bytes: int,
) -> None:
    while chunk := stream.read(READER_CHUNK_SIZE):
        encoded = chunk.encode("utf-8", errors="replace")
        with lock:
            remaining = output_limit_bytes - byte_count[0]
            if remaining <= 0:
                limit_reached.set()
                continue
            if len(encoded) > remaining:
                chunks.append(encoded[:remaining].decode("utf-8", errors="ignore"))
                byte_count[0] = output_limit_bytes
                limit_reached.set()
                continue
            chunks.append(chunk)
            byte_count[0] += len(encoded)


def _secret_values(environment: Mapping[str, str]) -> tuple[str, ...]:
    values = {
        value
        for key, value in environment.items()
        if value and len(value) >= 4 and _SENSITIVE_ENV_NAME.search(key)
    }
    return tuple(sorted(values, key=len, reverse=True))


def _redact(value: str, secrets: Sequence[str]) -> str:
    redacted = value
    for secret in secrets:
        redacted = redacted.replace(secret, "[REDACTED]")
    return redacted


def _terminate_process_tree(process: subprocess.Popen[str]) -> None:
    if process.poll() is not None:
        return
    if os.name == "nt":
        subprocess.run(
            ["taskkill", "/PID", str(process.pid), "/T", "/F"],
            check=False,
            capture_output=True,
            creationflags=subprocess.CREATE_NO_WINDOW,
        )
        if process.poll() is None:
            process.kill()
        return
    try:
        os.killpg(process.pid, signal.SIGKILL)
    except ProcessLookupError:
        pass
    except PermissionError:
        # macOS can deny a process-group signal while the owned child is
        # concurrently exiting. Fall back to the child handle so the output
        # cap and timeout still have deterministic termination semantics.
        if process.poll() is None:
            try:
                process.kill()
            except ProcessLookupError:
                pass


def _wait_for_exit(process: subprocess.Popen[str]) -> None:
    try:
        process.wait(timeout=2)
    except subprocess.TimeoutExpired:
        process.kill()
        process.wait(timeout=2)
