import importlib
import json
import sys
from pathlib import Path

from cross_examine.cross_examine.probe_runner import _prepare_import_path, main


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


def test_probe_rejects_tuple_annotations_as_lossy_protocol_values(
    tmp_path: Path,
    monkeypatch,
    capsys,
) -> None:
    module_name = "cross_examine_tuple_annotation"
    (tmp_path / f"{module_name}.py").write_text(
        "def normalize(items: tuple[int, ...]) -> tuple[int, ...]:\n    return items\n",
        encoding="utf-8",
    )
    monkeypatch.setenv("CROSS_EXAMINE_WORKTREE", str(tmp_path))
    monkeypatch.setattr(sys, "path", list(sys.path))

    try:
        assert main(["describe", f"{module_name}:normalize"]) == 0
        payload = json.loads(capsys.readouterr().out)
    finally:
        sys.modules.pop(module_name, None)

    assert payload["ok"] is False
    assert payload["probe_error"] is True


def test_probe_rejects_builtin_subclass_results_as_lossy_protocol_values(
    tmp_path: Path,
    monkeypatch,
    capsys,
) -> None:
    module_name = "cross_examine_subclass_result"
    request = tmp_path / "request.json"
    request.write_text('{"args":[],"kwargs":{}}', encoding="utf-8")
    (tmp_path / f"{module_name}.py").write_text(
        "class FancyInt(int):\n    pass\n\ndef value() -> int:\n    return FancyInt(1)\n",
        encoding="utf-8",
    )
    monkeypatch.setenv("CROSS_EXAMINE_WORKTREE", str(tmp_path))
    monkeypatch.setattr(sys, "path", list(sys.path))

    try:
        assert main(["call", f"{module_name}:value", str(request)]) == 0
        payload = json.loads(capsys.readouterr().out)
    finally:
        sys.modules.pop(module_name, None)

    assert payload["ok"] is False
    assert payload["probe_error"] is True
