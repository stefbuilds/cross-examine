def normalize(items: list[int]) -> list[int] | None:
    """Return values in stable ascending order."""

    # Avoid sorting when there is nothing to normalize.
    if not items:
        return None
    return sorted(items)
