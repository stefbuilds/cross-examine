"""Stage 1 — Ingest: original bytes → an immutable, page-addressed SourceVersion.

Extractors (the extractor id is part of every receipt, so replays use the same one):

* `text-v1` — UTF-8 plain text (.txt / .md). Pages are separated by form feed
  (U+000C); a file without form feeds is one page. Text is kept exactly as decoded.
  A leading byte-order mark is removed and disclosed.
* `pdf-v1` — the PDF text layer via pypdf (pinned version). One SourcePage per
  original PDF page (0-based index); printed page labels (e.g. Bates numbers defined
  in /PageLabels) are kept separately. A page with no extractable text is marked
  UNREADABLE ("no text layer — OCR is not supported"), never silently dropped.
  Encrypted PDFs that need a password are rejected.

Documents are untrusted data: nothing in their text is interpreted.
"""

from __future__ import annotations

import hashlib
from collections.abc import Iterable

from cross_examine_legal.schema import PageStatus, SourcePage, SourceVersion

TEXT_EXTRACTOR = "text-v1"
PDF_EXTRACTOR = "pdf-v1"
PDF_MEDIA_TYPES = frozenset({"application/pdf"})
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


def extract_pdf_v1(
    logical_id: str,
    version: int,
    data: bytes,
    printed_labels: dict[int, str] | None = None,
    max_pages: int = 2000,
) -> SourceVersion:
    """Build a SourceVersion from a PDF's text layer. Deterministic for a pinned pypdf."""

    import io

    from pypdf import PdfReader
    from pypdf.errors import PdfReadError

    try:
        reader = PdfReader(io.BytesIO(data), strict=False)
        if reader.is_encrypted and not reader.decrypt(""):
            raise IngestError("encrypted PDF: a password is required; the original is kept")
        n = len(reader.pages)
    except IngestError:
        raise
    except (PdfReadError, ValueError, KeyError, TypeError, OSError) as exc:
        raise IngestError(f"unreadable PDF ({type(exc).__name__}); the original is kept") from exc
    if n > max_pages:
        raise IngestError(f"{n} pages exceeds the {max_pages}-page limit")
    try:
        labels = list(reader.page_labels)
    except Exception:  # noqa: BLE001 - malformed /PageLabels: fall back to none
        labels = []
    overrides = printed_labels or {}
    pages: list[SourcePage] = []
    rejected: list[str] = []
    for i, page in enumerate(reader.pages):
        label = overrides.get(i) or (labels[i] if i < len(labels) and labels[i] != str(i + 1)
                                     else None)
        try:
            text = page.extract_text() or ""
        except Exception as exc:  # noqa: BLE001 - one bad page must not sink the document
            pages.append(SourcePage(i, PageStatus.UNREADABLE, "", label,
                                    f"text extraction failed ({type(exc).__name__})"))
            rejected.append(f"page {i}: text extraction failed")
            continue
        if not text.strip():
            pages.append(SourcePage(i, PageStatus.UNREADABLE, "", label,
                                    "no text layer — OCR is not supported"))
            rejected.append(f"page {i}: no text layer (OCR is not supported)")
            continue
        pages.append(SourcePage(i, PageStatus.EXTRACTED, text, label))
    return SourceVersion(
        logical_id=logical_id,
        version=version,
        sha256=sha256_hex(data),
        media_type="application/pdf",
        extractor=PDF_EXTRACTOR,
        pages=tuple(pages),
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
    if extractor == PDF_EXTRACTOR:
        return extract_pdf_v1(logical_id, version, data, printed_labels)
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
