import importlib
import sys
from pathlib import Path

from cross_examine.cross_examine.probe_runner import _prepare_import_path


def test_prepare_import_path_prefers_src_layout(
    tmp_path: Path,
    monkeypatch,
) -> None:
    source = tmp_path / "src"
    source.mkdir()
    module_name = "cross_examine_import_collision"
    (tmp_path / f"{module_name}.py").write_text("VALUE = 1\n", encoding="utf-8")
    (source / f"{module_name}.py").write_text("VALUE = 2\n", encoding="utf-8")
    monkeypatch.setenv("CROSS_EXAMINE_WORKTREE", str(tmp_path))
    monkeypatch.setattr(sys, "path", list(sys.path))

    try:
        _prepare_import_path()
        module = importlib.import_module(module_name)

        assert sys.path.index(str(source)) < sys.path.index(str(tmp_path))
        assert module.VALUE == 2
        assert Path(module.__file__).resolve() == source / f"{module_name}.py"
    finally:
        sys.modules.pop(module_name, None)
