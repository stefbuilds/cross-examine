# Ordered implementation roadmap: verification foundations

**Goal:** Safely extend Cross-Examine for Python repositories while preserving the five stages, deterministic verdict authority, pure `aggregate()`, and fail-toward-risk behavior.

**Global gate:** Every backend change runs `uv run pytest` before commit. Every decided finding keeps exact command, captured output, and valid receipt. No phase expands beyond its listed scope.

## 0. Receipt-integrity foundation — next slice

**Depends on:** Current receipt WIP only.
**Do not start:** value, setup, lifecycle, intended-oracle, benchmark, or Layer B feature work first.

**Work:** Complete `EvidenceReceipt` across execution, Layer A/B, pipeline, codec, persistence, corpus replay, rendering validation, and tests. Preserve legacy decoding but never let a blank/reconstructed legacy hash decide a new finding. Do not mistake substring evidence association for context-bound provenance.

**Acceptance gate:**

- Decided findings reject missing, tampered, or unrelated receipts; attempted commands retain exact receipts even when failing.
- Every supported execution path persists and round-trips a valid receipt.
- Legacy rows decode without fabricated proof and cannot decide a new result without fresh evidence.
- Report validation occurs before any corpus pin or completed-run side effect; a rejected report cannot create evidence authority.
- `aggregate()` remains pure and verdict behavior is unchanged.
- `uv run pytest` exits 0 with captured output.

**Terminal:** `COMPLETE-LAYER-A-RECEIPTS`; otherwise stop with preserve-critical `RISKY`.

## 1. Corpus lifecycle v2 through Layer A

**Depends on:** settled receipt/persistence contracts and external signing authority for promotion.

**Work:** Freeze v1 hazards; capture Git identity/ancestry; deterministic migration/quarantine; add families, aliases, immutable versions, observations, and frontiers; atomic run/corpus completion; externally signed lifecycle actions; API/UI provenance. B cannot consume v2 coverage.

**Acceptance gate:**

- Locator equality is only a hint; Git proof controls sharing.
- Unknown/shallow/disconnected ancestry, conflicts, missing targets, and policy mismatch abstain toward risk.
- Base revalidation precedes head mismatch; observations do not overwrite baseline evidence; promotion cannot alter historical reports.
- Promotion needs an external allowlisted signature inaccessible to model/worker/target, one-use challenge, CAS, and atomic receipt.
- Layer A passes end-to-end and `uv run pytest` exits 0.

**Terminal:** `COMPLETE-LAYER-A-LIFECYCLE`; invalid provenance stays critical risk.

## 2. Lossless codec and Layer-A value support

**Depends on:** `COMPLETE-LAYER-A-RECEIPTS`; this is independent of lifecycle semantics but cannot reuse incompatible v1 corpus observations.

**Work:** Only value-support Phase 0 and Phase 1A: strict versioned observation envelopes, lossless compatibility filtering, resource limits, and top-level plain Enum results for existing JSON-compatible inputs. No Enum input, tuple reconstruction, arbitrary object, or Hypothesis-domain addition.

**Acceptance gate:**

- Tuple/list coercion and unsupported/derived/nested values abstain rather than exercise an incorrect runtime type.
- Supported matching/changed Enums verify/refute with receipts; version incompatibility abstains.
- Layer A completes end-to-end before any B value extension.
- `aggregate()` stays pure and `uv run pytest` exits 0.

**Terminal:** `COMPLETE-LAYER-A-VALUE-CODEC`; unsupported behavior is `UNVERIFIABLE`/`RISKY`.

## 3. Closed Python setup through installed Layer A

**Depends on:** `COMPLETE-LAYER-A-RECEIPTS` and settled codec/persistence interfaces.

**Work:** (a) strict `none|wheel-no-deps` contract/persistence; (b) fixed product-owned setup plan/identity binding; (c) per-revision wheel/venv and installed Layer A; (d) installed repository tests; (e) API/CLI/UI/restart provenance. Keep `none` compatible. Do not start setup B.

**Acceptance gate:**

- No model/caller/repository command-like setup field reaches execution.
- Both roles use the same plan; imports prove resolution inside each role venv and outside both worktrees.
- Any asymmetry, failed proof, context mismatch, timeout, or truncation creates exactly one critical `system:python-setup` abstention, skips later evidence work, and yields `RISKY`.
- Build-generated, flat, and `src` fixtures pass installed Layer A/test gates; `none` remains unchanged.
- `uv run pytest` exits 0.

