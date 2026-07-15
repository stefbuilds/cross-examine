"""Deterministic hero repository and its explicitly labeled characterization."""

from __future__ import annotations

import os
import shutil
import subprocess
from dataclasses import dataclass
from pathlib import Path

from cross_examine.schema import Claim


@dataclass(frozen=True)
class HeroRepository:
    path: Path
    base: str
    head: str


class HeroCharacterizer:
    """Checked-in claim fixture used only by the offline hero demo."""

    source = "deterministic hero fixture"

    def characterize(
        self,
        _ingest: object,
        *,
        timeout: float | None = None,
    ) -> list[Claim]:
        del timeout
        return [
            Claim(
                id="preserve-empty",
                text="preserves empty-list normalization",
                target_symbol="normalizer.core:normalize",
                risk="high",
                proposed_check=(
                    "[characterization source: deterministic hero fixture] "
                    "exercise empty and non-empty integer lists"
                ),
                preserve_critical=True,
            )
        ]


def build_hero_repository(
    destination: str | Path,
    *,
    source_root: str | Path | None = None,
) -> HeroRepository:
    destination_path = Path(destination).resolve()
    if destination_path.exists() and any(destination_path.iterdir()):
        raise FileExistsError(f"Hero destination is not empty: {destination_path}")
    destination_path.mkdir(parents=True, exist_ok=True)
    sources = Path(source_root).resolve() if source_root else _default_source_root()
    _overlay(sources / "base", destination_path)

    _git(destination_path, "init")
    _git(destination_path, "config", "user.name", "Cross-Examine Hero")
    _git(destination_path, "config", "user.email", "hero@cross-examine.invalid")
    _git(destination_path, "config", "commit.gpgsign", "false")
    _git(destination_path, "config", "core.autocrlf", "false")
    _git(destination_path, "add", ".")
    _git(destination_path, "commit", "-m", "base: preserve empty normalization")
    base = _git(destination_path, "rev-parse", "HEAD")
    _git(destination_path, "tag", "hero-base", base)

    _overlay(sources / "head", destination_path)
    _git(destination_path, "add", ".")
    _git(destination_path, "commit", "-m", "optimize empty normalization")
    head = _git(destination_path, "rev-parse", "HEAD")
    _git(destination_path, "tag", "hero-head", head)
    return HeroRepository(path=destination_path, base=base, head=head)


def ensure_hero_repository(destination: str | Path) -> HeroRepository:
    """Reuse the stable hero refs so consecutive demos share one corpus key."""

    destination_path = Path(destination).resolve()
    if (destination_path / ".git").is_dir():
        return HeroRepository(
            path=destination_path,
            base=_git(destination_path, "rev-parse", "hero-base"),
            head=_git(destination_path, "rev-parse", "hero-head"),
        )
    return build_hero_repository(destination_path)


def _default_source_root() -> Path:
    packaged = Path(__file__).with_name("hero_source")
    if packaged.is_dir():
        return packaged
    project_fixture = Path(__file__).resolve().parents[2] / "tests" / "fixtures" / "hero_repo" / "source"
    if project_fixture.is_dir():
        return project_fixture
    raise FileNotFoundError("The checked-in hero source snapshots are unavailable")


def _overlay(source: Path, destination: Path) -> None:
    if not source.is_dir():
        raise FileNotFoundError(source)
    for path in sorted(source.rglob("*")):
        if not path.is_file():
            continue
        target = destination / path.relative_to(source)
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(path, target)


def _git(repo: Path, *arguments: str) -> str:
    environment = {
        **os.environ,
        "GIT_AUTHOR_DATE": "2026-07-15T00:00:00+00:00",
        "GIT_COMMITTER_DATE": "2026-07-15T00:00:00+00:00",
        "GIT_CONFIG_NOSYSTEM": "1",
    }
    result = subprocess.run(
        ["git", "-C", str(repo), *arguments],
        check=True,
        capture_output=True,
        text=True,
        env=environment,
    )
    return result.stdout.strip()
