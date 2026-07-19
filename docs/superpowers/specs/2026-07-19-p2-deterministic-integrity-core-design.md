# P2 deterministic integrity core design

## Purpose

Close the local false-safety paths that can be fixed without a model request or any
external authority. This is the first P2 tranche; strict current-pin trial artifacts,
replay, redaction, and one-request accounting remain a separately reviewable P2 tranche.

## Constraints

- Preserve Ingest, Characterize, Cross-examine, Aggregate, and Render as distinct stages.
- Model output remains untrusted proposal data; deterministic code decides outcomes and
  verdicts.
- `aggregate()` remains pure and imports no IO, model, network, subprocess, database, or
  framework code.
- A critical or semantically unverifiable condition resolves to `RISKY`, never `SAFE`.
- Existing supported scalar and list hero behavior remains executable end to end.

## Considered approaches

1. Patch only `aggregate()` to mark every `UNVERIFIABLE` finding `RISKY`. This is small,
   but it conflates observed preservation differences with ordinary unsupported probes and
   does not close coverage, codec, or read-time tampering.
2. Add a separate verifier layer around stored reports. This makes persistence safer but
   leaves the pipeline able to construct false-safe reports and duplicates ownership of
   the existing validation boundary.
3. Recommended: strengthen the existing domain and validation boundaries. Cross-examine
   emits an observed preservation mismatch as a named refutation; the pipeline adds
   deterministic critical coverage abstentions; validation recomputes semantics before
   write/read use; aggregation fallback discards invalid partial evidence; and the probe
   protocol rejects values that JSON cannot represent exactly.

## Architecture

`run_layer_a()` and `run_probe_plans()` will emit `REFUTED` for any observed
preservation relation failure. The pure aggregate function continues to make a critical
refutation `BROKEN` and any non-critical refutation `RISKY`. Immediately after
Characterize, `Pipeline` compares `IngestResult.touched_symbols` with characterized
targets and adds deterministic `system:coverage:` claims/findings for omissions.

`validate_report()` becomes the one semantic gate used before corpus persistence and by
`report_from_json()` on every read. It checks nonempty unique non-reserved model claim
IDs, finding-to-claim linkage, decided receipt grounding, and equality between the
stored verdict and pure recomputation. Aggregation failures create a new one-claim,
one-finding `RISKY` report rather than revalidating the invalid partial evidence.

The probe runner accepts only exact JSON primitives, lists, and string-keyed maps whose
runtime types are the built-in types. Tuple/optional/named/subclass/non-string-key value
paths are rejected at description or result encoding time and therefore surface as
deterministic abstentions rather than refutations.

## Testing and evidence

Every invariant begins with a focused RED test, then minimal implementation and focused
GREEN. The final P2 integrity-core gate includes unit schema/validation/codec tests,
pipeline integration coverage/fallback tests, probe-runner value tests, and the existing
offline hero. No live model request or secret inspection is part of this tranche.

## Scope boundary

This tranche does not invent paid authority, alter the trusted-host executor policy,
introduce setup/corpus lifecycle features, or claim P2 complete. The follow-up P2 trial
artifact tranche owns current implementation pins, strict response artifacts, replay,
redaction, render equality, and explicit G1-blocked evidence.
