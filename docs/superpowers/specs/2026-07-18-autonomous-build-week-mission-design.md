# Autonomous Build Week mission design

**Date:** 2026-07-18  
**Status:** Approved by the attached autonomous mission brief  
**Scope:** Python repositories during Build Week

## Outcome

Cross-Examine will ship as an independent, evidence-backed verification harness whose public claims are no stronger than its executable evidence. The system preserves the five stages:

1. Ingest
2. Characterize
3. Cross-examine
4. Aggregate
5. Render

The model may propose strict claims and probe plans. Deterministic code owns target identity, execution, evidence validation, outcome classification, and verdicts. A decided finding retains exact commands, captured outputs, and validated provenance. `aggregate()` remains a pure domain function with no IO, model, network, subprocess, database, benchmark, or framework dependency.

## Repository evidence

The current repository already has a working Layer-A pipeline, a bounded trusted-host executor, structured GPT-5.6 Sol characterization, evidence receipts, SQLite persistence, a React evidence explorer, and release tests. Commit `ea14e2f` completed the first command/output receipt slice and validates reports before corpus pinning.

The audit also found unresolved integrity risks:

- corpus identity is the mutable repository locator plus symbol and expected value;
- corpus observations overwrite evidence and are not anchored to Git ancestry;
- report reads do not revalidate receipts or recompute verdicts;
- report completion and corpus effects are not atomic;
- a non-critical preservation mismatch or an omitted changed symbol can disappear into a `SAFE` verdict;
- receipts bind command/output only, not repository, revision, execution role, policy, runtime, or observation identity;
- the probe protocol uses permissive raw JSON and cannot distinguish several Python values losslessly;
- setup, intended-oracle, and benchmark contracts remain research designs;
- the existing real-model trial procedure pins an older pre-receipt commit;
- the hosted product flow presents an unusable arbitrary-repository form before the working offline path.

## Approaches considered

### Evidence-gated vertical slices — selected

Complete each Layer-A trust contract before extending Layer B. Land a migration or schema only with deterministic recovery, compatibility tests, and inspectable provenance. Run the real-model trial as an independent evidence lane. This is slower than broad parallel development but prevents conflicting migrations and preserves the architecture's safety claims.

### Parallel subsystem build-out — rejected

Implement corpus, setup, values, intended oracles, and benchmark packages concurrently. This shortens initial calendar time but conflicts over persistence, protocol, and receipt versioning. It also makes regressions difficult to attribute and risks extending Layer B over unstable Layer-A semantics.

### Demo-first release — rejected

Prioritize trial footage, benchmark visuals, and hosted UX. This improves the visible submission quickly but leaves known false-safety and stale-provenance paths beneath the demo. Product polish follows the integrity gates instead.

## Architecture

### Stable stage boundary

```text
Python base..head
    -> Ingest: immutable Git facts and detached revisions
    -> Characterize: schema-constrained proposals, never verdicts
    -> Cross-examine: base capture, head replay, approved oracles, optional search
    -> Aggregate: pure deterministic findings-to-verdict function
    -> Render: validated persisted report and raw evidence
```

New work enters through explicit contracts around these stages. Setup prepares revision-specific runtimes before Cross-examine. Corpus selection supplies compatible Layer-A observations only after Git proof and base revalidation. Intended-change oracles execute after preservation replay and only with independently authenticated bindings. Benchmark scoring stays outside product aggregation.

### Separate version namespaces

The implementation must not overload a single "v2" marker. It uses independent, explicit versions for:

- report contract;
- evidence receipt;
- execution policy and manifest;
- probe protocol;
- observation codec;
- setup plan;
- intended-oracle binding;
- corpus schema and contract;
- benchmark release and result schemas.

Compatibility decisions use the relevant namespace tuple. Unknown or incompatible versions abstain or refuse writes; they are never coerced into new authority.

### Evidence and validation

Every attempted execution produces an immutable receipt. Decided findings require receipts bound to their rendered evidence and execution context. Validation additionally checks:

- unique and reserved identifiers;
- claim/finding linkage;
- touched-symbol coverage or an explicit critical abstention;
- outcome policy for preservation and intended-change claims;
- receipt hash and context bindings;
- recomputed verdict equality;
- corpus and oracle references;
- schema-version compatibility.

