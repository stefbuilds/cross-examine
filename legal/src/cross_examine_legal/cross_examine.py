"""Stage 3 — Cross-examine: run a fixed predicate and bind it to a receipt.

The recorded `command` is the canonical, replayable CLI invocation. Running it
with `--blobs <dir>` against the same content-addressed originals reproduces the
captured output and exit status byte-for-byte (tested). Execution here is
in-process and pure; no subprocess, shell or model is involved.
"""

from __future__ import annotations

import base64
import shlex
from typing import Protocol

from cross_examine_legal import predicates
from cross_examine_legal.schema import (
    EXIT_STATUS,
    CheckResult,
    EvidenceProcessed,
    PredicateKind,
    PredicateRequest,
    QuoteAt,
    Receipt,
    RecordManifest,
    SourceCurrent,
    SourceVersion,
    evidence_hash,
)

MAX_OUTPUT_CHARS = 8000


class SourceResolver(Protocol):
    """Read-only access to ingested sources and manifests, by digest."""

    def source(self, sha256: str) -> SourceVersion | None: ...

    def manifest(self, sha256: str) -> RecordManifest | None: ...


def encode_quote(quote: str) -> str:
    return base64.urlsafe_b64encode(quote.encode("utf-8")).decode("ascii")


def decode_quote(value: str) -> str:
    return base64.urlsafe_b64decode(value.encode("ascii")).decode("utf-8")


def render_command(req: PredicateRequest, extractor: str | None) -> tuple[str, dict[str, object]]:
    """Canonical argv (as a shell-quoted string) and its parameters."""

    argv = ["cross-examine-legal", "check", req.kind.value, "--source", f"sha256:{req.source_sha256}"]
    params: dict[str, object] = {"source": f"sha256:{req.source_sha256}"}
    if isinstance(req, QuoteAt):
        argv += ["--extractor", extractor or "unavailable", "--quote-b64", encode_quote(req.quote)]
        params |= {"extractor": extractor, "quote": req.quote}
        if req.page is not None:
            argv += ["--page", str(req.page)]
            params["page"] = req.page
        if req.char_start is not None:
            argv += ["--char-start", str(req.char_start)]
            params["char_start"] = req.char_start
    elif isinstance(req, SourceCurrent):
        argv += ["--manifest", f"sha256:{req.manifest_sha256}"]
        params["manifest"] = f"sha256:{req.manifest_sha256}"
    elif isinstance(req, EvidenceProcessed):
        argv += ["--extractor", extractor or "unavailable", "--page", str(req.page)]
        params |= {"extractor": extractor, "page": req.page}
    return shlex.join(argv), params


def run_check(req: PredicateRequest, resolver: SourceResolver) -> CheckResult:
    source = resolver.source(req.source_sha256)
    extractor = source.extractor if source else None
    if isinstance(req, QuoteAt):
        out = predicates.quote_at(source, req)
    elif isinstance(req, SourceCurrent):
        out = predicates.source_current(req.source_sha256, resolver.manifest(req.manifest_sha256),
                                        req)
    elif isinstance(req, EvidenceProcessed):
        out = predicates.evidence_processed(source, req)
    else:  # pragma: no cover - exhaustive over PredicateRequest
        raise TypeError(f"unknown predicate request: {req!r}")

    establishes = predicates.ESTABLISHES[req.kind.value]
    output = "\n".join([*out.lines, f"establishes: {establishes}"])
    truncated = len(output) > MAX_OUTPUT_CHARS
    if truncated:
        output = output[:MAX_OUTPUT_CHARS] + "\n[output truncated]"
    command, params = render_command(req, extractor)
    status = EXIT_STATUS[out.outcome]
    deps = (req.source_sha256,) + (
        (req.manifest_sha256,) if isinstance(req, SourceCurrent) else ()
    )
    return CheckResult(
        kind=PredicateKind(req.kind),
        outcome=out.outcome,
        command=command,
        output=output,
        exit_status=status,
        receipt=Receipt(command, output, status, evidence_hash(command, output, status)),
        source_dependencies=deps,
        parameters=params,
        establishes=establishes,
        detail=out.detail,
        output_truncated=truncated,
    )
