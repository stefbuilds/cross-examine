"""Auditable bounded host-process execution.

This module is intentionally *not* a sandbox.  ``BoundedHostProcessRunner``
executes trusted repository code on the operator's host with a narrow command
and environment boundary.  A container or VM runner can implement
``ExecutionRunner`` later without changing callers.
"""

from __future__ import annotations

import hashlib
import json
import math
import os
import platform
import re
import shlex
import shutil
import signal
import subprocess
import sys
import threading
import time
from collections.abc import Mapping, Sequence
from dataclasses import dataclass
from pathlib import Path
from typing import Protocol, TextIO

from cross_examine.schema import (
    CommandEvidence,
    CwdIdentity,
    ExecutableIdentity,
    ExecutionManifest,
    EvidenceReceipt,
    evidence_hash,
)
from cross_examine.settings import (
    DEFAULT_COMMAND_TIMEOUT_SECONDS,
    DEFAULT_EXECUTION_POLICY_VERSION,
    MAX_OUTPUT_BYTES,
    PROCESS_POLL_SECONDS,
    READER_CHUNK_SIZE,
)

_SENSITIVE_ENV_NAME = re.compile(r"(?:api[_-]?key|token|secret|password|passwd|credential)", re.I)
_DEFAULT_ENV_ALLOWLIST = frozenset(
    {
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
        "PYTHONPATH",
        "GIT_TERMINAL_PROMPT",
        "CROSS_EXAMINE_WORKTREE",
    }
)
_TRUNCATION_NOTICE = "[OUTPUT TRUNCATED: limit exceeded]"


class CommandNotAllowedError(ValueError):
    """Raised when a command violates an execution policy."""


class PolicyValidationError(ValueError):
    """Raised when an execution policy would weaken a required boundary."""


class RunDeadlineExceeded(TimeoutError):
    """Raised when a run has no remaining execution budget."""


@dataclass(frozen=True)
class ExecutionPolicy:
    """Explicit, fail-closed limits for one execution boundary."""

    version: str
    wall_clock_seconds: float
    output_limit_bytes: int
    allowed_executables: frozenset[str]
    environment_allowlist: frozenset[str]
    working_directory_roots: tuple[Path, ...]

    def __post_init__(self) -> None:
        if not self.version or not self.version.strip():
            raise PolicyValidationError("policy version is required")
        if not math.isfinite(self.wall_clock_seconds) or self.wall_clock_seconds <= 0:
            raise PolicyValidationError("wall_clock_seconds must be finite and positive")
        if self.output_limit_bytes <= 0:
            raise PolicyValidationError("output_limit_bytes must be positive")
        if not self.allowed_executables:
            raise PolicyValidationError("at least one executable must be allowed")
        normalized_executables = frozenset(
            _normalize_executable(value) for value in self.allowed_executables
        )
        if any(not value for value in normalized_executables):
            raise PolicyValidationError("executable names must be non-empty basenames")
        if any(not _valid_environment_name(name) for name in self.environment_allowlist):
            raise PolicyValidationError("environment allowlist contains an invalid name")
        if any(_SENSITIVE_ENV_NAME.search(name) for name in self.environment_allowlist):
            raise PolicyValidationError("environment allowlist must not permit secret-shaped names")
        if not self.working_directory_roots:
            raise PolicyValidationError("at least one working-directory root is required")
        roots = tuple(
            sorted({Path(root).resolve() for root in self.working_directory_roots}, key=str)
        )
        if any(not root.is_dir() for root in roots):
            raise PolicyValidationError("working-directory roots must exist and be directories")
        object.__setattr__(self, "allowed_executables", normalized_executables)
        object.__setattr__(self, "environment_allowlist", frozenset(self.environment_allowlist))
        object.__setattr__(self, "working_directory_roots", roots)

    @classmethod
    def default_for(cls, cwd: str | Path) -> "ExecutionPolicy":
        """Compatibility policy: retain old safe defaults for this cwd only."""

        return cls(
            version=DEFAULT_EXECUTION_POLICY_VERSION,
            wall_clock_seconds=DEFAULT_COMMAND_TIMEOUT_SECONDS,
            output_limit_bytes=MAX_OUTPUT_BYTES,
            allowed_executables=frozenset(
                {"git", "git.exe", "python", "python.exe", Path(sys.executable).name}
            ),
            environment_allowlist=_DEFAULT_ENV_ALLOWLIST,
            working_directory_roots=(Path(cwd),),
        )

    @property
    def identity(self) -> str:
        payload = {
            "version": self.version,
            "wall_clock_seconds": self.wall_clock_seconds,
            "output_limit_bytes": self.output_limit_bytes,
            "allowed_executables": sorted(self.allowed_executables),
            "environment_allowlist": sorted(self.environment_allowlist),
            "working_directory_roots": [str(path) for path in self.working_directory_roots],
        }
        return _digest(json.dumps(payload, sort_keys=True, separators=(",", ":")))


@dataclass(frozen=True)
class ControlCapability:
    status: str  # enforced | best_effort | not_supported
    detail: str