Persistence validates on write and read. Report completion and corpus observation writes share one transaction. Legacy reports remain readable as historical, untrusted evidence but cannot authorize new decisions.

### Conservative outcomes

Preservation mismatches are refutations regardless of a model-selected risk flag. Missing coverage, malformed claims, setup ambiguity, stale corpus state, unsupported values, missing intended authority, and incomplete witness replay become critical `UNVERIFIABLE` findings and force at least `RISKY`. Only grounded passes with complete critical coverage can be `SAFE`.

### Trusted-host execution boundary

The executor remains a trusted-input host-process adapter, not a sandbox. It uses fixed argument vectors, no shell, product-owned allowlists, minimal environments, exact working directories, timeouts, output limits, process-tree cleanup, redaction, and execution manifests. Setup may create isolated Python environments, but it does not claim filesystem or network isolation.

Scored benchmark qualification requires a distinct disposable, network-denied target environment and evaluator-only truth. Without demonstrable separation, the harness may produce a labeled development baseline but must report `BLOCKED-BENCHMARK-TRUTH-ISOLATION` rather than a qualification result.

## Data and contract slices

### Corpus lifecycle v2

Corpus records become immutable contracts, anchored versions, and append-only observations. Locator aliases only discover candidate repository families; Git object format, full object IDs, ancestry, contract versions, probe/codec versions, policy identity, and execution inputs decide applicability. Migration recognizes only known legacy schemas, backs up and manifests source bytes, quarantines unverifiable rows, preserves reports, and refuses partial or newer schemas.

The default lifecycle supports deterministic pin, replay, stale/challenged inspection, and retention. Promotions or semantic rebindings require an external signed authority receipt. If no signer is configured, those actions remain disabled without preventing ordinary conservative replay.

### Observation codec and Python behavior

Probe protocol v2 uses tagged, resource-bounded observation nodes. It preserves JSON scalars/containers exactly, normalizes exceptions structurally, and supports top-level plain `Enum` results without invoking target-controlled representation hooks. Unsupported, ambiguous, cyclic, shared, non-finite, oversized, non-string-keyed, or incompatible values abstain.

Subsequent compatible nodes cover signatures, argument binding, mutations, and serialization one Layer-A slice at a time. Layer B consumes a value type only after the corresponding Layer-A contract passes end to end.

### Deterministic Python setup

Callers choose only `none` or `wheel-no-deps`. Product code owns every command, flag, directory, environment key, timeout, artifact rule, and interpreter binding. Base and head use the same versioned plan in separate prepared environments. Wheel creation uses no index, no dependencies, and no build isolation. Artifact cardinality, path containment, hashes, import origin, role symmetry, and environment inventories are verified before probes.

Any setup failure emits one critical `system:python-setup` abstention, skips later evidence work, and yields `RISKY`. The existing `none` path remains backward compatible.

### Intended-change executable oracles

Intended changes remain distinct from regressions. A strict binding connects repository identity, exact head, claim fingerprint, complete oracle set, setup profile, expiry, and authenticated approval. Model output may suggest oracle identifiers but cannot approve them.

The first supported adapter is one exact pytest leaf under a product-owned hermetic profile. Exactly one collected passing call verifies; assertion failure refutes; skip, xfail, collection anomalies, setup/teardown/import failures, mutation, timeout, truncation, stale identity, or incomplete binding abstains. Without an authenticated binding, the claim remains `BLOCKED-INTENDED-AUTHORITY` and `RISKY`.

### Benchmark harness

Frozen runner artifacts contain immutable repository bundles and claims but no labels, evaluator truth, witnesses, or expected outputs. Evaluator artifacts hold labels, total compatible-case witnesses, regression oracles, mutation controls, and scoring policy. The pure scorer measures discovery, false refutations, false safety, abstentions, runtime, and resources without importing product aggregation.

A CI smoke suite uses small, frozen local cases and anti-gaming hash/semantic checks. A full qualification additionally requires target/evaluator isolation, total witness coverage, admission oracles that accept base and reject both head and mutant, finding-level replay, fresh identical A and A+B state, and zero false or unvalidated refutations. Otherwise the versioned output is an explicitly unqualified baseline.

