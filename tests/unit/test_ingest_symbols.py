from pathlib import Path

from cross_examine.ingest.symbols import discover_touched_symbols


def test_deleted_python_file_is_discovered_from_the_base_tree(tmp_path: Path) -> None:
    base = tmp_path / "base"
    head = tmp_path / "head"
    source = base / "src" / "sample" / "bounds.py"
    source.parent.mkdir(parents=True)
    head.mkdir()
    source.write_text(
        "class Bounds:\n    def clamp(self, value: int) -> int:\n        return value\n",
        encoding="utf-8",
    )
    diff = (
        "diff --git a/src/sample/bounds.py b/src/sample/bounds.py\n"
        "deleted file mode 100644\n"
        "--- a/src/sample/bounds.py\n"
        "+++ /dev/null\n"
    )

    symbols = discover_touched_symbols(diff, base, head)

    assert [symbol.target_symbol for symbol in symbols] == [
        "sample.bounds:Bounds",
        "sample.bounds:Bounds.clamp",
    ]
