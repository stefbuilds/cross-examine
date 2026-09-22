import re
from pathlib import Path
from urllib.parse import unquote


REPOSITORY_ROOT = Path(__file__).resolve().parents[2]
AUTHORITATIVE_SURFACES = (
    REPOSITORY_ROOT / "README.md",
    REPOSITORY_ROOT / "docs" / "capability-status.md",
)
CAPABILITY_STATUS = REPOSITORY_ROOT / "docs" / "capability-status.md"
ALLOWED_CAPABILITY_STATES = {
    "implemented",
    "future",
}
MARKDOWN_LINK = re.compile(r"(?<!!)\[(?:[^\[\]]|\[[^\]]*\])*\]\(([^)\n]+)\)")
MARKDOWN_IMAGE = re.compile(r"!\[[^\]]*\]\(([^)\n]+)\)")
ATX_HEADING = re.compile(r"^#{1,6}\s+(.+?)\s*#*\s*$")
URI_SCHEME = re.compile(r"^[A-Za-z][A-Za-z0-9+.-]*:")


def _assert_authoritative_surfaces_exist() -> None:
    missing = [
        str(surface.relative_to(REPOSITORY_ROOT))
        for surface in AUTHORITATIVE_SURFACES
        if not surface.is_file()
    ]
    assert not missing, f"Missing authoritative documentation surfaces: {', '.join(missing)}"


def _link_destination(raw_destination: str) -> str:
    destination = raw_destination.strip()
    if destination.startswith("<"):
        return unquote(destination[1 : destination.index(">")])
    return unquote(destination.split(maxsplit=1)[0])


def _github_heading_slug(heading: str) -> str:
    heading = re.sub(r"<[^>]+>", "", heading)
    heading = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", heading)
    heading = re.sub(r"[^\w\- ]", "", heading.lower())
    return heading.strip().replace(" ", "-")


def _same_document_heading_slugs(markdown: str) -> set[str]:
    occurrences: dict[str, int] = {}
    slugs: set[str] = set()
    for line in markdown.splitlines():
        match = ATX_HEADING.match(line)
        if match is None:
            continue
        base_slug = _github_heading_slug(match.group(1))
        occurrence = occurrences.get(base_slug, 0)
        occurrences[base_slug] = occurrence + 1
        slugs.add(base_slug if occurrence == 0 else f"{base_slug}-{occurrence}")
    return slugs


def _local_destinations(markdown: str) -> list[str]:
    destinations = [match.group(1) for match in MARKDOWN_LINK.finditer(markdown)]
    destinations.extend(match.group(1) for match in MARKDOWN_IMAGE.finditer(markdown))
    return destinations


def _capability_matrix_rows(markdown: str) -> tuple[list[str], list[list[str]]]:
    lines = markdown.splitlines()
    for index, line in enumerate(lines):
        if not line.startswith("|"):
            continue
        headers = [cell.strip() for cell in line.strip("|").split("|")]
        if "Capability" not in headers or "Current state" not in headers:
            continue
        rows: list[list[str]] = []
        for row_line in lines[index + 2 :]:
            if not row_line.startswith("|"):
                break
            rows.append([cell.strip() for cell in row_line.strip("|").split("|")])
        return headers, rows
    raise AssertionError("Capability status document has no capability matrix")


def test_authoritative_documentation_surfaces_have_resolving_local_links() -> None:
    _assert_authoritative_surfaces_exist()

    repository_root = REPOSITORY_ROOT.resolve()
    unresolved: list[str] = []
    for surface in AUTHORITATIVE_SURFACES:
        markdown = surface.read_text(encoding="utf-8")
        heading_slugs = _same_document_heading_slugs(markdown)
        for raw_destination in _local_destinations(markdown):
            destination = _link_destination(raw_destination)
            if URI_SCHEME.match(destination) or destination.startswith("//"):
                continue
            file_part, separator, fragment = destination.partition("#")
            if not file_part:
                if not fragment or fragment not in heading_slugs:
                    unresolved.append(f"{surface.relative_to(REPOSITORY_ROOT)} -> {destination}")
                continue
            resolved = (surface.parent / file_part).resolve()
            if not resolved.is_relative_to(repository_root) or not resolved.is_file():
                unresolved.append(f"{surface.relative_to(REPOSITORY_ROOT)} -> {destination}")
            elif separator and not fragment:
                unresolved.append(f"{surface.relative_to(REPOSITORY_ROOT)} -> {destination}")

    assert not unresolved, "Unresolved local Markdown links:\n" + "\n".join(unresolved)


