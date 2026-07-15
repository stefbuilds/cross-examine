"""Materialize and inspect both sides of a Python change."""

from __future__ import annotations

from collections.abc import Sequence
from pathlib import Path

from cross_examine.execution import run_command
from cross_examine.ingest.symbols import discover_touched_symbols
from cross_examine.schema import CommandEvidence, IngestResult, RunSpec


class IngestError(RuntimeError):
    """Raised when a Git ingest operation cannot be grounded."""


class IngestService:
    def ingest(
        self,
        spec: RunSpec,
        run_dir: str | Path,
        *,
        deadline: float | None = None,
    ) -> IngestResult:
        _validate_revision(spec.base_ref)
        _validate_revision(spec.head_ref)
        root = Path(run_dir).resolve()
        root.mkdir(parents=True, exist_ok=True)
        repo_path = root / "repo"
        base_path = root / "base"
        head_path = root / "head"
        evidence: list[CommandEvidence] = []

        self._execute(
            ["git", "clone", "--no-checkout", "--", spec.repo, str(repo_path)],
            cwd=root,
            timeout=spec.command_timeout_seconds,
            deadline=deadline,
            evidence=evidence,
        )
        base_sha = self._execute(
            ["git", "-C", str(repo_path), "rev-parse", f"{spec.base_ref}^{{commit}}"],
            cwd=root,
            timeout=spec.command_timeout_seconds,
            deadline=deadline,
            evidence=evidence,
        ).stdout.strip()
        head_sha = self._execute(
            ["git", "-C", str(repo_path), "rev-parse", f"{spec.head_ref}^{{commit}}"],
            cwd=root,
            timeout=spec.command_timeout_seconds,
            deadline=deadline,
            evidence=evidence,
        ).stdout.strip()
        self._execute(
            ["git", "-C", str(repo_path), "worktree", "add", "--detach", str(base_path), base_sha],
            cwd=root,
            timeout=spec.command_timeout_seconds,
            deadline=deadline,
            evidence=evidence,
        )
        self._execute(
            ["git", "-C", str(repo_path), "worktree", "add", "--detach", str(head_path), head_sha],
            cwd=root,
            timeout=spec.command_timeout_seconds,
            deadline=deadline,
            evidence=evidence,
        )
        diff_evidence = self._execute(
            [
                "git",
                "-C",
                str(repo_path),
                "diff",
                "--unified=80",
                f"{base_sha}..{head_sha}",
                "--",
                "*.py",
            ],
            cwd=root,
            timeout=spec.command_timeout_seconds,
            deadline=deadline,
            evidence=evidence,
        )
        diff = diff_evidence.stdout
        touched_symbols = discover_touched_symbols(diff, base_path, head_path)

        return IngestResult(
            repo=spec.repo,
            base_sha=base_sha,
            head_sha=head_sha,
            base_path=str(base_path),
            head_path=str(head_path),
            diff=diff,
            touched_symbols=touched_symbols,
            test_commands=discover_test_commands(head_path),
            evidence=evidence,
        )

    @staticmethod
    def _execute(
        argv: Sequence[str],
        *,
        cwd: Path,
        timeout: float,
        deadline: float | None,
        evidence: list[CommandEvidence],
    ) -> CommandEvidence:
        item = run_command(
            argv,
            cwd=cwd,
            timeout=timeout,
            deadline=deadline,
            env={"GIT_TERMINAL_PROMPT": "0"},
        )
        evidence.append(item)
        if item.timed_out:
            raise IngestError(f"Command timed out: {item.command}")
        if item.output_truncated:
            raise IngestError(f"Command exceeded the output limit: {item.command}")
        if item.exit_code != 0:
            raise IngestError(f"Command failed ({item.exit_code}): {item.command}\n{item.output}")
        return item


def discover_test_commands(repo_path: Path) -> list[list[str]]:
    """Return the conservative pytest command for recognized Python test layouts."""

    markers = (repo_path / "pyproject.toml", repo_path / "pytest.ini", repo_path / "tests")
    if any(marker.exists() for marker in markers):
        return [["python", "-m", "pytest", "-q", "-p", "no:cacheprovider"]]
    return []


def _validate_revision(revision: str) -> None:
    if (
        not revision
        or revision.startswith("-")
        or any(character.isspace() for character in revision)
    ):
        raise IngestError(f"Unsafe Git revision: {revision!r}")