@dataclass(frozen=True)
class CapabilityReport:
    adapter: str
    controls: Mapping[str, ControlCapability]


def capability_report() -> CapabilityReport:
    """Describe host-execution capabilities without implying isolation."""

    return CapabilityReport(
        "bounded-host-process",
        {
            "argv_without_shell": ControlCapability("enforced", "argv is passed with shell=False"),
            "executable_allowlist": ControlCapability(
                "enforced", "policy validates executable basenames"
            ),
            "environment_allowlist": ControlCapability(
                "enforced", "child receives only allowed non-secret names"
            ),
            "working_directory_boundary": ControlCapability(
                "enforced", "cwd must resolve below a policy root"
            ),
            "wall_clock_deadline": ControlCapability(
                "enforced", "runner terminates after the effective deadline"
            ),
            "output_limit": ControlCapability(
                "enforced", "combined stdout/stderr cap terminates the process"
            ),
            "process_tree_cleanup": ControlCapability(
                "best_effort",
                "POSIX process-group kill can fall back to the direct child; Windows uses taskkill",
            ),
            "filesystem_isolation": ControlCapability(
                "not_supported", "child shares the host filesystem permissions"
            ),
            "network_isolation": ControlCapability(
                "not_supported", "child retains host network access"
            ),
            "cpu_memory_quotas": ControlCapability(
                "not_supported", "no cgroup/job-object resource limits"
            ),
            "syscall_containment": ControlCapability(
                "not_supported", "no container, VM, or syscall filter"
            ),
        },
    )


class ExecutionRunner(Protocol):
    def run(
        self,
        argv: Sequence[str],
        *,
        cwd: str | Path,
        policy: ExecutionPolicy,
        deadline: float | None = None,
        env: Mapping[str, str] | None = None,
    ) -> CommandEvidence: ...


def render_command(argv: Sequence[str]) -> str:
    values = [str(value) for value in argv]
    return subprocess.list2cmdline(values) if os.name == "nt" else shlex.join(values)


class BoundedHostProcessRunner:
    """Bounded trusted-input host-process adapter; this is not a sandbox."""

    name = "bounded-host-process"

    def run(
        self,
        argv: Sequence[str],
        *,
        cwd: str | Path,
        policy: ExecutionPolicy,
        deadline: float | None = None,
        env: Mapping[str, str] | None = None,
    ) -> CommandEvidence:
        command_argv = [str(value) for value in argv]
        cwd_path = _validate_request(command_argv, Path(cwd), policy, env)
        timeout = policy.wall_clock_seconds
        if deadline is not None:
            remaining = deadline - time.monotonic()
            if remaining <= 0:
                raise RunDeadlineExceeded("Total run deadline exceeded")
            timeout = min(timeout, remaining)
        supplied_env = {str(key): str(value) for key, value in (env or {}).items()}
        redaction_environment = dict(os.environ)
        redaction_environment.update(supplied_env)
        secrets = _secret_values(redaction_environment)
        child_env = _child_environment(policy, supplied_env)
        started = time.monotonic()
        process = subprocess.Popen(
            command_argv,
            cwd=cwd_path,
            env=child_env,
            shell=False,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            encoding="utf-8",
            errors="replace",
            creationflags=subprocess.CREATE_NEW_PROCESS_GROUP if os.name == "nt" else 0,
            start_new_session=os.name != "nt",
        )
        assert process.stdout is not None and process.stderr is not None
        lock, limit_reached, byte_count = threading.Lock(), threading.Event(), [0]
        stdout_chunks: list[str] = []
        stderr_chunks: list[str] = []
        readers = [
            threading.Thread(
                target=_read_bounded,
                args=(stream, chunks, byte_count, lock, limit_reached, policy.output_limit_bytes),
                daemon=True,
            )
            for stream, chunks in ((process.stdout, stdout_chunks), (process.stderr, stderr_chunks))
        ]
        for reader in readers:
            reader.start()
        expires = started + timeout
        timed_out = False
        terminated_for_output = False
        while process.poll() is None:
            if limit_reached.is_set():
                terminated_for_output = True
                _terminate_process_tree(process)
                break
            if time.monotonic() >= expires:
                timed_out = True
                _terminate_process_tree(process)
                break
            time.sleep(PROCESS_POLL_SECONDS)
        _wait_for_exit(process)
        for reader in readers:
            reader.join(timeout=2)
        output_truncated = terminated_for_output or limit_reached.is_set()
        stdout, stderr = (
            _redact("".join(stdout_chunks), secrets),
            _redact("".join(stderr_chunks), secrets),
        )
        if output_truncated:
            stderr = f"{stderr.rstrip()}\n{_TRUNCATION_NOTICE}\n".lstrip("\n")
        rendered = _redact(render_command(command_argv), secrets)
        manifest = ExecutionManifest(
            adapter=self.name,
            policy_version=policy.version,
            policy_identity=policy.identity,
            argv_digest=_digest("\0".join(command_argv)),
            rendered_argv=rendered,
            cwd_identity=CwdIdentity(str(cwd_path), _digest(str(cwd_path))),
            executable_identity=_executable_identity(command_argv[0]),
            runtime=f"Python {platform.python_version()} ({sys.implementation.name})",
            operating_system=f"{platform.system()} {platform.release()} ({platform.machine()})",
            duration_seconds=time.monotonic() - started,
            exit_code=process.returncode,
            timed_out=timed_out,
            output_truncated=output_truncated,
            redaction_applied=bool(secrets),
        )
        captured_output = "\n".join(part for part in (stdout, stderr) if part)
        receipt = EvidenceReceipt(
            rendered,
            captured_output,
            evidence_hash(rendered, captured_output),
        )
        return CommandEvidence(
            rendered,
            process.returncode,
            stdout,
            stderr,
            manifest.duration_seconds,
            timed_out,
            output_truncated,
            manifest,
            receipt,
        )


