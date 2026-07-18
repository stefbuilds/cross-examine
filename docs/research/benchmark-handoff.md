# Frozen benchmark and scoring harness handoff

Status: **implementation-ready design; scored execution BLOCKED on truth isolation and witness-level oracle coverage**  
Research date: 2026-07-18  
Scope: Python repositories, Layer A first, incremental Layer B second  
Only deterministic evaluator code may assign benchmark outcomes.

## 1. Decision

Build two deliberately separate evaluation tracks:

1. **Primary detector qualification** uses frozen, schema-valid claim bundles and a frozen ten-case corpus. It measures Layer A and the incremental value of Layer B without generator variance. It is the release gate.
2. **Secondary end-to-end characterization** regenerates claims from a truth-blind runner pack and reports model variability, tokens, cost, and contamination caveats. It is diagnostic and must not be combined with the primary score.

The qualification corpus is five `COMPATIBLE_IN_SCOPE` cases and five `REGRESSION` cases. Three safe cases intentionally require conservative abstention. Three regression cases are constructed to be invisible to Layer A's current catalog but reachable by Layer B's frozen search domain. This makes the corpus diagnostic rather than merely realistic.

The first release is a qualification gate, not statistical proof of a low population false-refutation rate. With zero false refutations in five compatible cases, the one-sided exact 95% upper bound is 45.1%.

Do not score public compatibility trials as safe ground truth merely because their tests pass. A passing suite is not a total oracle for a zero-false-refutation claim. Keep those trials as an external-validity shadow set until their observable scope has an executable total predicate.

## 2. Non-negotiable safety properties

The benchmark must preserve the product's five stages: Ingest, Characterize, Cross-examine, Aggregate, and Render. The benchmark evaluator is outside those stages and never changes `aggregate()`.

- A decided product finding still requires the exact command, captured output, and valid receipts.
- A benchmark refutation is credited only after a separate evaluator replays its witness and classifies it executablely.
- The model may propose claims and probe plans. It may not supply labels, expected behavior, oracle code, benchmark outcomes, or acceptance decisions.
- `aggregate()` remains pure and must not import the benchmark runner, oracle, IO, model, network, subprocess, database, or framework code.
- `UNVERIFIABLE` is first-class. It is neither a true negative nor a false negative until the hidden evaluator maps the case.
- Layer B's “no counterexample in 60 examples” is `NO_REFUTATION_FOUND` for benchmark purposes, never proof of compatibility.
- Any refutation that the evaluator cannot classify is an `UNVALIDATED_REFUTATION` and fails the hard safety gate.
- A valid refutation on a regression case cannot hide a second false or unvalidated refutation.
- The generator and evaluator must be separate packages, processes, images, mounts, credentials, and writable roots.

## 3. Current evidence inventory and gaps

### Existing evidence

The repository currently contains:

- one deterministic hero regression that Layer A detects at `[]` and Layer B also finds;
- three compatibility trials in `docs/trials.md`:
  - `python-slugify`, which completed and produced a `SAFE` report;
  - `humanize`, which conservatively abstained because generated import metadata and dependencies were unavailable;
  - `validators`, which conservatively abstained on non-JSON results and missing optional dependencies;
- deterministic Layer A catalogs capped at 32 inputs per claim;
- Layer B using Hypothesis 6.156.6, `derandomize=True`, `database=None`, `max_examples=60`, value domains bounded in `hypothesis_worker.py`, and an eight-second child-probe timeout;
- relation-plan coverage for idempotence/normalization stability, permutation invariance, and partition/concatenation consistency;
- base/head repository-test comparison that refutes only when base passes and head fails for a non-environmental reason;
- corpus pinning of verified Layer A checks only;
- receipt hashes and validation for decided findings in the current working tree.

The trials are compatibility and failure-semantics evidence. They are not a frozen benchmark: the claims were manually supplied, their labels are not hidden executable truth, A and A+B share a mutable corpus database, dependency state is not content-addressed, and there is no finding-level evaluator replay.

### Missing benchmark dimensions, in priority order

| Priority | Missing dimension | Why it matters |
| --- | --- | --- |
| P0 | Compatible cases with total executable witness classification | Required to make “false refutation” decidable rather than editorial. |
| P0 | Separate target and evaluator isolation | The current trusted host-process adapter lets target code read any truth pack on the host. |
| P0 | Finding-level witness replay | Case labels alone allow false-refutation laundering on regression cases. |
| P0 | Fresh, identical state for A and A+B | Current trials let A pin corpus entries that A+B can inherit. |
| P0 | B-only regression cases | The hero is already found by A and cannot prove incremental B value. |
| P1 | Intended-change safe cases | Any differential is not automatically a regression. |
| P1 | Required-abstention cases | Missing dependencies, non-JSON values, receivers, generators, and environment failures must stay distinct. |
| P1 | Frozen source, runtime, dependency, and search identities | Commit SHAs alone do not make remote dependencies or Hypothesis behavior reproducible. |
| P1 | Stage resource and model-usage telemetry | Current reports do not expose search examples, shrink steps, stage CPU/RSS, or token usage. |
| P1 | Leakage-resistant claims | Manual claims can name the exact hidden behavior and become answer keys. |
| P2 | Diverse real repositories | The current public evidence is small and support-boundary-heavy. |
| P2 | Larger independent compatible set | Five safe cases cannot support a population-level safety claim. |

