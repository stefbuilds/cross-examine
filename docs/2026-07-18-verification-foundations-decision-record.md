# Decision record: verification foundations before capability expansion

**Date:** 2026-07-18
**Status:** Superseded as the current sequence; retained as historical decision input
**Scope:** Python repositories during Build Week

> **Superseding status — 2026-07-19.** EvidenceReceipt v1 and
> validation-before-corpus-pin landed in `ea14e2f`. Receipt v1 remains context-free
> command/output substring integrity metadata; semantic report/read validation, complete
> candidate coverage, contextual binding, corpus identity/atomicity, and external
> authorities remain open. The current dependency order is the
> [P0-P9 executable roadmap](2026-07-18-ordered-implementation-roadmap.md), and current
> implementation truth is the [capability matrix](capability-status.md).

## Current superseding decision

Known false-`SAFE`, omitted-candidate, semantic report/read-validation,
aggregation-recursion, and lossy current-value paths form an early local integrity gate
before P3-P7 capability expansion. P3 first closes the non-loopback/timeout policy
inconsistencies, then establishes deterministic setup. P4 corpus migration and the P6
development benchmark contract both precede P7 value-family expansion. P8 repeats a
broader hardening sweep rather than postponing those known blockers. Paid-model evidence,
intended approval, lifecycle signing, benchmark isolation/truth, publication, and final
human release approval remain distinct external gates.

## Original decision context (historical)

At the original snapshot, complete receipt integrity before any new capability. Then
stabilize Layer-A corpus lifecycle because the snapshot could pin before report validation
and used mutable locator-keyed baselines. Continue with Layer-A value/setup tracks,
authenticated intended-change oracles, isolated Layer-A benchmark qualification, and only
then corresponding Layer B extensions. `ea14e2f` later closed validation-before-pin; the
current sequence above supersedes this ordering.

The product stays an independent five-stage harness: **Ingest → Characterize → Cross-examine → Aggregate → Render**. `aggregate()` stays unchanged and pure: it imports no IO, model, network, subprocess, database, benchmark, or framework code. Model output remains schema-constrained proposals; deterministic code assigns findings and verdicts. Missing, invalid, ambiguous, or unprovable preserve-critical evidence resolves to `UNVERIFIABLE` and risk, never `SAFE`.

## Evidence-backed basis

| Evidence | Conclusion | Consequence |
| --- | --- | --- |
| `AGENTS.md` | Decided findings need exact command/output; Layer A precedes B; Python only. | Receipts are first and every gate preserves the five stages. |
| Receipt-integrity work in `schema.py`, `execution.py`, `codec.py`, `validation.py`, persistence, pipeline, Layer A/B, and tests at the original snapshot | V1 binds rendered command/output and rejects missing, invalid, unrelated receipts. Before `ea14e2f`, the pipeline could pin corpus evidence before `validate_report()`; v1 was and remains not context-bound. | `ea14e2f` moved validation before pinning. Receipt context and full semantic validation remain incomplete trust boundaries. |
| `value-support-handoff.md` §§6, 28, 310–20, 379–99 | Tuple input can arrive as a list; lossless codec precedes rich input strategies. | Layer-A codec/Enum results precede all new B domains. |
| `setup-hook-handoff.md` §§7–19, 25–59, 250–74, 636–730 | `wheel-no-deps` must be closed, paired, and context-bound. | Setup follows receipts; installed Layer A/test gates precede installed B. |
| `intended-oracle-handoff.md` §§Decision, 485–558 | Model prose, broad tests, and head files cannot authorize intended behavior. | Unbound claims are blocked and risky. |
| `corpus-lifecycle-handoff.md` §§7–40, 210–45, 281–346, 880–1052 | Git ancestry, append-only records, and external signing authority are required. | Lifecycle follows settled persistence; B cannot consume it early. |
| `benchmark-handoff.md` §§8–30, 55–98, 300–321, 436–61, 595–610 | Host execution is not truth-isolated; scored runs need separate evaluator witness replay. | Local work is unblinded development until both P0 controls pass. |
| `real-gpt56-run-handoff.md` §§33–61, 905–66 | Real trial is operational/shadow evidence, not a total oracle. | It never enters a scored-compatible denominator. |

## Reconciled boundaries

1. Setup preserves a trusted-host adapter; a venv is not filesystem/network isolation. Benchmark scoring instead requires a disposable, network-off target container/VM and a separate evaluator. Setup may complete without enabling a scored benchmark.
2. Current receipt v1 binds command/output only. It does not prove repo, revision, role, executable, environment, policy, artifact, or evaluator identity. Later setup/oracle/corpus/benchmark contracts add those bindings; receipt v1 is not sufficient proof by itself.
3. Benchmark needs a deterministic scorer, but it lives outside product `aggregate()`. Qualification never adds benchmark dependencies to aggregation.
4. Intended-change approval and benchmark truth are both external authorities, but have different exposure rules. Neither is available to model output, repository code, or target execution.
5. The existing hero is Layer-A-detectable and public compatibility trials lack total executable witness oracles. They remain shadow evidence, not qualification cases.
6. At this decision snapshot, corpus pre-validation pinning and the mutable locator-keyed
   baseline were both P0 defects. `ea14e2f` later closed the ordering defect; mutable
   locator authority, ancestry/revalidation, and atomicity remain assigned to P4. Current
   lossy-value integrity moves to the early gate, while new values remain P7 expansion.

## Rejected sequencing

- No Layer B value strategy, installed-mode B, lifecycle coverage consumption, intended-oracle B, or benchmark B metric before its named Layer A gate.
- No arbitrary setup argv, installer flags, URLs, environment values, or oracle commands from model, repository, or caller input.
- No path/URL equality, model classification, repetition, head files, broad test pass, or passing suite as proof of identity, intent, promotion, or compatible safety.
- No scored benchmark release from current host-process execution.

## Terminal states

| State | Meaning |
| --- | --- |
| `COMPLETE-LAYER-A-RECEIPTS` | Decided findings have validated persisted receipts; legacy data cannot decide a new result. |
| `COMPLETE-LAYER-A-VALUE-CODEC` | Lossless codec/versioning and Layer-A value increment pass without B domain expansion. |
| `COMPLETE-LAYER-A-SETUP` | Paired installed Layer A/repository tests pass with fail-closed receipts. |
| `BLOCKED-INTENDED-AUTHORITY` | No authenticated complete claim-to-oracle binding; claim is critical `UNVERIFIABLE`/`RISKY`. |
| `COMPLETE-LAYER-A-INTENDED-ORACLES` | Scoped authenticated intended-oracle execution passes. |
| `COMPLETE-LAYER-A-LIFECYCLE` | Ancestry-scoped corpus v2 and external promotion authority pass Layer-A gates. |
| `BLOCKED-BENCHMARK-TRUTH-ISOLATION` | Target can access evaluator truth/path; scored qualification cannot run. |
| `BLOCKED-BENCHMARK-ORACLE-COVERAGE` | A case lacks total witness classification/mutation controls; exclude it from scoring. |
| `BLOCKED-UNTRUSTED-REPOSITORY-EXECUTION` | The current host adapter still has target-visible host filesystem/network authority; do not claim hostile-target isolation. |
| `COMPLETE-BENCHMARK-A-PAIRED` | Isolated fresh-state Layer A qualification passes. |
| `COMPLETE-BENCHMARK-A+B-QUALIFICATION` | A+B meets frozen incremental thresholds without changing common-stage semantics. |

All other critical-evidence failures terminate as `RISKY`, never `SAFE`.
