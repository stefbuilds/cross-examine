"""Constrained, deterministic metamorphic probe plans.

Plans are untrusted proposals.  They contain JSON data only; this module
validates them against a runtime-discovered signature before any execution.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

SUPPORTED_RELATIONS = {
    "identity_idempotence",
    "permutation_invariance",
    "normalization_stability",
    "partition_concatenation",
}
MAX_PLAN_BUDGET = 16
RELATION_STRENGTH = {
    "partition_concatenation": 4,
    "normalization_stability": 3,
    "identity_idempotence": 2,
    "permutation_invariance": 1,
}


class ProbePlanError(ValueError):
    """A proposed plan is outside the deterministic verifier contract."""


@dataclass
class ProbePlan:
    id: str
    version: int
    claim_id: str
    target_symbol: str
    input_domain: dict[str, Any]
    relation_type: str
    relation_parameters: dict[str, Any]
    oracle_category: str
    priority: int
    budget: int
    provenance: dict[str, Any]


def validate_probe_plan(
    plan: ProbePlan,
    signature: dict[str, Any],
    allowed_targets: set[str],
) -> ProbePlan:
    if plan.version != 1:
        raise ProbePlanError("Unsupported ProbePlan version")
    if not plan.id.strip() or not plan.claim_id.strip():
        raise ProbePlanError("ProbePlan IDs must be non-empty")
    if plan.target_symbol not in allowed_targets:
        raise ProbePlanError(f"Unknown target: {plan.target_symbol}")
    if plan.relation_type not in SUPPORTED_RELATIONS:
        raise ProbePlanError(f"Unsupported relation: {plan.relation_type}")
    if plan.oracle_category != "metamorphic":
        raise ProbePlanError("Unsupported oracle category")
    if not isinstance(plan.priority, int) or not 0 <= plan.priority <= 10:
        raise ProbePlanError("priority must be an integer from 0 to 10")
    if not isinstance(plan.budget, int) or not 1 <= plan.budget <= MAX_PLAN_BUDGET:
        raise ProbePlanError(f"budget must be an integer from 1 to {MAX_PLAN_BUDGET}")
    if not _is_json(plan.input_domain) or not _is_json(plan.relation_parameters) or not _is_json(plan.provenance):
        raise ProbePlanError("ProbePlan fields must contain JSON-compatible data")
    parameters = plan.input_domain.get("parameters") if isinstance(plan.input_domain, dict) else None
    if not isinstance(parameters, dict) or not parameters:
        raise ProbePlanError("input_domain requires a non-empty parameters object")
    signature_parameters = {
        item.get("name"): item for item in signature.get("parameters", []) if isinstance(item, dict)
    }
    for name, values in parameters.items():
        parameter = signature_parameters.get(name)
        if parameter is None:
            raise ProbePlanError(f"input_domain has unknown parameter: {name}")
        if parameter.get("kind") not in {"POSITIONAL_ONLY", "POSITIONAL_OR_KEYWORD", "KEYWORD_ONLY"}:
            raise ProbePlanError(f"unsupported argument shape for parameter: {name}")
        if not isinstance(values, list) or not values or len(values) > plan.budget:
            raise ProbePlanError("input_domain values must be a non-empty bounded list")
        if not all(_value_matches(value, parameter.get("annotation", {})) for value in values):
            raise ProbePlanError(f"input_domain values do not match JSON signature for parameter: {name}")
    relation_parameter = plan.relation_parameters.get("parameter")
    if not isinstance(relation_parameter, str) or relation_parameter not in parameters:
        raise ProbePlanError("relation parameter must name a supplied domain parameter")
    annotation = signature_parameters[relation_parameter].get("annotation", {})
    if plan.relation_type in {"permutation_invariance", "partition_concatenation"}:
        if annotation.get("kind") not in {"list", "tuple"}:
            raise ProbePlanError("relation requires an eligible sequence parameter")
    if plan.relation_type in {"identity_idempotence", "normalization_stability"}:
        if len(signature_parameters) != 1 or annotation.get("kind") not in {"list", "str", "int", "float"}:
            raise ProbePlanError("relation requires a single JSON-compatible argument")
    return plan


def schedule_probe_plans(
    plans: list[ProbePlan], corpus_coverage: dict[str, int] | None = None
) -> list[ProbePlan]:
    """Rank changed-symbol plans without using model confidence as an oracle."""
    coverage = corpus_coverage or {}
    return sorted(
        plans,
        key=lambda plan: (
            -RELATION_STRENGTH.get(plan.relation_type, 0),
            coverage.get(plan.target_symbol, 0),
            -plan.priority,
            plan.budget,
            plan.id,
        ),
    )


def _is_json(value: Any) -> bool:
    if value is None or isinstance(value, (str, int, float, bool)):
        return not isinstance(value, float) or value == value and value not in {float("inf"), float("-inf")}
    if isinstance(value, list):
        return all(_is_json(item) for item in value)
    if isinstance(value, dict):
        return all(isinstance(key, str) and _is_json(item) for key, item in value.items())
    return False


def _value_matches(value: Any, annotation: dict[str, Any]) -> bool:
    kind = annotation.get("kind")
    if kind == "int":
        return isinstance(value, int) and not isinstance(value, bool)
    if kind == "float":
        return isinstance(value, (int, float)) and not isinstance(value, bool) and _is_json(value)
    if kind == "str":
        return isinstance(value, str)
    if kind == "bool":
        return isinstance(value, bool)
    if kind == "none":
        return value is None
    if kind == "optional":
        return value is None or _value_matches(value, annotation.get("item", {}))
    if kind in {"list", "tuple"}:
        return isinstance(value, list) and all(_value_matches(item, annotation.get("items", {})) for item in value)
    if kind == "dict":
        return isinstance(value, dict) and all(
            isinstance(key, str) and _value_matches(item, annotation.get("values", {}))
            for key, item in value.items()
        )
    return False
