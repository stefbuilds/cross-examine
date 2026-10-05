"""Stage 1 — Ingest: original bytes → an immutable, page-addressed SourceVersion.

Supported extractor `text-v1`: UTF-8 plain text (.txt / .md). Pages are separated
by form feed (U+000C), the convention of text exports of paginated records; a file
without form feeds is one page. Text is kept exactly as decoded — no newline,
whitespace or quote normalisation — so quotation predicates can be exact. A
leading UTF-8 byte-order mark is removed and disclosed in `rejected`.

Documents are untrusted data: nothing in their text is interpreted.
"""

from __future__ import annotations

import hashlib
from collections.abc import Iterable

from cross_examine_legal.schema import PageStatus, SourcePage, SourceVersion

TEXT_EXTRACTOR = "text-v1"
TEXT_MEDIA_TYPES = frozenset({"text/plain", "text/markdown"})
PAGE_BREAK = "\f"
BOM = "﻿"


class IngestError(ValueError):
    """The original cannot be ingested at all (nothing is extractable)."""


def sha256_hex(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def extract_text_v1(
    logical_id: str,
    version: int,
    data: bytes,
    media_type: str,
    printed_labels: dict[int, str] | None = None,
) -> SourceVersion:
    """Build a SourceVersion from UTF-8 text bytes. Deterministic in its inputs."""

    if media_type not in TEXT_MEDIA_TYPES:
        raise IngestError(f"unsupported media type for {TEXT_EXTRACTOR}: {media_type}")
    try:
        text = data.decode("utf-8", errors="strict")
    except UnicodeDecodeError as exc:
        raise IngestError(
            f"not valid UTF-8 at byte {exc.start}: the original is preserved but not extracted"
        ) from exc
    rejected: list[str] = []
    if text.startswith(BOM):
        text = text[1:]
        rejected.append("leading UTF-8 byte-order mark removed (1 code point)")
    labels = printed_labels or {}
    pages = tuple(
        SourcePage(
            index=i,
            status=PageStatus.EXTRACTED,
            text=page_text,
            printed_label=labels.get(i),
        )
        for i, page_text in enumerate(text.split(PAGE_BREAK))
    )
    return SourceVersion(
        logical_id=logical_id,
        version=version,
        sha256=sha256_hex(data),
        media_type=media_type,
        extractor=TEXT_EXTRACTOR,
        pages=pages,
        rejected=tuple(rejected),
    )


def extract(
    logical_id: str,
    version: int,
    data: bytes,
    media_type: str,
    extractor: str,
    printed_labels: dict[int, str] | None = None,
) -> SourceVersion:
    """Dispatch on the extractor named in a receipt, so replays use the same one."""

    if extractor == TEXT_EXTRACTOR:
        return extract_text_v1(logical_id, version, data, media_type, printed_labels)
    raise IngestError(f"unknown extractor: {extractor}")


def reject_duplicate_ids(logical_ids: Iterable[str]) -> list[str]:
    """Return logical ids that appear more than once (a manifest must reject them)."""

    seen: set[str] = set()
    dupes: list[str] = []
    for lid in logical_ids:
        if lid in seen and lid not in dupes:
            dupes.append(lid)
        seen.add(lid)
    return dupes