def run_command(
    argv: Sequence[str],
    *,
    cwd: str | Path,
    timeout: float = DEFAULT_COMMAND_TIMEOUT_SECONDS,
    deadline: float | None = None,
    env: Mapping[str, str] | None = None,
    output_limit_bytes: int = MAX_OUTPUT_BYTES,
    policy: ExecutionPolicy | None = None,
    runner: ExecutionRunner | None = None,
) -> CommandEvidence:
    """Backward-compatible entry point for the bounded host-process adapter."""
    selected = policy or ExecutionPolicy.default_for(cwd)
    if policy is None:
        # Legacy callers may still narrow these values but never widen default limits.
        if timeout <= 0 or output_limit_bytes <= 0:
            raise PolicyValidationError("legacy limits must be positive")
        if (
            timeout > selected.wall_clock_seconds
            or output_limit_bytes > selected.output_limit_bytes
        ):
            raise PolicyValidationError("legacy arguments may not weaken default policy limits")
        selected = ExecutionPolicy(
            selected.version,
            timeout,
            output_limit_bytes,
            selected.allowed_executables,
            selected.environment_allowlist,
            selected.working_directory_roots,
        )
    elif timeout != DEFAULT_COMMAND_TIMEOUT_SECONDS or output_limit_bytes != MAX_OUTPUT_BYTES:
        raise PolicyValidationError("select limits through ExecutionPolicy, not legacy arguments")
    return (runner or BoundedHostProcessRunner()).run(
        argv, cwd=cwd, policy=selected, deadline=deadline, env=env
    )


def _validate_request(
    argv: Sequence[str], cwd: Path, policy: ExecutionPolicy, env: Mapping[str, str] | None
) -> Path:
    if not argv or not argv[0].strip():
        raise CommandNotAllowedError("An executable is required")
    executable = Path(argv[0]).name.casefold()
    if executable not in policy.allowed_executables:
        raise CommandNotAllowedError(f"Executable is not allowlisted: {executable}")
    candidate = cwd.resolve()
    if not candidate.is_dir() or not any(
        candidate.is_relative_to(root) for root in policy.working_directory_roots
    ):
        raise CommandNotAllowedError("Working directory is outside the policy boundary")
    for name in env or {}:
        if _SENSITIVE_ENV_NAME.search(str(name)):
            continue  # legacy-safe strip and redact
        if str(name) not in policy.environment_allowlist:
            raise CommandNotAllowedError(f"Environment variable is not allowlisted: {name}")
    return candidate


def _child_environment(policy: ExecutionPolicy, supplied: Mapping[str, str]) -> dict[str, str]:
    child = {
        key: value
        for key, value in os.environ.items()
        if key in policy.environment_allowlist and not _SENSITIVE_ENV_NAME.search(key)
    }
    child.update(
        {
            key: value
            for key, value in supplied.items()
            if key in policy.environment_allowlist and not _SENSITIVE_ENV_NAME.search(key)
        }
    )
    child["PYTHONIOENCODING"] = "utf-8"
    child["PYTHONUTF8"] = "1"
    return child


def _normalize_executable(value: str) -> str:
    candidate = str(value).strip()
    if not candidate or Path(candidate).name != candidate:
        return ""
    return candidate.casefold()


def _valid_environment_name(value: str) -> bool:
    return bool(re.fullmatch(r"[A-Za-z_][A-Za-z0-9_]*", str(value)))


def _digest(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()


def _executable_identity(requested: str) -> ExecutableIdentity:
    resolved = shutil.which(requested) or requested
    path = Path(resolved).resolve()
    try:
        digest = hashlib.sha256(path.read_bytes()).hexdigest() if path.is_file() else None
    except OSError:
        digest = None
    return ExecutableIdentity(requested, str(path), digest)


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
    return tuple(
        sorted(
            {
                value
                for key, value in environment.items()
                if value and len(value) >= 4 and _SENSITIVE_ENV_NAME.search(key)
            },
            key=len,
            reverse=True,
        )
    )


def _redact(value: str, secrets: Sequence[str]) -> str:
    for secret in secrets:
        value = value.replace(secret, "[REDACTED]")
    return value


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
