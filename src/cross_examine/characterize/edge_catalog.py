"""Fixed, deterministic input catalogs for supported JSON-compatible annotations."""

from __future__ import annotations

from itertools import islice, product
from typing import Any

MAX_INPUTS_PER_CLAIM = 32


def values_for_annotation(annotation: dict[str, Any]) -> list[Any]:
    kind = annotation.get("kind")
    if kind == "int":
        return [-1, 0, 1, 2, 10]
    if kind == "float":
        return [-1.0, 0.0, 1.0, 2.5]
    if kind == "bool":
        return [False, True]
    if kind == "str":
        return ["", "a", "é", "🙂"]
    if kind == "none":
        return [None]
    if kind == "optional":
        inner = values_for_annotation(annotation.get("item", {}))
        return [None, *[value for value in inner if value is not None]]
    if kind == "list":
        item_kind = annotation.get("items", {}).get("kind")
        if item_kind == "int":
            return [[], [0], [1, -1]]
        if item_kind == "str":
            return [[], [""], ["a", "é"]]
    return []


def generate_inputs(
    signature: dict[str, Any],
) -> tuple[list[tuple[list[Any], dict[str, Any]]], str | None]:
    supported: list[tuple[dict[str, Any], list[Any]]] = []
    for parameter in signature.get("parameters", []):
        kind = parameter.get("kind")
        if kind in {"VAR_POSITIONAL", "VAR_KEYWORD"}:
            continue
        values = values_for_annotation(parameter.get("annotation", {}))
        if not values:
            if parameter.get("required", False):
                display = parameter.get("annotation", {}).get("display", "unknown")
                return [], f"unsupported required parameter: {parameter.get('name')} ({display})"
            continue
        supported.append((parameter, values))

    if not supported:
        return [([], {})], None

    cases: list[tuple[list[Any], dict[str, Any]]] = []
    combinations = product(*(values for _, values in supported))
    for combination in islice(combinations, MAX_INPUTS_PER_CLAIM):
        args: list[Any] = []
        kwargs: dict[str, Any] = {}
        for (parameter, _), value in zip(supported, combination, strict=True):
            if parameter["kind"] in {"POSITIONAL_ONLY", "POSITIONAL_OR_KEYWORD"}:
                args.append(value)
            else:
                kwargs[parameter["name"]] = value
        cases.append((args, kwargs))
    return cases, None
