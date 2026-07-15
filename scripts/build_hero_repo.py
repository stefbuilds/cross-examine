"""Build the deterministic hero repository from checked-in source snapshots."""

from __future__ import annotations

import argparse
import json
from pathlib import Path

from cross_examine.hero import build_hero_repository


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("destination", type=Path)
    arguments = parser.parse_args()
    source = Path(__file__).parents[1] / "tests" / "fixtures" / "hero_repo" / "source"
    hero = build_hero_repository(arguments.destination, source_root=source)
    print(json.dumps({"repo": str(hero.path), "base": hero.base, "head": hero.head}))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
