from pathlib import Path


def test_repository_metadata_does_not_advertise_open_source_licenses() -> None:
    root = Path(__file__).resolve().parents[1]
    paths = [
        root / "LICENSE",
        root / "pyproject.toml",
        root / "CITATION.cff",
        root / ".zenodo.json",
        root / "README.md",
        root / "benchmark" / "README.md",
        root / "benchmark" / "LICENSE",
        root / "benchmark" / "huggingface" / "README.md",
    ]

    text = "\n".join(path.read_text(encoding="utf-8") for path in paths if path.exists())
    lowered = text.lower()

    assert "mit license" not in lowered
    assert "license: mit" not in lowered
    assert '"license": "mit"' not in lowered
    assert "cc by 4.0" not in lowered
    assert "creative commons attribution" not in lowered
    assert "all rights reserved" in lowered