## 4. Threat model and current blockers

### BLOCKED-1: evaluator truth isolation

`execution.py` is intentionally a bounded host-process adapter, not a sandbox. Target code retains the host user's filesystem and network authority. A truth file that is merely placed elsewhere on the same host is not hidden.

Before a scored run, implement a one-way boundary:

1. A disposable, network-off target container/VM mounts only the runner pack and an empty output directory.
2. It emits a signed, content-addressed result bundle.
3. A separate evaluator container, which never executes target code, mounts the result bundle and evaluator truth pack read-only.
4. No oracle, label, upstream mapping, hidden witness, secret, evaluator binary, or truth digest path may occur in the target image layers, mounts, cwd ancestors, environment, argv, temp/cache directories, logs, or writable volumes.

Until this exists, corpus construction and local qualification development may proceed with trusted synthetic targets, but results must be labeled `UNBLINDED_DEVELOPMENT`; they cannot satisfy the scored release gate.

### BLOCKED-2: total witness oracle coverage

Every emitted `REFUTED` finding must be replayed by the evaluator. The witness oracle returns exactly one of:

- `PROHIBITED`: the witness demonstrates the independently specified regression;
- `ALLOWED`: the observed difference is permitted or intended, so the product finding is a false refutation;
- `OUT_OF_DOMAIN`: the witness is outside the case's declared scored domain;
- `ORACLE_ERROR`: the evaluator could not decide.

`OUT_OF_DOMAIN`, `ORACLE_ERROR`, missing witnesses, missing raw evidence, and replay mismatch become `UNVALIDATED_REFUTATION`, not abstention. They fail the hard safety gate.

A `COMPATIBLE_IN_SCOPE` case is admissible only when its evaluator can classify every witness the frozen Layer A and Layer B generators can emit. A `REGRESSION` case is admissible when an independent executable oracle accepts the good/base tree, rejects the bad/head tree, and identifies at least one `PROHIBITED` witness. All oracle code must have a mutation control: accept the good tree and reject the known bad tree. If those conditions cannot be made executable, the case is `BLOCKED` and excluded from scored denominators.

## 5. Corpus artifact layout and trust separation

Use three signed artifacts, not one all-powerful manifest:

```text
benchmarks/cross-examine-q1-v1/
├── release.json                 # public hash commitment and policy only
├── runner/
│   ├── manifest.json            # target-visible allowlisted fields
│   ├── claims/<case-id>.json    # frozen detector-track claims
│   ├── repos/<case-id>.bundle   # self-contained Git bundles
│   └── wheelhouse/              # fully locked offline dependencies
└── evaluator/                   # never mounted into target execution
    ├── truth.json
    ├── oracles/<oracle-id>.py
    ├── public-source-map.json
    └── price-table.json
```

The build tool that creates source bundles belongs under `tools/benchmark_corpus/` and must not be importable by `src/cross_examine/benchmark/`. The evaluator must not import generator code, Cross-Examine reports as truth, model clients, or target modules.

`release.json` commits to SHA-256 digests of the runner and evaluator packs. During a blind run, the target receives only the runner pack. After a qualification version is unsealed or used for tuning, increment the corpus major version before treating another run as held-out.

## 6. Manifest contract

### `release.json`

Required fields:

```json
{
  "schema_version": 1,
  "corpus_id": "cross-examine-q1-v1",
  "status": "candidate|frozen|retired",
  "created_at": "RFC3339 UTC",
  "runner_pack_sha256": "64 lowercase hex",
  "evaluator_pack_sha256": "64 lowercase hex",
  "runner_manifest_sha256": "64 lowercase hex",
  "truth_manifest_sha256": "64 lowercase hex",
  "harness_commit": "40 lowercase hex",
  "harness_tree": "40 lowercase hex",
  "uv_lock_sha256": "64 lowercase hex",
  "container_image_digest": "sha256:<64 hex>",
  "price_schedule_id": "frozen identifier",
  "policy": {
    "repetitions": 3,
    "python": "3.12.13",
    "hypothesis": "6.156.6",
    "pytest": "9.1.1",
    "timezone": "UTC",
    "locale": "C.UTF-8",
    "network": "disabled",
    "cpu_limit": 2,
    "memory_mib": 4096,
    "writable_disk_mib": 1024,
    "pids_limit": 256,
    "command_timeout_seconds": 120,
    "common_run_budget_seconds": 600,
    "layer_b_increment_seconds": 120,
    "oracle_timeout_seconds": 30,
    "output_limit_bytes": 2097152
  }
}
```

The current `uv.lock` digest observed during research is `227cae3f4c422207b3d1788992f4d9ad25da6fd1a2936703961840d5264de052`. This is evidence for the handoff only; regenerate and freeze it from the clean implementation commit rather than copying it blindly.

### Runner case manifest

Use an allowlist schema with `additionalProperties: false`. Each case contains:

```json
{
  "id": "cxq-001",
  "priority": 0,
  "source": {
    "bundle_path": "repos/cxq-001.bundle",
    "bundle_sha256": "required value matching ^[0-9a-f]{64}$",
    "bundle_prerequisites": [],
    "base_commit": "40 hex",
    "base_tree": "40 hex",
    "head_commit": "40 hex",
    "head_tree": "40 hex",
    "license_spdx": "MIT",
    "license_blob": "40 hex"
  },
  "target": {
    "symbols": ["subject.core:flag"],
    "python_files": ["src/subject/core.py"]
  },
  "claim_bundle_path": "claims/cxq-001.json",
  "claim_bundle_sha256": "required value matching ^[0-9a-f]{64}$",
  "initial_corpus_db_sha256": "required value matching ^[0-9a-f]{64}$",
  "environment": {
    "pythonpath": ["src"],
    "environment_allowlist": ["LANG", "LC_ALL", "LC_CTYPE", "PATH", "PYTHONPATH", "TZ"],
    "dependency_lock_sha256": "required value matching ^[0-9a-f]{64}$"
  },
  "budgets": {
    "command_seconds": 120,
    "common_run_seconds": 600,
    "layer_b_increment_seconds": 120,
    "max_examples": 60,
    "probe_seconds": 8
  }
}
```

Forbidden runner fields include `label`, `truth`, `oracle`, `expected`, `bad`, `good`, `difficulty`, `layer_b_only`, `witness`, upstream URL/SHA, issue/PR text, commit message, fixing test, or gold output.

### Evaluator truth manifest

Each evaluator-only entry contains:

```json
{
  "case_id": "cxq-001",
  "admission": "candidate|admitted|blocked",
  "blocked_reason": null,
  "label": "COMPATIBLE_IN_SCOPE|REGRESSION",
  "behavior_ids": ["stable-flag-v1"],
  "oracle": {
    "id": "stable-flag-v1",
    "path": "oracles/stable_flag_v1.py",
    "sha256": "required value matching ^[0-9a-f]{64}$",
    "argv": ["python", "oracles/stable_flag_v1.py", "--worktree", "{worktree}", "--witness", "{witness_json}"],
    "cwd": "/evaluator",
    "environment": {"LANG": "C.UTF-8", "LC_ALL": "C.UTF-8", "TZ": "UTC"},
    "timeout_seconds": 30,
    "domain_id": "bool-complete-v1"
  },
  "admission_receipts": {
    "base": {"command": "exact rendered command", "output": "exact captured output", "evidence_hash": "required 64-hex digest"},
    "head": {"command": "exact rendered command", "output": "exact captured output", "evidence_hash": "required 64-hex digest"},
    "mutant": {"command": "exact rendered command", "output": "exact captured output", "evidence_hash": "required 64-hex digest"}
  },
  "upstream": {
    "repository": "evaluator-only URL or null",
    "base_commit": "40 hex or null",
    "head_commit": "40 hex or null",
    "oracle_blob": "40 hex or null"
  }
}
```

No `candidate` or `blocked` case enters score denominators. Blocked cases remain in the audit report so setup failures cannot be silently dropped.

## 7. Initial balanced ten-case qualification corpus

These are hermetic microrepositories because current v1 support is function-level, annotation-driven, and JSON-oriented. Public real-world cases mostly exercise unsupported receivers, iterators, old Python runtimes, installation hooks, or non-JSON objects; using only those would benchmark abstention rather than Layer B search.

The corpus builder must create one neutral Git repository per case, with no remote, issue text, gold tests, revealing commit messages, or truth files. It records the resulting full commit/tree IDs and bundle SHA-256 in the manifest. The evaluator oracle is outside each repository. Cases remain `candidate` until admission receipts are captured; none is presumed admitted by this document.

| ID | Truth | Exact target behavior | Evaluator domain/oracle | Expected A | Expected A+B | Purpose |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `cxq-001` | compatible | `flag(value: bool) -> bool`; base `not value`, head `value is False` | exhaustive `{false,true}`; all witnesses `ALLOWED` | `CLEAR/SAFE` | `CLEAR/SAFE` | finite-domain safe refactor |
| `cxq-002` | compatible | `double(value: int) -> int`; base `value * 2`, head `value + value` | exhaustive frozen generator domain `[-100,100]` | `CLEAR/SAFE` | `CLEAR/SAFE` | bounded numeric safe refactor |
| `cxq-003` | compatible | `mode(enabled: bool) -> str`; base always `legacy`, head `modern` iff enabled | intended table: base `{F:legacy,T:legacy}`, head `{F:legacy,T:modern}` | `ABSTAIN/RISKY` | `ABSTAIN/RISKY` | intended change must not refute |
| `cxq-004` | compatible | `parse(value: int) -> int`; both import `benchmark_missing_dependency` before returning | exhaustive `[-100,100]`; both must raise canonical `ModuleNotFoundError` | `ABSTAIN/RISKY` | `ABSTAIN/RISKY` | missing runtime dependency |
| `cxq-005` | compatible | `tags(enabled: bool) -> set[str]`; both return `{'on'}` or empty set | exhaustive bool; evaluator canonicalizes set to sorted list | `ABSTAIN/RISKY` | `ABSTAIN/RISKY` | non-JSON result boundary |
| `cxq-006` | regression | `normalize(list[int])`; base sorts, head returns `None` for empty | witness `[]`: base `[]`, head `null` => `PROHIBITED` | `REFUTE/BROKEN` | `REFUTE/BROKEN` | Layer A empty boundary |
| `cxq-007` | regression | `parse(int)`; base raises `ValueError('negative')` below zero, head returns `abs(value)` | witness `-1`: exception versus `1` => `PROHIBITED` | `REFUTE/BROKEN` | `REFUTE/BROKEN` | Layer A exception semantics |
| `cxq-008` | regression | `identity(int)`; base returns value, head returns `0` only for `7` | witness `7` => `PROHIBITED`; all other frozen ints allowed | `CLEAR/SAFE` | `REFUTE/BROKEN` | B-only integer search |
| `cxq-009` | regression | `normalize(list[int])`; base sorts, head returns input unchanged only at length three | witness `[3,1,2]` => `PROHIBITED` | `CLEAR/SAFE` | `REFUTE/BROKEN` | B-only list-size search/shrink |
| `cxq-010` | regression | `normalize(str)`; base identity, head uppercases values outside `{'','a','é','🙂'}` | witness `"b"` and any changed value => `PROHIBITED`; catalog values allowed | `CLEAR/SAFE` | `REFUTE/BROKEN` | B-only string search beyond catalog |

