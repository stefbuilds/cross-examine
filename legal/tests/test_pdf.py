from __future__ import annotations

import shlex
from pathlib import Path

import pytest

from cross_examine_legal import (
    CheckOutcome,
    IngestError,
    PageStatus,
    QuoteAt,
    extract_pdf_v1,
    run_check,
)
from cross_examine_legal.cli import main as cli_main


def make_pdf(pages: list[str | None], labels: str | None = None) -> bytes:
    """Minimal deterministic PDF: one Helvetica text line per page (None = image-only page)."""

    objs: list[bytes] = []
    n = len(pages)
    page_ids = [4 + 2 * i for i in range(n)]
    labels_obj = f" /PageLabels {labels}" if labels else ""
    objs.append(f"<< /Type /Catalog /Pages 2 0 R{labels_obj} >>".encode())
    objs.append(f"<< /Type /Pages /Kids [{' '.join(f'{p} 0 R' for p in page_ids)}] /Count {n} >>"
                .encode())
    objs.append(b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>")
    for text in pages:
        content = b"" if text is None else (
            b"BT /F1 12 Tf 72 720 Td (" + text.replace("(", r"\(").replace(")", r"\)").encode()
            + b") Tj ET")
        cid = len(objs) + 2
        objs.append(f"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents {cid} 0 R "
                    f"/Resources << /Font << /F1 3 0 R >> >> >>".encode())
        objs.append(b"<< /Length " + str(len(content)).encode() + b" >>\nstream\n" + content
                    + b"\nendstream")
    out = bytearray(b"%PDF-1.7\n")
    offsets = []
    for i, body in enumerate(objs, start=1):
        offsets.append(len(out))
        out += f"{i} 0 obj\n".encode() + body + b"\nendobj\n"
    xref = len(out)
    out += f"xref\n0 {len(objs) + 1}\n0000000000 65535 f \n".encode()
    out += b"".join(f"{o:010d} 00000 n \n".encode() for o in offsets)
    out += f"trailer\n<< /Size {len(objs) + 1} /Root 1 0 R >>\nstartxref\n{xref}\n%%EOF\n".encode()
    return bytes(out)


class Res:
    def __init__(self, sv):
        self.sv = sv

    def source(self, sha):
        return self.sv if sha == self.sv.sha256 else None

    def manifest(self, sha):
        return None


def test_pdf_text_layer_pages_and_bates_labels() -> None:
    pdf = make_pdf(["The supervisor left the console at 14:02.", None, "Ticket closed by night shift."],
                   labels="<< /Nums [0 << /P (ACME-) /St 41 /S /D >>] >>")
    sv = extract_pdf_v1("DEP", 1, pdf)
    assert sv.extractor == "pdf-v1" and len(sv.pages) == 3
    assert sv.pages[0].status is PageStatus.EXTRACTED
    assert "supervisor left the console" in sv.pages[0].text
    assert sv.pages[0].printed_label == "ACME-41" and sv.pages[2].printed_label == "ACME-43"
    assert sv.pages[1].status is PageStatus.UNREADABLE and "OCR" in (sv.pages[1].reason or "")
    assert any("page 1" in r for r in sv.rejected)


def test_quote_in_pdf_and_unreadable_page_keeps_absence_incomplete(tmp_path: Path, capsys) -> None:
    pdf = make_pdf(["The supervisor left the console at 14:02.", None])
    sv = extract_pdf_v1("DEP", 1, pdf)
    quote = sv.pages[0].text.strip().split("\n")[0]
    ok = run_check(QuoteAt(sv.sha256, quote, page=0), Res(sv))
    assert ok.outcome is CheckOutcome.VERIFIED and "extractor pdf-v1" in ok.output
    missing = run_check(QuoteAt(sv.sha256, "never said"), Res(sv))
    assert missing.outcome is CheckOutcome.INCOMPLETE  # page 1 could not be read
    (tmp_path / "sha256").mkdir()
    (tmp_path / "sha256" / sv.sha256).write_bytes(pdf)
    for stored in (ok, missing):
        status = cli_main(shlex.split(stored.command)[1:] + ["--blobs", str(tmp_path)])
        assert capsys.readouterr().out == stored.output and status == stored.exit_status


def test_garbage_and_oversized_pdfs_are_rejected() -> None:
    with pytest.raises(IngestError, match="unreadable PDF"):
        extract_pdf_v1("X", 1, b"%PDF-1.7 this is not really a pdf")
    with pytest.raises(IngestError, match="page limit"):
        extract_pdf_v1("X", 1, make_pdf(["a", "b", "c"]), max_pages=2)
