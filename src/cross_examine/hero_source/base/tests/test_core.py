from normalizer import normalize


def test_normalize_orders_values() -> None:
    assert normalize([3, 1, 2]) == [1, 2, 3]