Frozen claims:

- `cxq-003` is `kind=intended_change`, `preserve_critical=false`.
- All other cases have one `kind=preservation`, `preserve_critical=true` claim on the listed target.
- No case has a probe plan; otherwise current Layer B deliberately skips it.
- Claim text and IDs must be generated from the truth-blind runner pack, signed, frozen before evaluator truth is unsealed, and reused byte-for-byte in both arms. Human edits after oracle exposure invalidate the bundle.

Admission-specific requirements:

- `cxq-001` through `cxq-005`: the oracle must classify every witness in the exact frozen generator domain. If the generator domain changes, increment the oracle and corpus version.
- `cxq-006` through `cxq-010`: the oracle must accept the base/good behavior, reject the head/bad behavior, and reject an independently produced control mutant.
- `cxq-008` through `cxq-010`: three clean qualification replays must prove A finds no valid witness and A+B finds a stable valid witness within the frozen budget. If not, redesign or block the case; do not edit expected results after unsealing.

This case mix intentionally gives the expected detector transition counts `g=3`, `h=0`: three regression cases move from no valid A refutation to a valid A+B refutation, with no losses.

## 8. Public-repository shadow and expansion set

Public repositories supply realism and immutable provenance, but safe cases remain non-scored until their compatible scope is total and executable. Preserve full Git bundles and upstream oracle blobs, not just URLs.

| Priority | Candidate | Immutable refs | Oracle | Admission status |
| --- | --- | --- | --- | --- |
| P0 | `python-slugify` typing change, `slugify.slugify:slugify` | `45f9d33a3a0d7302120d2dde26fa2ac6131edb6b` → `1ef698fa7a265ec8971d0b641fb6e735dcd667dc` | frozen upstream pytest plus `text-unidecode` | `BLOCKED` for compatible denominator: passing tests are not total; retain as shadow compatibility trial |
| P0 | `more-itertools` empty `interleave_evenly`, intended change | `5d946b3590bfe92f1465c1b9b9830dd434745c84` → `f51a53bfd2fe9504063a33ef5f4a73e30d82d0e2` | frozen `TestInterleaveEvenly::test_no_iterables` blob | candidate intended-change abstention; iterator serialization/support must be explicit |
| P0 | reverse `boltons.strutils:singularize` fix | fixed `1e61524a798ea73632029a013a7686036d5c126f` → buggy `55dfe5077bcb5fa76611b5f2a557ea6c442ad87c` | frozen `test_singularize_double_s` from fixed commit | regression candidate; likely current B miss without suffix-biased strategy |
| P0 | reverse `boltons.iterutils:split` fix | fixed `4aa77cddb5d06def130df6f09aefab4018fa487c` → buggy `3970a80f63807392e512340c25dc2db473bcba70` | frozen `test_maxsplit_zero_returns_unsplit_values` | regression candidate; iterator arm must abstain |
| P1 | reverse `more-itertools` running stability fix | fixed `d992be0de9383ddcaae3a24866a2d96b52132b07` → buggy `cb75bb9c55f7ed3e77ce599097e1ba8da411746d` | frozen running-min/max stability tests | regression candidate; `Fraction`/type identity is unsupported and should abstain |
| P1 | current `humanize` and `validators` trials | refs already recorded in `docs/trials.md` | existing commands plus frozen dependency/runtime packs | quarantine until setup/install and JSON-result boundaries are resolved |

For reverse-fix cases, the fixed revision is benchmark base/good and the buggy parent is head/bad. Freeze the fixing test by Git blob SHA in the evaluator pack; never copy it into the runner-visible repository. Keep reverse/fix siblings in the same lineage cluster and never split them across development and qualification sets.

