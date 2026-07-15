from cross_examine.characterize.edge_catalog import generate_inputs, values_for_annotation


def test_fixed_scalar_and_collection_catalogs() -> None:
    assert values_for_annotation({"kind": "int"}) == [-1, 0, 1, 2, 10]
    assert values_for_annotation({"kind": "str"}) == ["", "a", "é", "🙂"]
    assert values_for_annotation({"kind": "list", "items": {"kind": "int"}}) == [
        [],
        [0],
        [1, -1],
    ]


def test_optional_annotations_include_none_first() -> None:
    assert values_for_annotation({"kind": "optional", "item": {"kind": "int"}}) == [
        None,
        -1,
        0,
        1,
        2,
        10,
    ]


def test_cartesian_inputs_are_stable_and_capped_at_32() -> None:
    signature = {
        "parameters": [
            {
                "name": name,
                "kind": "POSITIONAL_OR_KEYWORD",
                "required": True,
                "annotation": {"kind": "int"},
            }
            for name in ("left", "value", "right")
        ]
    }

    inputs, reason = generate_inputs(signature)

    assert reason is None
    assert len(inputs) == 32
    assert inputs[0] == ([-1, -1, -1], {})
    assert inputs[1] == ([-1, -1, 0], {})


def test_unsupported_required_parameter_abstains() -> None:
    inputs, reason = generate_inputs(
        {
            "parameters": [
                {
                    "name": "callback",
                    "kind": "POSITIONAL_OR_KEYWORD",
                    "required": True,
                    "annotation": {"kind": "unsupported", "display": "Callable"},
                }
            ]
        }
    )

    assert inputs == []
    assert reason == "unsupported required parameter: callback (Callable)"
