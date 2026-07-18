import re
from pathlib import Path
from urllib.parse import unquote


REPOSITORY_ROOT = Path(__file__).resolve().parents[2]
AUTHORITATIVE_SURFACES = (
    REPOSITORY_ROOT / "README.md",
    REPOSITORY_ROOT
    / "docs"
    / "superpowers"
    / "plans"
    / "2026-07-18-autonomous-mission-phase-1.md",
    REPOSITORY_ROOT / "docs" / "capability-status.md",
    REPOSITORY_ROOT / "docs" / "research" / "phase-1-roadmap-handoff.md",
    REPOSITORY_ROOT / "docs" / "research" / "autonomous-mission-ledger.md",
)
ALLOWED_CAPABILITY_STATES = {
    "implemented",
    "development-only",
    "blocked external",
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
    capability_status = AUTHORITATIVE_SURFACES[2].read_text(encoding="utf-8")
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