[BugsInPy](https://github.com/soarsmu/BugsInPy) is a useful future source of 493 curated Python defects, but each candidate still needs filtering for Python 3.12, function-level targets, annotations, deterministic setup, executable witness classification, and redistribution metadata. Dataset membership is not itself ground truth for Cross-Examine's observable scope.

## 9. Frozen run protocol

### Preflight and admission

1. Verify `release.json` signatures/digests, `git bundle verify`, bundle SHA-256, full commit/tree IDs, lock/wheelhouse hashes, image digest, and policy values with network disabled.
2. Materialize base and head into separate evaluator-only clean roots and run the admission oracle. Capture exact argv, rendered command, raw stdout/stderr, exit code, timeout/truncation, tree hash, executable/image digest, and evidence hash.
3. Run the oracle mutation control. Any mismatch makes the case `BLOCKED`; never convert an oracle failure to product abstention.
4. Verify the frozen claim bundle was produced from the runner pack before truth unseal and contains no truth fields, paths, expected outputs, issue/PR prose, commit messages, gold tests, or hidden witnesses.
5. Only `admitted` cases proceed. The scored denominator and case order are frozen before the first target run.

### Paired detector run

For each admitted case and each of three repetitions:

1. Start Arm A from a fresh target container, fresh worktrees, fresh temp/cache, and a byte-identical hashed initial corpus DB (empty for qualification).
2. Run the full product pipeline with the frozen characterizer and `layer_b=false` under a 600-second common budget.
3. If Arm A has invalid or missing report evidence, record `HARNESS_ERROR`. If it has a valid report that maps to `ABSTAIN`, record product `ABSTAIN`. In either case, do not claim Layer B value for that pair.
4. Start Arm A+B from a second fresh container and the same initial DB snapshot. Never reuse A's DB, worktrees, cache, run root, temp files, or process namespace.
5. Run the identical common stages and budgets plus an explicit 120-second Layer B increment. Common-stage deadlines cannot grow or shrink because B is enabled.
6. Require the semantic projection of common Layer A findings to match Arm A. A mismatch invalidates the pair.
7. Move only the signed result bundles into the evaluator container. Replay every refuted witness at least twice, once per revision, with fresh process/temp state.
8. Compare three repetitions using the semantic projection. Disagreement in classification, ordered finding semantics, witness, or oracle replay makes the case non-reproducible and fails qualification.

Run A before A+B for every case because Layer A must work end-to-end before Layer B is evaluated. Cold containers and identical source snapshots remove the need to share warm caches. A separate non-gating performance study may counterbalance order, but may not share writable state.

### Secondary end-to-end track

Regenerate characterization three times per case from the same runner-visible context. Record exact model snapshot, prompt/schema/context hashes, request parameters, raw response hash, request ID, and input/output/cached/reasoning tokens. Do not expose evaluator truth. Report each generation independently; do not select the best. Public cases must be labeled contamination-possible and must not support an “unseen” claim.

## 10. Result schema

One immutable JSON record per `(corpus, case, arm, repetition)` must contain:

- identity: schema version, corpus/release hashes, case ID, arm `A|AB`, repetition, harness commit/tree/dirty-state rejection, runner/evaluator pack hashes;
- source: bundle hash, base/head commit and tree IDs, dependency/wheelhouse/lock hashes;
- environment: image digest, Python/Hypothesis/pytest/uv versions, OS/arch/CPU, locale/timezone, network state, env-name allowlist, resource limits;
- claims: bundle hash, generator identity, prompt/schema/context/response hashes, creation time/signature, and whether truth was still sealed;
- budgets: per-command, common-stage, B increment, oracle, output, CPU/memory/disk/PID limits;
- timing/resources: monotonic wall time, child user/system CPU, peak RSS, command count, timeout count, truncation count, and per-stage durations;
- Layer B: worker version, strategy/domain hash, max/generated/valid examples, shrink steps, final witness size, seed/derandomization/database settings;
- model usage: provider, exact snapshot, request ID, input/output/cached/reasoning tokens, frozen price schedule, generator API cost; evaluator model tokens must equal zero;
- product output: raw report path/hash, verdict, ordered findings, exact command/output, raw stdout/stderr hashes, exit/timeout/truncation, receipts, and evidence-valid flag;
- evaluator output: normalized class, each witness replay and oracle classification, valid/false/unvalidated refutation counts, oracle version/hash, exact evaluator commands/outputs, and replay receipts;
- reproducibility: semantic projection hash, repetition consensus, and mismatch reason;
- artifacts: content-addressed paths and SHA-256 for every raw record.

Normalized product class priority:

1. `REFUTE` if any product finding is `REFUTED` (whether valid is decided separately by the evaluator).
2. `ABSTAIN` if there is no refutation and a relevant critical claim is uncovered/`UNVERIFIABLE` or verdict is `RISKY`.
3. `CLEAR` only if there is no refutation and verdict is `SAFE`.
4. `HARNESS_ERROR` for invalid receipts, manifest mismatch, target/evaluator boundary violation, or scorer failure.

Never rewrite raw evidence to make it reproducible. A separate semantic projection may exclude timestamps, durations, run IDs, and replace the single fixed workspace prefix. It contains ordered `(claim_id, layer, outcome, repro_input, expected, actual)`, verdict, normalized class, and evaluator replay classes.

## 11. Exact scoring formulas

Let admitted compatible cases be `C`, admitted regression cases be `R`, and arms be `X ∈ {A, AB}`. Repetitions establish consensus and are not extra samples.

For case `i`, let:

- `TR_Xi` be the count of refuted findings replayed as `PROHIBITED`;
- `FR_Xi` be the count replayed as `ALLOWED`;
- `UR_Xi` be the count with `OUT_OF_DOMAIN`, `ORACLE_ERROR`, missing witness, or replay/evidence mismatch;
- `d_Xi = 1[TR_Xi > 0]`;
- `a_Xi = 1[class_Xi = ABSTAIN]`;
- `q_Xi = 1[class_Xi = CLEAR]`.

Case-level regression recall:

```text
TP_X = Σ(i∈R) d_Xi
Recall_X = TP_X / |R|
UnsafeClearRate_X = Σ(i∈R) q_Xi / |R|
RegressionAbstentionRate_X = Σ(i∈R) a_Xi / |R|
```

False-refutation safety:

```text
BadRefutationFindings_X = Σ(i∈C∪R) (FR_Xi + UR_Xi)
FalseRefutationCases_X = Σ(i∈C) 1[TR_Xi + FR_Xi + UR_Xi > 0]
CaseFPR_X = FalseRefutationCases_X / |C|
FindingFDR_X = Σ(FR_Xi + UR_Xi) / max(1, Σ(TR_Xi + FR_Xi + UR_Xi))
```

An evaluator returning `PROHIBITED` for a compatible case is a truth-label contradiction and invalidates the case/run; it is never credited as a true refutation.

Safe behavior and abstention:

```text
SafeClearance_X = Σ(i∈C) q_Xi / |C|
SafeAbstentionRate_X = Σ(i∈C) a_Xi / |C|
OverallAbstentionRate_X = Σ(i∈C∪R) a_Xi / (|C| + |R|)
DecisiveCoverage_X = Σ(i∈C∪R) 1[d_Xi=1 or q_Xi=1] / (|C| + |R|)
```

Paired incremental Layer B value:

```text
g = Σ(i∈R) 1[d_Ai=0 and d_ABi=1]
h = Σ(i∈R) 1[d_Ai=1 and d_ABi=0]
NetIncrementalDetections = g - h
DeltaRecall = (g - h) / |R|
ConditionalLift = g / (|R| - TP_A), when TP_A < |R|; otherwise N/A
```

Publish the full transition table, including `CLEAR→REFUTE`, `ABSTAIN→REFUTE`, `REFUTE→ABSTAIN`, and `REFUTE→CLEAR`. With a larger set, report an exact paired McNemar/binomial test on `g,h`; do not gate the ten-case corpus on significance. With five regression cases, a two-sided `p<0.05` is unattainable even if all discordant pairs favor B.

Cost and latency:

```text
LayerBWallPerGain = Σ(i∈R) Wall_Bi / g
LayerBCpuPerGain = Σ(i∈R) Cpu_Bi / g
LayerBExecutionCostPerGain = Σ(i∈R) ExecutionCost_Bi / g
```

If `g=0`, these are `Infinity` in the machine-readable record and displayed as “no gain,” not zero. Prefer direct B-stage instrumentation. If only paired totals are available, report `Wall_ABi - Wall_Ai` without clamping negative values and label it a noisy paired estimate.

Model cost is separate:

```text
GeneratorCost = Σ_token_classes(tokens_class × frozen_price_per_token_class)
EvaluatorModelCost = 0
```

Report every per-case value plus total, median, and maximum. Do not report p95 for ten cases; it is effectively the maximum. Report tokens independently of dollar cost so later readers can recompute under another price schedule.

Small-sample safety disclosure after zero compatible-case failures:

```text
one-sided exact 95% upper bound U = 1 - 0.05^(1/|C|)
```

At `|C|=5`, `U=0.4507`. Zero observed failures need at least 59 independent compatible cases for `U<5%`, and 299 for `U<1%`. Do not count A and A+B observations as ten independent safe cases; they are paired.

## 12. Pass/fail thresholds for qualification v1

### Fatal gates

All must hold:

```text
Σ(FR_A + UR_A) = 0
Σ(FR_AB + UR_AB) = 0
invalid_decided_receipts = 0
oracle_preflight_failures = 0
manifest_or_hash_mismatches = 0
truth_boundary_violations = 0
truth_label_contradictions = 0
reproducibility_mismatches = 0
budget_violations = 0
h = 0
```

Any failure rejects the qualification run. A target-visible truth file or network escape is a boundary violation, not a skipped test.

### Case-contract gates

The initial diagnostic corpus has exact expected behavior:

- Layer A valid detections: `cxq-006`, `cxq-007` — exactly `2/5` regression cases.
- Layer A+B valid detections: all regression cases — exactly `5/5`.
- Gross Layer B gains: `cxq-008`, `cxq-009`, `cxq-010` — exactly `g=3`.
- Compatible clearances: `cxq-001`, `cxq-002` in both arms.
- Required conservative abstentions: `cxq-003`, `cxq-004`, `cxq-005` in both arms.
- Compatible refutations: none in either arm.

These exact case expectations are evaluator-only. They prevent an always-abstain system from passing, make Layer B's incremental requirement non-vacuous, and treat current support boundaries honestly. A change to case behavior, frozen generator domains, or expected stratum requires a new corpus major version; do not tune the threshold after seeing results.

For later heterogeneous corpora, replace exact identities with preregistered gates while retaining fatal safety:

- `TP_AB ≥ TP_A`, `g ≥ 1`, `h = 0`;
- `BadRefutationFindings_A = BadRefutationFindings_AB = 0`;
- preregistered minimum safe clearance and maximum abstention by stratum;
- no population-level safety claim until the disclosed exact bound supports it.

## 13. Leakage and contamination policy

- Runner case IDs, repository names, commit metadata, and paths are opaque and neutral.
- Strip remotes, tags, branches other than frozen refs, commit messages, issue/PR links, gold tests, test names containing fixes, changelogs, and upstream metadata from runner bundles.
- The evaluator-only map retains upstream provenance and licenses.
- Scan claim bundles for label fields, oracle identifiers/paths, exact witnesses/outputs, issue/PR prose, and gold-test tokens. A scan passing is necessary but not sufficient; retain a signed manual audit record.
- The claim generator sees only the same bounded diff/source context the product receives. It cannot see evaluator files or admission output.
- Freeze claims before truth unseal. Record generator input/output hashes and signed time. Any semantic human/model edit after unseal invalidates the case version.
- Split development and qualification by repository/code lineage. Paired fixed/buggy directions and derived mutants stay together.
- Public commits are reproducible fixtures, not evidence that a model has never seen the fix. Maintain a separately locked/private or post-cutoff holdout for generalization.
- The evaluator contains no model client. Model-as-judge use is a harness failure.
- Publication retires the qualification version as a blind holdout. Further tuning requires a new locked version.

## 14. Reproducibility policy

Freeze and verify:

- self-contained Git bundles, bundle prerequisites, bundle SHA-256, full commit and tree IDs, submodule/LFS objects, and license blobs;
- a wheelhouse and lock hash, exact Python patch, uv, Cross-Examine, Hypothesis, pytest, and model snapshot;
- OCI image by digest, OS/arch/CPU, locale, timezone, UTF-8, environment-name allowlist, network-off state, and resource limits;
- frozen claims, prompt/schema/context/response hashes, and price schedule;
- initial corpus DB snapshot and disjoint writable roots per arm/repetition;
- raw receipts without normalization and a separately versioned semantic projection;
- at least three clean detector repetitions and two fresh evaluator replays per decided witness.

Derandomized Hypothesis examples may change when Hypothesis, Python, or the test function changes. Therefore the strategy/domain code hash and versions are part of corpus identity. Hash randomization, time, filesystem order, global caches, locale, target side effects, and base/head invocation order must be controlled. Replay disagreement is `BLOCKED`/unvalidated, never safe.

## 15. Implementation file and test map

Layer A must work end-to-end before any Layer B instrumentation is extended.

### Task 1 — contracts and pure scorer

Create:

- `src/cross_examine/benchmark/models.py`: strict frozen dataclasses/Pydantic models for release, runner, truth, run record, witness replay, and score summary;
- `src/cross_examine/benchmark/manifest.py`: allowlist parsing, canonical JSON, signatures/digests, and public projection;
- `src/cross_examine/benchmark/scoring.py`: pure mapping and the formulas in section 11; no IO/model/network/subprocess/database/framework imports;
- `benchmarks/schema/release.schema.json`, `runner.schema.json`, `truth.schema.json`, and `result.schema.json`.

Tests:

- `tests/benchmark/unit/test_manifest.py`: reject extra/forbidden fields, short refs, tags, mutable URLs without bundles, missing hashes, invalid policy;
- `tests/benchmark/unit/test_scoring.py`: exact confusion mapping, abstentions, valid+false refutation in one regression case, paired gains/losses, zero denominators, infinity-on-zero-gain, blocked-case exclusion, and exact acceptance gate;
- `tests/benchmark/unit/test_import_boundaries.py`: scorer/evaluator cannot import forbidden modules and `aggregate()` remains untouched/pure.

### Task 2 — corpus builder and admission

Create:

- `tools/benchmark_corpus/build_qualification.py`: deterministic ten-repository builder; never imported by runtime;
- `tools/benchmark_corpus/freeze_git.py`: neutral commits, bundles, bundle verification, tree/license/source hashes;
- `benchmarks/cross-examine-q1-v1/evaluator/oracles/`: ten human-authored executable oracles and mutants;
- `src/cross_examine/benchmark/admission.py`: evaluator-side execution and receipts.

Tests:

- `tests/benchmark/integration/test_corpus_build.py`: two builds produce the same source trees and declared artifacts;
- `tests/benchmark/integration/test_oracle_admission.py`: every oracle accepts good, rejects bad/mutant, emits exact command/output, and classifies its complete domain;
- `tests/benchmark/integration/test_offline_reconstruction.py`: `git bundle verify`, network off, commit/tree and dependency hashes match.

### Task 3 — isolated Layer A paired runner

Create:

- `src/cross_examine/benchmark/runner.py`: target-container launcher, frozen characterizer, fresh state, Layer A arm, signed result bundle;
- `src/cross_examine/benchmark/evaluator.py`: separate evaluator-container witness replay and result enrichment;
- `scripts/run_benchmark.py`: `validate`, `admit`, `run`, and `score` commands with explicit paths and no implicit current prices.

Tests:

- `tests/benchmark/integration/test_truth_isolation.py`: sentinel target cannot read evaluator pack, image layers, ancestor paths, env/argv/logs, or open network;
- `tests/benchmark/integration/test_layer_a_protocol.py`: empty identical DB snapshots, disjoint writable roots, exact A case expectations, receipts, and semantic projections;
- `tests/benchmark/integration/test_witness_replay.py`: missing/OOD/error is unvalidated; one true plus one false witness still fails;
- `tests/benchmark/integration/test_receipt_tamper.py`: reject changes to argv, cwd tree, executable/image, stdout, stderr, exit, timeout, truncation, env, and oracle hash.

Only after these tests pass should Task 4 begin.

### Task 4 — Layer B incremental instrumentation

Modify:

- `src/cross_examine/cross_examine/hypothesis_worker.py`: emit worker/strategy/domain hashes, generated/valid example counts, shrink steps, witness size, and deterministic settings without changing verdict authority;
- `src/cross_examine/cross_examine/layer_b.py`: preserve structured worker telemetry and nested base/head raw evidence;
- `src/cross_examine/benchmark/runner.py`: AB arm with fixed B increment and identical common-stage caps.

Tests:

- `tests/benchmark/integration/test_layer_b_protocol.py`: exact `cxq-008..010` gains, no losses, no common-budget starvation, A projection equality, stable witnesses across repetitions;
- `tests/benchmark/unit/test_layer_b_telemetry.py`: counts/hashes persist and search exhaustion normalizes to `NO_REFUTATION_FOUND`;
- existing `tests/integration/test_layer_b.py` remains green.

### Task 5 — reports, cost, and holdout lifecycle

Create:

- `src/cross_examine/benchmark/report.py`: per-case tables, formulas, exact bounds, transitions, costs, latency, blocked/quarantine appendix;
- `benchmarks/cross-examine-q1-v1/evaluator/price-table.json`: frozen token classes and prices;
- `tests/benchmark/unit/test_report.py` and `tests/benchmark/integration/test_reproducibility.py`.

Additional mandatory adversarial tests:

- claim bundle predates truth unseal and contains no hidden witness/expected output;
- runner Git metadata contains no remote, issue/PR references, revealing messages, or gold tests;
- pair order reversal in a non-gating study produces identical semantic results;
- B cannot reduce common-stage budgets;
- replay disagreement becomes blocked/unvalidated;
- publication refuses reuse of an unsealed holdout without a major version increment;
- blocked cases remain visible but excluded from all scored denominators.

Verification commands for the implementation agent:

```text
uv run pytest tests/benchmark/unit -q
uv run pytest tests/benchmark/integration -q
uv run pytest
```

This research task did not execute a benchmark case. During implementation, contract/unit tests may use test fixtures and admission integration tests may execute candidate oracles, but a scored qualification remains a separate, explicit operation after both P0 blockers are closed.

## 16. Definition of done and explicit BLOCKED outcomes

An implementation is ready for corpus admission when:

- all files and interfaces in section 15 exist with strict schemas;
- the generator/evaluator import and process boundaries are enforced;
- target execution cannot access truth or network;
- every refutation requires independent witness replay;
- A and A+B start from identical immutable state with disjoint writes;
- result records contain exact commands, captured outputs, raw evidence hashes, and complete cost/resource fields;
- the formulas and fatal gates are mechanically tested;
- full `uv run pytest` passes.

The scored qualification run remains **BLOCKED** until both P0 blockers in section 4 are implemented and demonstrated by adversarial tests.

Case-level `BLOCKED` rules:

- compatible scope cannot classify every possible frozen-generator witness;
- regression oracle does not accept good/base and reject bad/head plus mutant;
- oracle uses model prose, commit/issue/PR prose, the candidate report, or a model judge as truth;
- source/dependencies/image cannot reconstruct offline by digest;
- truth is visible to target execution;
- claim bundle was edited after oracle exposure or contains a hidden answer;
- witness replay is nondeterministic;
- required setup, license, receiver, serializer, or runtime contract is unspecified.

Do not resolve any of these toward safety. Keep the case in the manifest audit table with its exact blocked reason and exclude it from score denominators.

## 17. Research basis

- Hypothesis documents deterministic settings and cautions that fixed examples still depend on Hypothesis/Python/test-function versions: [settings](https://hypothesis.readthedocs.io/en/latest/tutorial/settings.html), [API/seed](https://hypothesis.readthedocs.io/en/latest/reference/api.html).
- Software Heritage identifiers provide intrinsic, verifiable source identities: [SWHID specification overview](https://www.softwareheritage.org/software-hash-identifier-swhid/).
- Git documents self-contained bundles and `verify` for offline object/ref transport: [git-bundle](https://git-scm.com/docs/git-bundle.html).
- NIST documents exact binomial bounds and the paired McNemar test used for small samples: [exact binomial bounds](https://www.itl.nist.gov/div898/handbook/prc/section2/prc241.htm), [McNemar test](https://www.itl.nist.gov/div898/software/dataplot/refman1/auxillar/mcnemar.htm).
- Equivalent/uncertain mutants contaminate mutation denominators and motivate `BLOCKED` rather than assumed-safe labels: [Jia and Harman mutation analysis survey](https://arxiv.org/abs/1303.2784).
- NIST's agent-evaluation work calls out contamination, solution lookup, and grader gaming: [NIST AI 800-2 draft](https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.800-2.ipd.pdf), [cheating in AI agent evaluations](https://www.nist.gov/blogs/caisi-research-blog/cheating-ai-agent-evaluations).
- BugsInPy provides a primary Python defect source but still requires Cross-Examine-specific admission: [repository](https://github.com/soarsmu/BugsInPy), [paper](https://arxiv.org/abs/2401.15481).
