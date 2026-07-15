# Cross-Examine repository guidance

Cross-Examine is an independent verification harness. Preserve the five stages:
Ingest, Characterize, Cross-examine, Aggregate, and Render.

- A verified or refuted finding must contain the exact command and captured output.
- The model may propose schema-constrained claims; deterministic code decides outcomes and verdicts.
- `aggregate()` is pure and must not import IO, model, network, subprocess, database, or framework code.
- Unverifiable preserve-critical behavior resolves toward risk, never safety.
- Layer A must work end-to-end before Layer B is extended.
- Target Python repositories only during Build Week.
- Run `uv run pytest` before committing backend changes.

