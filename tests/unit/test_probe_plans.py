from __future__ import annotations

import pytest

from cross_examine.probe_plans import (
    ProbePlan,
    ProbePlanError,
    schedule_probe_plans,
    validate_probe_plan,
)


SIGNATURE = {
    "parameters": [
        {
            "name": "items",
            "kind": "POSITIONAL_OR_KEYWORD",
            "required": True,
            "annotation": {"kind": "list", "items": {"kind": "int"}},
        }
    ]
}


def plan(**overrides: object) -> ProbePlan:
    values: dict[str, object] = {
        "id": "permutation-normalize",
        "version": 1,
        "claim_id": "preserve-normalize",
        "target_symbol": "sample.core:normalize",
        "input_domain": {"parameters": {"items": [[3, 1, 2]]}},
        "relation_type": "permutation_invariance",
        "relation_parameters": {"parameter": "items"},
        "oracle_category": "metamorphic",
        "priority": 5,
        "budget": 4,
        "provenance": {"source": "characterizer"},
    }
    values.update(overrides)
    return ProbePlan(**values)  # type: ignore[arg-type]


def test_validates_a_supported_plan_against_the_discovered_signature() -> None:
    validated = validate_probe_plan(plan(), SIGNATURE, {"sample.core:normalize"})

    assert validated.relation_type == "permutation_invariance"


def test_scheduling_prefers_stronger_relations_then_uncovered_lower_cost_plans() -> None:
    weaker = plan(id="weaker", relation_type="permutation_invariance", budget=1)
    strong_covered = plan(
        id="covered", target_symbol="sample.core:covered", relation_type="partition_concatenation", budget=1
    )
    strong_new = plan(
        id="new", target_symbol="sample.core:new", relation_type="partition_concatenation", budget=4
    )

    scheduled = schedule_probe_plans(
        [weaker, strong_covered, strong_new], {"sample.core:covered": 2}
    )

    assert [item.id for item in scheduled] == ["new", "covered", "weaker"]


@pytest.mark.parametrize(
    ("overrides", "message"),
    [
        ({"target_symbol": "sample.core:unknown"}, "Unknown target"),
        ({"input_domain": {"parameters": {"unknown": [1]}}}, "unknown parameter"),
        ({"input_domain": {"parameters": {"items": [{"code": "import os"}]}}}, "values"),
        ({"relation_type": "made_up"}, "Unsupported relation"),
        ({"relation_parameters": {"parameter": "missing"}}, "parameter"),
        ({"oracle_category": "verdict"}, "oracle category"),
        ({"budget": 99}, "budget"),
    ],
)
def test_rejects_untrusted_or_ineligible_plan_shapes(
    overrides: dict[str, object], message: str
) -> None:
    with pytest.raises(ProbePlanError, match=message):
        validate_probe_plan(plan(**overrides), SIGNATURE, {"sample.core:normalize"})
