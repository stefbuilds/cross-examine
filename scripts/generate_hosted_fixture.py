"""Capture the deterministic hero report used by the hosted evidence explorer."""

from __future__ import annotations

import argparse
import os
import sys
import tempfile
from pathlib import Path
from typing import TYPE_CHECKING

SOURCE_ROOT = Path(__file__).resolve().parents[1] / "src"
sys.path.insert(0, str(SOURCE_ROOT))

if TYPE_CHECKING:
    from cross_examine.schema import Report


def capture_hosted_fixture(workspace: Path) -> "Report":
    """Execute the real deterministic hero pipeline in an empty workspace."""

    from cross_examine.corpus.repository import CorpusRepository
    from cross_examine.hero import HeroCharacterizer, ensure_hero_repository
    from cross_examine.persistence.database import Database
    from cross_examine.pipeline import Pipeline
    from cross_examine.schema import RunSpec

    hero = ensure_hero_repository(workspace / "hero")
    pipeline = Pipeline(
        characterizer=HeroCharacterizer(),
        corpus=CorpusRepository(Database(workspace / "cross-examine.db")),
        runs_root=workspace / "runs",
    )
    previous_pythonpath = os.environ.get("PYTHONPATH")
    os.environ["PYTHONPATH"] = str(SOURCE_ROOT)
    try:
        return pipeline.run(
            RunSpec(repo=str(hero.path), base_ref=hero.base, head_ref=hero.head, layer_b=True),
            run_id="hosted-fixture",
        )
    finally:
        if previous_pythonpath is None:
            del os.environ["PYTHONPATH"]
        else:
            os.environ["PYTHONPATH"] = previous_pythonpath


def main() -> None:
    from cross_examine.codec import report_to_json

    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--output",
        type=Path,
        default=Path("src/cross_examine/fixture_data/broken.json"),
    )
    arguments = parser.parse_args()

    with tempfile.TemporaryDirectory(prefix="cross-examine-hosted-fixture-") as temporary:
        report = capture_hosted_fixture(Path(temporary))
    arguments.output.write_text(report_to_json(report) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
