"""Separate-process differential search and shrinking with Hypothesis."""

from __future__ import annotations

import json
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from hypothesis import HealthCheck, find, settings, strategies as st
from hypothesis.errors import NoSuchExample
from hypothesis.strategies import SearchStrategy

from cross_examine.cross_examine.probe_protocol import canonical_envelope, display_result
from cross_examine.execution import run_command

WORKER_VERSION = 1
MAX_EXAMPLES = 60
PROBE_TIMEOUT_SECONDS = 8
_PROBE_MODULE = "cross_examine.cross_examine.probe_runner"


@dataclass(frozen=True)
class ProbeCall:
    command: str
    output: str
    envelope: dict[str, Any] | None
    error: str | None = None


class ProbeFailure(RuntimeError):
    pass


def main(argv: list[str] | None = None) -> int:
    arguments = list(sys.argv[1:] if argv is None else argv)
    try:
        if len(arguments) != 4:
            raise ValueError("usage: hypothesis_worker target base_path head_path state_dir")
        target, base_raw, head_raw, state_raw = arguments
        base = Path(base_raw).resolve()
        head = Path(head_raw).resolve()
        state = Path(state_raw).resolve()
        state.mkdir(parents=True, exist_ok=True)

        description = _probe(base, target, "describe", state / "describe.json")
        if description.envelope is None or not description.envelope.get("ok"):
            raise ProbeFailure(description.error or "base signature could not be described")
        signature = description.envelope.get("value")
        if not isinstance(signature, dict):
            raise ProbeFailure("base signature payload was malformed")
        strategy = _request_strategy(signature)
        cache: dict[str, tuple[ProbeCall, ProbeCall]] = {}

        def compare(request: tuple[list[Any], dict[str, Any]]) -> bool:
            key = _canonical_json({"args": request[0], "kwargs": request[1]})
            if key not in cache:
                cache[key] = _compare_once(base, head, target, state, request)
            base_call, head_call = cache[key]
            if base_call.envelope is None or head_call.envelope is None:
                raise ProbeFailure(base_call.error or head_call.error or "probe failed")
            return canonical_envelope(base_call.envelope) != canonical_envelope(head_call.envelope)

        hypothesis_settings = settings(
            max_examples=MAX_EXAMPLES,
            deadline=None,
            derandomize=True,
            database=None,
            suppress_health_check=[HealthCheck.too_slow],
        )
        try:
            counterexample = find(strategy, compare, settings=hypothesis_settings)
        except NoSuchExample:
            _emit(
                status="verified",
                message=f"No differential counterexample in {MAX_EXAMPLES} deterministic examples",
            )
            return 0

        key = _canonical_json({"args": counterexample[0], "kwargs": counterexample[1]})
        base_call, head_call = cache.get(key) or _compare_once(
            base, head, target, state, counterexample
        )
        assert base_call.envelope is not None
        assert head_call.envelope is not None
        _emit(
            status="refuted",
            message="Hypothesis found and shrank a differential counterexample",
            repro_input=_display_input(*counterexample),
            expected=display_result(base_call.envelope),
            actual=display_result(head_call.envelope),
            base_command=base_call.command,
            base_output=base_call.output,
            head_command=head_call.command,
            head_output=head_call.output,
        )
        return 0
    except Exception as exc:  # noqa: BLE001 - worker must return a tagged abstention
        _emit(status="unverifiable", message=f"{type(exc).__name__}: {exc}")
        return 0


def _request_strategy(
    signature: dict[str, Any],
) -> SearchStrategy[tuple[list[Any], dict[str, Any]]]:
    positional: list[SearchStrategy[Any]] = []
    keyword: dict[str, SearchStrategy[Any]] = {}
    for parameter in signature.get("parameters", []):
        kind = parameter.get("kind")
        if kind in {"VAR_POSITIONAL", "VAR_KEYWORD"}:
            continue
        value_strategy = _annotation_strategy(parameter.get("annotation", {}))
        if value_strategy is None:
            if parameter.get("required", False):
                display = parameter.get("annotation", {}).get("display", "unknown")
                raise ProbeFailure(
                    f"unsupported required parameter: {parameter.get('name')} ({display})"
                )
            continue
        if kind in {"POSITIONAL_ONLY", "POSITIONAL_OR_KEYWORD"}:
            positional.append(value_strategy)
        else:
            keyword[parameter["name"]] = value_strategy

    positional_strategy = st.tuples(*positional).map(list) if positional else st.just([])
    keyword_strategy = st.fixed_dictionaries(keyword) if keyword else st.just({})
    return st.tuples(positional_strategy, keyword_strategy)


