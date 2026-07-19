"""Child-process entry point that imports and calls code only inside a worktree."""

from __future__ import annotations

import importlib
import inspect
import json
import os
import sys
import typing
from pathlib import Path
from typing import Any

from cross_examine.cross_examine.probe_protocol import PROBE_VERSION


def main(argv: list[str] | None = None) -> int:
    arguments = list(sys.argv[1:] if argv is None else argv)
    try:
        if len(arguments) < 2 or arguments[0] not in {"describe", "call"}:
            raise ValueError("usage: probe_runner describe|call module:symbol [request.json]")
        mode, target_name = arguments[0], arguments[1]
        _prepare_import_path()
        target = _resolve_target(target_name)
        _validate_callable(target)
        if mode == "describe":
            description = _describe(target)
            if not _description_is_exact_json(description):
                raise TypeError("callable has unsupported parameter annotations")
            _emit(ok=True, value=description, exception=None, probe_error=False)
            return 0
        if len(arguments) != 3:
            raise ValueError("call mode requires request.json")
        request = json.loads(Path(arguments[2]).read_text(encoding="utf-8"))
        args = request.get("args")
        kwargs = request.get("kwargs")
        if not isinstance(args, list) or not isinstance(kwargs, dict):
            raise TypeError("request args must be a list and kwargs must be an object")
        try:
            value = target(*args, **kwargs)
        except ImportError as exc:
            _emit(
                ok=False,
                value=None,
                exception={"type": type(exc).__name__, "message": str(exc)},
                probe_error=True,
            )
            return 0
        except Exception as exc:  # noqa: BLE001 - target exceptions are normalized behavior
            _emit(
                ok=False,
                value=None,
                exception={"type": type(exc).__name__, "message": str(exc)},
                probe_error=False,
            )
            return 0
        try:
            if not _is_exact_json_value(value):
                raise TypeError("result is not an exact JSON value")
            json.dumps(value, ensure_ascii=False, allow_nan=False)
        except (TypeError, ValueError) as exc:
            _emit(
                ok=False,
                value=None,
                exception={"type": "UnserializableResult", "message": str(exc)},
                probe_error=True,
            )
            return 0
        _emit(ok=True, value=value, exception=None, probe_error=False)
        return 0
    except Exception as exc:  # noqa: BLE001 - protocol failures must still be tagged
        _emit(
            ok=False,
            value=None,
            exception={"type": type(exc).__name__, "message": str(exc)},
            probe_error=True,
        )
        return 0


def _prepare_import_path() -> None:
    root = Path(os.environ.get("CROSS_EXAMINE_WORKTREE", Path.cwd())).resolve()
    for candidate in (root, root / "src"):
        if candidate.is_dir():
            sys.path.insert(0, str(candidate))


def _resolve_target(target_name: str) -> Any:
    module_name, separator, qualname = target_name.partition(":")
    if not separator or not module_name or not qualname:
        raise ValueError("target must use module:symbol syntax")
    target: Any = importlib.import_module(module_name)
    for attribute in qualname.split("."):
        if not attribute or attribute.startswith("_"):
            raise ValueError("private or empty target attributes are not allowed")
        target = getattr(target, attribute)
    return target


def _validate_callable(target: Any) -> None:
    if inspect.isclass(target):
        raise TypeError("classes are unsupported in v1")
    if not callable(target):
        raise TypeError("target is not callable")
    if (
        inspect.iscoroutinefunction(target)
        or inspect.isgeneratorfunction(target)
        or inspect.isasyncgenfunction(target)
    ):
        raise TypeError("async and generator callables are unsupported in v1")


def _describe(target: Any) -> dict[str, Any]:
    signature = inspect.signature(target)
    try:
        hints = typing.get_type_hints(target)
    except (NameError, TypeError):
        hints = {}
    parameters = []
    for parameter in signature.parameters.values():
        annotation = hints.get(parameter.name, parameter.annotation)
        parameters.append(
            {
                "name": parameter.name,
                "kind": parameter.kind.name,
                "required": parameter.default is inspect.Parameter.empty,
                "annotation": _describe_annotation(annotation),
            }
        )
    return {"parameters": parameters}


def _describe_annotation(annotation: Any) -> dict[str, Any]:
    if annotation is inspect.Parameter.empty:
        return {"kind": "unsupported", "display": "unannotated"}
    if annotation is None or annotation is type(None):
        return {"kind": "none"}
    if annotation in {int, float, bool, str}:
        return {"kind": annotation.__name__}

    origin = typing.get_origin(annotation)
    arguments = typing.get_args(annotation)
    if origin is list and len(arguments) == 1:
        return {"kind": "list", "items": _describe_annotation(arguments[0])}
    if origin is dict and len(arguments) == 2 and arguments[0] is str:
        return {
            "kind": "dict",
            "keys": {"kind": "str"},
            "values": _describe_annotation(arguments[1]),
        }
    return {"kind": "unsupported", "display": str(annotation)}


def _description_is_exact_json(description: dict[str, Any]) -> bool:
    """Accept only parameter descriptions the deterministic input catalog can replay."""

    def supported(annotation: dict[str, Any]) -> bool:
        kind = annotation.get("kind")
        if kind in {"none", "int", "float", "bool", "str"}:
            return True
        if kind == "list":
            items = annotation.get("items")
            return isinstance(items, dict) and supported(items)
        if kind == "dict":
            values = annotation.get("values")
            return isinstance(values, dict) and supported(values)
        return False

    return all(supported(parameter["annotation"]) for parameter in description["parameters"])


def _is_exact_json_value(value: Any) -> bool:
    """Reject values whose JSON encoding would erase their runtime representation."""

    if value is None or type(value) in {bool, int, float, str}:
        return True
    if type(value) is list:
        return all(_is_exact_json_value(item) for item in value)
    if type(value) is dict:
        return all(type(key) is str and _is_exact_json_value(item) for key, item in value.items())
    return False


def _emit(
    *,
    ok: bool,
    value: Any,
    exception: dict[str, str] | None,
    probe_error: bool,
) -> None:
    print(
        json.dumps(
            {
                "cross_examine_probe": PROBE_VERSION,
                "ok": ok,
                "value": value,
                "exception": exception,
                "probe_error": probe_error,
            },
            ensure_ascii=False,
            allow_nan=False,
            sort_keys=True,
        )
    )


if __name__ == "__main__":
    raise SystemExit(main())
