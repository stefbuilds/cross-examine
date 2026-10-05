"""`cross-examine-legal check …` — replay a recorded check against stored originals.

Originals and manifests are read from a content-addressed directory
(`--blobs DIR` or $CROSS_EXAMINE_LEGAL_BLOBS) laid out as `DIR/sha256/<hex>`.
Prints the captured output and exits 0 (verified), 1 (refuted), 2 (incomplete),
64 on a usage error.
"""

from __future__ import annotations

import argparse
import json
import os
import sys
from pathlib import Path

from cross_examine_legal.cross_examine import decode_quote, decode_request, run_check, run_typed
from cross_examine_legal.ingest import IngestError, extract
from cross_examine_legal.schema import (
    EvidenceProcessed,
    QuoteAt,
    RecordManifest,
    SourceCurrent,
    SourceVersion,
)


class BlobResolver:
    def __init__(self, root: Path, extractor: str | None) -> None:
        self.root = root
        self.extractor = extractor

    def _read(self, sha256: str) -> bytes | None:
        path = self.root / "sha256" / sha256
        return path.read_bytes() if path.is_file() else None

    def source(self, sha256: str) -> SourceVersion | None:
        data = self._read(sha256)
        if data is None or self.extractor is None:
            return None
        try:
            return extract("replay", 0, data, "text/plain", self.extractor)
        except IngestError:
            return None

    def manifest(self, sha256: str) -> RecordManifest | None:
        data = self._read(sha256)
        if data is None:
            return None
        raw = json.loads(data)
        return RecordManifest(record_version=raw["record_version"], current=raw["current"])


def _sha(value: str) -> str:
    if not value.startswith("sha256:"):
        raise argparse.ArgumentTypeError("expected sha256:<hex>")
    return value.removeprefix("sha256:")


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(prog="cross-examine-legal")
    sub = parser.add_subparsers(dest="cmd", required=True)
    check = sub.add_parser("check")
    check.add_argument("predicate", choices=["quote_at", "source_current", "evidence_processed",
                                             "chronology", "arithmetic"])
    check.add_argument("--source", type=_sha)
    check.add_argument("--request-b64")
    check.add_argument("--extractor")
    check.add_argument("--quote-b64")
    check.add_argument("--page", type=int)
    check.add_argument("--char-start", type=int)
    check.add_argument("--manifest", type=_sha)
    check.add_argument("--blobs", default=os.environ.get("CROSS_EXAMINE_LEGAL_BLOBS"))
    try:
        args = parser.parse_args(argv)
    except SystemExit as exc:
        return 64 if exc.code else 0
    if not args.blobs:
        print("--blobs or CROSS_EXAMINE_LEGAL_BLOBS is required", file=sys.stderr)
        return 64
    extractor = None if args.extractor in (None, "unavailable") else args.extractor
    resolver = BlobResolver(Path(args.blobs), extractor)
    if args.predicate in ("chronology", "arithmetic"):
        if not args.request_b64:
            print("--request-b64 is required", file=sys.stderr)
            return 64
        result = run_typed(decode_request(args.predicate, args.request_b64), resolver,
                           extractor or "text-v1")
        sys.stdout.write(result.output)
        return result.exit_status
    if args.source is None:
        print("--source is required", file=sys.stderr)
        return 64
    if args.predicate == "quote_at":
        if args.quote_b64 is None:
            print("--quote-b64 is required", file=sys.stderr)
            return 64
        req = QuoteAt(args.source, decode_quote(args.quote_b64), args.page, args.char_start)
    elif args.predicate == "source_current":
        if args.manifest is None:
            print("--manifest is required", file=sys.stderr)
            return 64
        req = SourceCurrent(args.source, args.manifest)
    else:
        if args.page is None:
            print("--page is required", file=sys.stderr)
            return 64
        req = EvidenceProcessed(args.source, args.page)
    result = run_check(req, resolver)
    sys.stdout.write(result.output)
    return result.exit_status


if __name__ == "__main__":  # pragma: no cover
    raise SystemExit(main())
