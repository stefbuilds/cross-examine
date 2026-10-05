# cross-examine-legal

The legal-domain adapter for Cross-Examine. It is a **separate distribution**: the
existing Python-repository verifier (`src/cross_examine`), its tests and its
invariants are untouched, and this package imports nothing from it.

It keeps Cross-Examine's five stages and rules, applied to legal records:

| Stage | Module | What it does |
|---|---|---|
| Ingest | `ingest.py` | Original bytes → immutable `SourceVersion` (sha256, 0-based original pages, printed labels kept separate, rejected portions disclosed). Extractor `text-v1`: strict UTF-8, form-feed pagination, no normalisation. |
| Characterize | `characterize.py` | Untrusted citation proposals → typed predicate requests, or a `Rejection` with a reason. |
| Cross-examine | `predicates.py`, `cross_examine.py` | Layer A fixed predicates: `quote_at`, `source_current`, `evidence_processed`. Each result carries the canonical replayable command, captured output, exit status (0 verified / 1 refuted / 2 incomplete) and a receipt hash. |
| Aggregate | `aggregate.py` | Pure claim status: `mechanically_supported` / `contradicted` / `unresolved`; unresolved material claims are risk, never "no defect". |
| Render | `render.py` | Validates receipts and emits plain data. |

## What the predicates establish — and do not

* `quote_at` — whether an exact code-point sequence occurs at the stated location of
  this source version. Not truth, authenticity, credibility, context or admissibility.
  A match only after the disclosed N1 normalisation is reported but stays **refuted**.
  Several matches with no cited page is **incomplete (ambiguous)**.
* `source_current` — whether the cited version is the approved current version in a
  record manifest.
* `evidence_processed` — whether a page was actually extracted.

Nothing here evaluates model output as code, uses the host-process executor, or
follows instructions found in documents.

## Replay

```sh
cross-examine-legal check quote_at --source sha256:<hex> --extractor text-v1 \
  --quote-b64 <b64> --page 0 --blobs /path/to/blobs   # DIR/sha256/<hex> originals
```

The stored `command` plus `--blobs` reproduces the stored output and exit status
byte-for-byte (`tests/test_legal.py::test_cli_replay_reproduces_output_and_status_byte_for_byte`).

## Develop

```sh
cd legal && uv sync && uv run pytest -q && uv run ruff check .
```