def test_capability_matrix_uses_only_authoritative_current_states() -> None:
    _assert_authoritative_surfaces_exist()
    capability_status = CAPABILITY_STATUS.read_text(encoding="utf-8")
    headers, rows = _capability_matrix_rows(capability_status)
    state_index = headers.index("Current state")

    assert rows, "Capability matrix has no current-state rows"
    invalid_states: set[str] = set()
    for row in rows:
        if len(row) <= state_index:
            invalid_states.add("<missing>")
            continue
        state = row[state_index].strip("`")
        if state not in ALLOWED_CAPABILITY_STATES:
            invalid_states.add(state)
    assert not invalid_states, f"Unsupported capability states: {sorted(invalid_states)}"


def test_offline_hero_commands_and_aggregation_diagram_preserve_truth_boundaries() -> None:
    readme = (REPOSITORY_ROOT / "README.md").read_text(encoding="utf-8")
    demo = (REPOSITORY_ROOT / "docs" / "demo.md").read_text(encoding="utf-8")
    cleared_posix_environment = (
        "env -u OPENAI_API_KEY -u CROSS_EXAMINE_DB -u CROSS_EXAMINE_RUNS "
    )

    assert cleared_posix_environment in readme
    assert demo.count(cleared_posix_environment) == 2
    assert "Remove-Item Env:CROSS_EXAMINE_DB -ErrorAction SilentlyContinue" in readme
    assert "Remove-Item Env:CROSS_EXAMINE_RUNS -ErrorAction SilentlyContinue" in readme
    assert 'AG -- "preserve-critical refutation" --> BROKEN' in readme
    assert 'AG -- "other refutation, critical abstain" --> RISKY' in readme
    assert 'AG -- "none of the above" --> SAFE' in readme


def test_bounded_safe_docs_match_pure_aggregate_semantics() -> None:
    surfaces = (
        REPOSITORY_ROOT / "README.md",
        REPOSITORY_ROOT / "docs" / "architecture.md",
        REPOSITORY_ROOT / "docs" / "capability-status.md",
        REPOSITORY_ROOT / "docs" / "submission.md",
    )
    # Every public surface must say that SAFE is bounded rather than a proof of
    # correctness. The long form is the precise engineering statement; the short form is
    # the plain-language equivalent used where a reader needs the point, not the mechanism.
    accepted_boundaries = (
        "no represented refutation, no critical abstention, and no missing critical claim",
        "means bounded, not proven",
    )

    for surface in surfaces:
        markdown = surface.read_text(encoding="utf-8")
        normalized = " ".join(markdown.split())
        assert any(boundary in normalized for boundary in accepted_boundaries), (
            f"{surface.relative_to(REPOSITORY_ROOT)} must state that SAFE is bounded "
            "rather than proof of correctness"
        )


def test_public_receipt_claims_disclose_the_unvalidated_read_path() -> None:
    # A stored report written by an older build is rendered without being revalidated.
    # This only affects pre-existing databases, never a fresh run, so it belongs in the
    # engineering docs rather than the README.
    surfaces = (
        REPOSITORY_ROOT / "docs" / "architecture.md",
        REPOSITORY_ROOT / "docs" / "submission.md",
    )
    disclosure = "legacy or otherwise unvalidated stored reports are not revalidated on read"

    for surface in surfaces:
        normalized = " ".join(surface.read_text(encoding="utf-8").lower().split())
        assert disclosure in normalized, (
            f"{surface.relative_to(REPOSITORY_ROOT)} must disclose the current "
            "persistence/API/Render validation gap"
        )


def test_quickstart_serves_the_terminal_hero_workspace() -> None:
    readme = (REPOSITORY_ROOT / "README.md").read_text(encoding="utf-8")

    assert 'CROSS_EXAMINE_DB="$hero_workspace/cross-examine.db"' in readme
    assert 'CROSS_EXAMINE_RUNS="$hero_workspace/runs"' in readme
    assert '$env:CROSS_EXAMINE_DB = Join-Path $heroWorkspace "cross-examine.db"' in readme
    assert '$env:CROSS_EXAMINE_RUNS = Join-Path $heroWorkspace "runs"' in readme


