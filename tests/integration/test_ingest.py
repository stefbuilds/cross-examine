from __future__ import annotations

import subprocess
from pathlib import Path

from cross_examine.ingest.service import IngestService
from cross_examine.schema import RunSpec


def git(repo: Path, *args: str) -> str:
    result = subprocess.run(
        ["git", "-C", str(repo), *args],
        check=True,
        capture_output=True,
        text=True,
    )
    return result.stdout.strip()


def create_changed_repository(root: Path) -> tuple[Path, str, str]:
    repo = root / "source-repo"
    source = repo / "src" / "sample" / "math.py"
    tests = repo / "tests"
    source.parent.mkdir(parents=True)
    tests.mkdir(parents=True)
    source.write_text(
        "def clamp(value: int, lower: int, upper: int) -> int:\n"
        "    return max(lower, min(value, upper))\n",
        encoding="utf-8",
    )
    (repo / "pyproject.toml").write_text(
        "[tool.pytest.ini_options]\ntestpaths = ['tests']\n",
        encoding="utf-8",
    )
    git(repo, "init")
    git(repo, "config", "user.name", "Cross Examine Test")
    git(repo, "config", "user.email", "cross-examine@example.test")
    git(repo, "add", ".")
    git(repo, "commit", "-m", "base")
    base_sha = git(repo, "rev-parse", "HEAD")

    source.write_text(
        "def clamp(value: int, lower: int, upper: int) -> int:\n"
        "    if lower > upper:\n"
        "        raise ValueError('lower must not exceed upper')\n"
        "    return max(lower, min(value, upper))\n",
        encoding="utf-8",
    )
    git(repo, "add", ".")
    git(repo, "commit", "-m", "validate bounds")
    head_sha = git(repo, "rev-parse", "HEAD")
    return repo, base_sha, head_sha


def test_ingest_materializes_both_revisions_and_discovers_symbols(tmp_path: Path) -> None:
    repo, base_sha, head_sha = create_changed_repository(tmp_path)

    result = IngestService().ingest(
        RunSpec(repo=str(repo), base_ref=base_sha, head_ref=head_sha),
        tmp_path / "run",
    )

    assert result.base_sha == base_sha
    assert result.head_sha == head_sha
    assert (Path(result.base_path) / "src" / "sample" / "math.py").is_file()
    assert (Path(result.head_path) / "src" / "sample" / "math.py").is_file()
    assert "+        raise ValueError('lower must not exceed upper')" in result.diff
    assert [symbol.target_symbol for symbol in result.touched_symbols] == ["sample.math:clamp"]
    assert result.test_commands == [
        ["python", "-m", "pytest", "-q", "-p", "no:cacheprovider"]
    ]

    commands = [item.command for item in result.evidence]
    assert len(commands) == 6
    assert commands[0].startswith("git clone --no-checkout")
    assert "rev-parse" in commands[1]
    assert "rev-parse" in commands[2]
    assert "worktree add --detach" in commands[3]
    assert "worktree add --detach" in commands[4]
    assert "diff --unified=80" in commands[5]


def test_ingest_fetches_pr_refs_missing_from_normal_clone(tmp_path: Path) -> None:
    repo, base_sha, head_sha = create_changed_repository(tmp_path)
    git(repo, "update-ref", "refs/pull/42/head", head_sha)
    result = IngestService().ingest(
        RunSpec(repo=str(repo), base_ref=base_sha, head_ref="refs/pull/42/head"),
        tmp_path / "pr-run",
    )
    assert result.base_sha == base_sha
    assert result.head_sha == head_sha
    assert any("fetch --no-tags origin refs/pull/42/head" in e.command for e in result.evidence)


def test_ingest_resolves_non_default_remote_branches(tmp_path: Path) -> None:
    repo, base_sha, head_sha = create_changed_repository(tmp_path)
    git(repo, "branch", "base-branch", base_sha)
    git(repo, "branch", "candidate-branch", head_sha)
    result = IngestService().ingest(
        RunSpec(repo=str(repo), base_ref="base-branch", head_ref="candidate-branch"),
        tmp_path / "branch-run",
    )
    assert (result.base_sha, result.head_sha) == (base_sha, head_sha)