### Real GPT-5.6 Sol trial

The trial procedure is repinned to the implementation commit and reviewed before any request. Offline gates validate repository objects, upstream behavior, prompt hash, observer hash, redaction, and expected artifact layout. A human-authorized environment may make one paid Responses request with retries disabled. The evidence package records non-secret request metadata, returned model, usage, constrained claims, target revision, commands, outputs, timings, cost when supplied, persisted report, and render equality.

CI uses a deterministic replay fixture. A missing API key, unavailable model, failed preflight, or declined spend is recorded as an external follow-up; it never leads to fabricated live evidence or a retry after an attempted request.

## Phase delivery

### Phase 0 — audit and mission design

Commit this design, the six research handoffs, product audit, and a living mission ledger. Record repository state, baseline results, risks, dependencies, owners, and exact commands.

### Phase 1 — executable roadmap and truthful docs

Reconcile stale roadmap claims, architecture, execution policy, README, submission, demo, and research status. Separate implemented, development-only, blocked, and future capabilities.

### Phase 2 — real-model trial and replay

Build the current-pin trial tooling, strict artifact schema, replay fixture, malformed-claim coverage, provenance checks, and documentation. Run the paid lane only if all external gates pass.

### Phase 3 — setup contract

Land schema/persistence first, then fixed setup planning and evidence, installed Layer A and tests, API/CLI/UI, and only later installed Layer B.

### Phase 4 — corpus lifecycle v2

Land Git identity, migration/quarantine, immutable contracts/versions/observations, deterministic selection and inspection, atomic completion, retention, and optional external lifecycle authority.

### Phase 5 — intended-change oracles

Land strict identities and bindings, approval verification, one hermetic exact-leaf adapter, pure outcome classification, persistence, API/UI rendering, and adversarial tests.

### Phase 6 — benchmark harness and baseline

Land contracts and pure scorer, frozen cases, admission and anti-gaming checks, CI smoke, resource telemetry, baseline output, and explicit isolation/coverage qualification gates.

### Phase 7 — values, exceptions, types, signatures, and serialization

Land probe protocol/observation codec compatibility, then structured Layer-A value increments and their matching Layer-B support only after each gate.

### Phase 8 — adversarial product hardening

Fix false-safety, validation, receipt, executor, migration, corruption, redaction, malformed-input, timeout, accessibility, and cross-platform findings. Add property, fuzz, mutation, or metamorphic tests only where they protect a named invariant.

### Phase 9 — demo, developer experience, and release

Make the offline path primary in hosted mode, improve receipt affordances and accessibility, add corpus inspection and demo commands, synchronize the static bundle, verify packaging and CI, and publish a truthful video outline and release narrative.

## Verification strategy

Every behavioral change follows red-green-refactor. Focused tests prove the new contract and its failure paths before implementation. Before each backend commit:

```bash
uv run pytest
```

Applicable gates also run Ruff, frontend unit/contract/accessibility tests, TypeScript/Vite build, static bundle diff, Playwright, release/install tests, demo flow, benchmark smoke, migration fixtures, and cross-platform CI. The local checkout's macOS `dataless` virtualenv is not trusted for verification; a fresh temporary uv environment is used and documented without changing repository behavior.

Every phase receives an independent architecture/adversarial review. Valid findings become tests before fixes. Completion claims quote the exact command and captured result summary.

## Delivery and external boundaries

Work lands on a `codex/` branch in coherent phase commits and is pushed regularly. The final pull request includes implementation evidence, benchmark/trial status, risks, limitations, demo steps, and review guidance.

The mission does not silently invent unavailable authority. These remain honest external gates when not present:

- one paid GPT-5.6 Sol request and billing metadata;
- authenticated intended-change requirement approval;
- an external corpus lifecycle signer;
- hostile-target benchmark isolation and evaluator truth separation;
- final public video upload, Devpost fields, and human release approval.

Local implementations must make each missing gate inspectable and fail toward risk while completing all work that can be credibly verified in the repository.