def _annotation_strategy(annotation: dict[str, Any]) -> SearchStrategy[Any] | None:
    kind = annotation.get("kind")
    if kind == "bool":
        return st.booleans()
    if kind == "int":
        return st.integers(min_value=-100, max_value=100)
    if kind == "float":
        return st.floats(
            min_value=-100,
            max_value=100,
            allow_nan=False,
            allow_infinity=False,
        )
    if kind == "str":
        alphabet = st.characters(blacklist_categories=("Cs",))
        return st.text(alphabet=alphabet, max_size=20)
    if kind == "none":
        return st.none()
    if kind == "optional":
        inner = _annotation_strategy(annotation.get("item", {}))
        return st.none() | inner if inner is not None else st.none()
    if kind == "list":
        inner = _annotation_strategy(annotation.get("items", {}))
        return st.lists(inner, max_size=8) if inner is not None else None
    if kind == "tuple":
        inner = _annotation_strategy(annotation.get("items", {}))
        return st.lists(inner, max_size=8).map(tuple) if inner is not None else None
    if kind == "dict" and annotation.get("keys", {}).get("kind") == "str":
        inner = _annotation_strategy(annotation.get("values", {}))
        keys = st.text(alphabet=st.characters(blacklist_categories=("Cs",)), max_size=12)
        return st.dictionaries(keys, inner, max_size=6) if inner is not None else None
    return None


def _compare_once(
    base: Path,
    head: Path,
    target: str,
    state: Path,
    request: tuple[list[Any], dict[str, Any]],
) -> tuple[ProbeCall, ProbeCall]:
    payload = {"args": request[0], "kwargs": request[1]}
    request_path = state / "request.json"
    request_path.write_text(_canonical_json(payload), encoding="utf-8")
    return (
        _probe(base, target, "call", request_path),
        _probe(head, target, "call", request_path),
    )


def _probe(worktree: Path, target: str, mode: str, request_path: Path) -> ProbeCall:
    argv = [sys.executable, "-P", "-m", _PROBE_MODULE, mode, target]
    if mode == "call":
        argv.append(str(request_path))
    evidence = run_command(
        argv,
        cwd=worktree,
        timeout=PROBE_TIMEOUT_SECONDS,
        env={"CROSS_EXAMINE_WORKTREE": str(worktree)},
    )
    if evidence.timed_out:
        return ProbeCall(evidence.command, evidence.output, None, "probe timed out")
    if evidence.output_truncated:
        return ProbeCall(evidence.command, evidence.output, None, "probe output exceeded limit")
    if evidence.exit_code != 0:
        return ProbeCall(
            evidence.command,
            evidence.output,
            None,
            f"probe exited with code {evidence.exit_code}",
        )
    for line in reversed(evidence.stdout.splitlines()):
        try:
            envelope = json.loads(line)
        except json.JSONDecodeError:
            continue
        if isinstance(envelope, dict) and envelope.get("cross_examine_probe") == 1:
            if envelope.get("probe_error"):
                exception = envelope.get("exception") or {}
                return ProbeCall(
                    evidence.command,
                    evidence.output,
                    None,
                    exception.get("message", "probe error"),
                )
            return ProbeCall(evidence.command, evidence.output, envelope)
    return ProbeCall(
        evidence.command,
        evidence.output,
        None,
        "probe emitted no tagged envelope",
    )


def _display_input(args: list[Any], kwargs: dict[str, Any]) -> str:
    if len(args) == 1 and not kwargs:
        return _canonical_json(args[0])
    return _canonical_json({"args": args, "kwargs": kwargs})


def _canonical_json(value: Any) -> str:
    return json.dumps(value, ensure_ascii=False, separators=(",", ":"), sort_keys=True)


def _emit(status: str, message: str, **details: Any) -> None:
    print(
        json.dumps(
            {
                "cross_examine_layer_b": WORKER_VERSION,
                "status": status,
                "message": message,
                **details,
            },
            ensure_ascii=False,
            sort_keys=True,
        )
    )


if __name__ == "__main__":
    raise SystemExit(main())