**Terminals:** `COMPLETE-LAYER-A-SETUP` or `BLOCKED-UNTRUSTED-REPOSITORY-EXECUTION` if hostile-code isolation is claimed without a verified adapter.

## 4. Authenticated intended-change oracles

**Depends on:** `COMPLETE-LAYER-A-RECEIPTS`, `COMPLETE-LAYER-A-LIFECYCLE`, strict codecs, and fresh snapshots.

**Work:** Freeze no-authorization abstention tests; pure strict identity/contracts; external approval challenge/store; one hermetic exact pytest-leaf adapter after Layer A; typed evidence/persistence; then UI. No arbitrary commands, globs, `-k`, or head-authored authority.

**Acceptance gate:**

- Model candidates, broad tests, base/head differences, and head fixtures cannot decide intended claims without external authenticated complete bindings.
- Missing, forged, stale, ambiguous, incomplete, or mismatched authority is critical `UNVERIFIABLE`/`RISKY`.
- Approved leaf executes once from a fresh verified head snapshot; skip/xfail, collection anomaly, mutation, timeout, or receipt mismatch abstains.
- `aggregate()` stays pure and `uv run pytest` exits 0.

**Terminals:** `BLOCKED-INTENDED-AUTHORITY` per unbound claim, or `COMPLETE-LAYER-A-INTENDED-ORACLES`.

## 5. Benchmark admission and isolated Layer-A qualification

**Depends on:** prior Layer-A gates and demonstrated P0 isolation plus oracle coverage.

**Work:** External pure scorer; runner/evaluator packs and mutation-controlled admission; disposable network-off target container/VM limited to runner pack; evaluator-only witness replay; frozen Layer A arm first in fresh identical state. Existing trials remain shadow evidence.

**Acceptance gate:**

- Target images, mounts, environment, logs, and caches contain no evaluator truth/oracle/label/witness or discoverable digest path.
- Each admitted refutation replays as `PROHIBITED`; all other witness classifications fail the hard safety gate.
- Compatible cases have total frozen-witness coverage; regression oracle accepts base, rejects head, and passes mutation control.
- Paired A runs have fresh identical initial state, valid receipts, and frozen expectations; `uv run pytest` exits 0.

**Terminals:** `BLOCKED-BENCHMARK-TRUTH-ISOLATION`, `BLOCKED-BENCHMARK-ORACLE-COVERAGE`, or `COMPLETE-BENCHMARK-A-PAIRED`.

## 6. Layer B extensions and qualification

**Depends on:** its corresponding Layer-A terminal state; benchmark B also needs `COMPLETE-BENCHMARK-A-PAIRED`.

**Work:** One B extension at a time: supported Enum-result comparison; installed runtime; lifecycle coverage; intended-oracle B; then telemetry and paired A+B qualification. For each benchmark case run A before A+B cold and isolated, with equal common-stage semantic findings.

**Acceptance gate:**

- No source-import fallback, receipt/context bypass, or changed Layer-A common semantics.
- Frozen strategy/domain/version identities, counts, shrink data, resources, and exact evidence are emitted without giving verdict authority to the model.
- A+B meets frozen fatal/case thresholds; false and unvalidated refutations are zero.
- `uv run pytest` exits 0.

**Terminal:** `COMPLETE-BENCHMARK-A+B-QUALIFICATION`; unverifiable critical behavior remains `RISKY`.

## Human authority required

1. Operator/trusted requirement authority: authenticate complete intended-change claim-to-oracle bindings and semantic sufficiency.
2. Signing authority unavailable to model/worker/target: authorize corpus promotions, rebinds, retirements, and conflict resolutions.
3. Release authority: provision/attest benchmark target-evaluator isolation and admit cases after oracle/mutation receipts.
4. Human trial operator: run a paid real-GPT trial in the prescribed disposable low-privilege environment; it does not substitute for the authorities above.

## Exact next implementation prompt

> Implement and test the receipt-integrity foundation only: make every `VERIFIED` and `REFUTED` finding carry an exact command/output `EvidenceReceipt` hash from every execution path; persist and round-trip it; reject tampered, missing, or unrelated receipts at report validation; preserve legacy decoding without allowing legacy data to decide a new finding; keep `aggregate()` pure; make no Layer B behavior changes; target Python repositories only; and run `uv run pytest` before committing.
