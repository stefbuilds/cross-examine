# CrossExamine-Bench

CrossExamine-Bench is a provenance-first benchmark for behavioral regressions in AI-authored or AI-assisted Python changes. The benchmark is designed around a stricter rule than ordinary bug corpora: a case is only promoted to the verified split when the repository revision pair is immutable and the behavioral difference is backed by executable base/head evidence.

## What this release contains

The initial verified split contains the deterministic Cross-Examine hero regression used by the project itself: `normalizer.core:normalize([])` returns `[]` on the base revision and `null`/`None` on the head revision while non-empty examples remain unchanged. Cross-Examine's Layer A replay and Layer B adversarial search both identify `[]` as a reproducing counterexample.

A separate `compatibility_shadow` split records three July 2026 public-repository trials. These are intentionally **not benchmark truth**: they were manually characterized compatibility observations and are preserved only to document system behavior and known support boundaries.

## Intended tasks

- behavioral regression detection
- test-suite blind-spot analysis
- base/head differential verification
- counterexample generation and shrinking
- abstention calibration for unsupported changes

## Record fields

Each JSONL row includes:

- `case_id`: stable benchmark identifier
- `split`: `verified` or `compatibility_shadow`
- `repository`: source repository or fixture identifier
- `base_ref`, `head_ref`: immutable refs where available
- `target_symbol`: callable under examination
- `claim`: behavioral property under test
- `repro_input`: minimal or representative reproducing input
- `expected`, `actual`: base/head serialized outcomes where applicable
- `outcome`: verified/refuted/unverifiable observation
- `verdict`: Cross-Examine aggregate verdict when applicable
- `evidence_hashes`: hashes binding executed commands to captured output
- `provenance`: how the case was produced and what it may legitimately support

The machine-readable contract is in [`schema.json`](schema.json).

## Evaluation protocol

For a detector evaluated on the verified split:

1. check out the exact base/head revisions or bundled fixture;
2. run the detector without access to the benchmark label;
3. record whether it identifies a behavioral difference;
4. if it emits a counterexample, record whether the counterexample reproduces the base/head divergence;
5. score unsupported or non-executable cases separately from incorrect predictions.

Do not score the `compatibility_shadow` split as labeled regression ground truth.

## Metrics

Recommended metrics as the verified set grows:

- regression recall: fraction of verified regressions detected;
- counterexample validity: fraction of emitted examples that reproduce the divergence;
- abstention precision: fraction of abstentions attributable to a documented support boundary;
- false-alarm rate on verified-preservation cases;
- median time-to-counterexample.

The first release is deliberately small and should be treated as a **seed benchmark and data contract**, not as evidence of broad model rankings.

## Provenance

The verified hero row is derived from the checked-in `src/cross_examine/fixture_data/broken.json` execution capture. Evidence hashes are copied from the corresponding receipts. Historical public-repository observations are summarized from `docs/trials.md` and explicitly retain that document's limitations.

## Licensing

Benchmark metadata in this directory is released under CC BY 4.0. Source code remains under the repository's MIT license. Third-party repositories referenced by compatibility records retain their original licenses; no third-party source code is redistributed in the dataset.

## Citation

If you use this benchmark, cite the Cross-Examine software release and identify the benchmark version used. Citation metadata is available in the repository root as `CITATION.cff`.
