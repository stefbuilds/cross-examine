# Autonomous mission ledger

Initialized: 2026-07-18
Scope: Python repositories during Build Week

## Ledger doctrine

This is the append-only mission register for the autonomous Build Week work. The
immutable baseline, objective definitions, decisions, rejected alternatives, and
verification entries are never deleted or rewritten. A correction or status change
must be appended as a dated entry that names the affected stable objective ID, the
previous state, the new state, the reason, and the supporting evidence. The latest
valid transition is the current state.

The only objective status values are `pending`, `in_progress`, `complete`, and
`blocked`:

- `pending`: work has not started or its dependencies have not cleared.
- `in_progress`: work has started and can still make local progress.
- `complete`: every acceptance criterion has deterministic evidence.
- `blocked`: a named external authority, capability, or prerequisite prevents the
  remaining work; the blocker and safe fallback are recorded explicitly.

A verified or refuted finding must retain the exact command and captured output.
Summaries may aid navigation but never replace raw evidence. Models may propose only
schema-constrained claims and plans. Deterministic code owns repository identity,
execution, evidence validation, outcome classification, benchmark scoring, and
verdicts. Unverifiable preserve-critical behavior resolves toward risk, never safety.
The five stages remain Ingest, Characterize, Cross-examine, Aggregate, and Render;
`aggregate()` remains a pure domain function.

## Immutable Phase 0 baseline

| Field | Immutable value |
| --- | --- |
| Baseline date | 2026-07-18 |
| Active branch | `codex/autonomous-build-week` |
| HEAD | `ea14e2f4f7a16f15f0603b4e3b5355d258725a9c` |
| `origin/main` | `f6524ea` (`f6524eac4270cf566d3acbf1f3a77ebb24ed904f`); baseline HEAD is two commits ahead |
| Target scope | Python repositories only during Build Week |
| Executor posture | Trusted-input host-process adapter, not a sandbox; target code retains the local host user's filesystem and network authority |
| Setup posture | A temporary Python environment may separate dependencies, but it does not provide hostile-target filesystem or network isolation |
| Aggregation boundary | Pure; no IO, model, network, subprocess, database, benchmark, or framework imports |
| Local verification environment | Ephemeral `/private/tmp/cross-examine-mission.Y52f1Y/venv`, used because the checkout `.venv` contains macOS `hidden,compressed,dataless` Hypothesis source and bytecode files |
| Git integrity limitation | Six malformed duplicate refs ending in ` 2`, ` 3`, or ` 4` remain untouched; repair requires an exact backup and destructive-action approval |

Dirty paths captured before this ledger was created:

```text
 M docs/submission.md
?? artifacts/product-audit-2026-07-18/01-welcome.png
?? artifacts/product-audit-2026-07-18/02-run-locally.png
?? artifacts/product-audit-2026-07-18/03-verification-form.png
?? artifacts/product-audit-2026-07-18/04-hero-result.png
?? artifacts/product-audit-2026-07-18/05-expanded-evidence.png
?? artifacts/product-audit-2026-07-18/06-sidebar-expanded.png
?? artifacts/product-audit-2026-07-18/07-mobile-verification-form.png
?? artifacts/product-audit-2026-07-18/audit.md
?? docs/research/benchmark-handoff.md
?? docs/research/corpus-lifecycle-handoff.md
?? docs/research/intended-oracle-handoff.md
?? docs/research/real-gpt56-run-handoff.md
?? docs/research/setup-hook-handoff.md
?? docs/research/value-support-handoff.md
?? docs/superpowers/plans/2026-07-18-autonomous-mission-phase-0.md
?? docs/superpowers/specs/2026-07-18-autonomous-build-week-mission-design.md
```

These paths are pre-existing mission inputs or user changes. They are not absorbed
into this ledger's documentation-only commit.

## Objective register

| ID | Objective | Owners/reviewers | Dependencies | Status | Acceptance criteria | Evidence |
| --- | --- | --- | --- | --- | --- | --- |
| P0 | Audit and mission design | Autonomous mission owner; independent review domains: architecture/API/persistence, research reconciliation, and quality/release | Baseline Git snapshot, three Phase 0 audits, six research handoffs, product audit, baseline test result | `in_progress` | Design, handoffs, audit artifacts, and this append-only ledger are preserved; risks, dependencies, owners, exact verification commands, and review disagreements are reconciled | Immutable baseline and verification entries in this ledger; mission design and Phase 0 inputs |
| P1 | Executable roadmap and truthful docs | Documentation/release owner; quality/release reviewer | P0 | `pending` | Roadmap, architecture, execution policy, README, submission, demo, and research status agree; every capability is labeled implemented, development-only, blocked, or future | To be appended under P1 with documentation checks |
| P2 | Real-model trial and deterministic replay | Trial implementation owner; human paid-run operator; research reconciliation and quality/release reviewers | P0 and P1; live attempt additionally requires the current implementation pin and external spend/model authority | `pending` | Current-pin tooling, strict artifact schema, deterministic replay, malformed-claim tests, provenance checks, render equality, and redaction checks pass; at most one paid request occurs only after every external gate passes, otherwise the live lane records `blocked` | To be appended under P2; the paid lane is independent of P3-P8 |
| P3 | Deterministic Python setup contract | Setup/runtime owner; architecture/API/persistence reviewer | P0 and P1; P2 is not a prerequisite | `pending` | Versioned schema and lossless persistence land first; product-owned `none` and `wheel-no-deps` plans produce symmetric evidence; installed Layer A and repository tests work end to end; API/CLI/UI expose provenance; Layer B waits for all Layer-A gates | To be appended under P3 with focused and full-suite evidence |
| P4 | Corpus lifecycle v2 | Corpus/persistence owner; architecture/API/persistence and research reconciliation reviewers | P3 contract and persistence conventions | `pending` | Git identity and ancestry, deterministic migration/quarantine, immutable contracts and versions, append-only observations, atomic report completion, retention, and inspection work; unavailable lifecycle signing blocks promotion/rebinding but not conservative replay | To be appended under P4 with migration and adversarial evidence |
| P5 | Intended-change executable oracles | Oracle owner; independent authenticated approver; architecture/API/persistence reviewer | P3 and P4 | `pending` | Strict identities and bindings, approval verification, one hermetic exact-pytest-leaf adapter, pure outcome classification, persistence, rendering, and adversarial tests work; absent authenticated approval yields `BLOCKED-INTENDED-AUTHORITY` and `RISKY` | To be appended under P5; external approval is a separate gate |
| P6 | Frozen benchmark harness and development baseline | Benchmark owner; truth-separated evaluator owner; research reconciliation and quality/release reviewers | P3 for reproducible setup; P5 for intended-change qualification cases; external isolation and evaluator truth for scored qualification | `pending` | Versioned contracts, pure scorer outside `aggregate()`, frozen cases, admission and anti-gaming checks, CI smoke, telemetry, and an explicit baseline exist; qualification stays blocked without hostile-target isolation and total witness truth | To be appended under P6; unblinded development results cannot be called qualification |
| P7 | Values, exceptions, types, signatures, and serialization | Probe/codec owner; architecture/API/persistence and research reconciliation reviewers | P3, P4, and P6; corpus v2 precedes value persistence | `pending` | Separate probe and observation-codec versions preserve supported values losslessly; unsupported or ambiguous values abstain; each Layer-A increment works end to end before matching Layer-B support is added | To be appended under P7 with compatibility and round-trip evidence |
| P8 | Adversarial product hardening | Security/quality owner; all three Phase 0 review domains | Local evidence from P2-P7; an externally blocked live P2 attempt does not stop local hardening | `pending` | False-safety, coverage, validation, receipt, executor, migration, atomicity, corruption, redaction, malformed-input, timeout, accessibility, and cross-platform risks have named invariants and deterministic tests; `aggregate()` remains pure | To be appended under P8 with red-green-refactor evidence |
| P9 | Demo, developer experience, and release | Product/release owner; human release reviewer; quality/release reviewer | P1 and P8; P2 and P6 must be complete or truthfully represented by explicit blocked evidence | `pending` | Hosted mode leads with the working offline path; evidence and corpus affordances are accessible; static assets, packaging, CI, install, demo, and release narrative are synchronized; unavailable public publishing fields remain blocked | To be appended under P9 with build, browser, packaging, and demo evidence |
| FINAL | Truthful autonomous mission release | Mission owner; human release approver; all three Phase 0 review domains | P0-P9 and every release-critical external gate | `pending` | All local acceptance criteria pass; every verified/refuted finding retains exact command/output evidence; external claims are either supported by their required authority or excluded as explicitly blocked; final PR, demo guidance, risks, and limitations are reviewable | To be appended under FINAL with final full-suite, artifact, and approval evidence |

## Dependency graph

```text
P0 -> P1
P0 -> P2  (parallel operational evidence lane; external gate applies only to paid run)
P1 -> P3 -> P4 -> P5
P3 ----------------> P6
P5 -- intended cases -> P6
P3 + P4 + P6 -------> P7
P2 + P3 + P4 + P5 + P6 + P7 -> P8
P1 + P8 + truthful P2/P6 state -> P9
P0 + P1 + P2 + P3 + P4 + P5 + P6 + P7 + P8 + P9 -> FINAL
```

P2 never authorizes deterministic verdicts and does not block the P3-P8 local
vertical slices. P4 must precede value persistence changes in P7 so corpus and value
migrations cannot conflict. P6 scoring is an evaluator concern outside product
aggregation. External signing, approval, isolation, spending, and publication gates
attach only to the authority-requiring operation; their absence must not fabricate
success or prevent unrelated conservative local work.

## Architecture decisions

| Decision | Selected rule | Consequence |
| --- | --- | --- |
| D1 | Use evidence-gated vertical slices, completing Layer A before the matching Layer B extension | Each schema or migration lands only with deterministic recovery, compatibility, provenance, and failure-path tests |
| D2 | Maintain separate contract-version namespaces for report, receipt, execution policy/manifest, probe, observation codec, setup, intended-oracle, corpus, benchmark release, and benchmark result contracts | Compatibility is decided in the relevant namespace; unknown or incompatible versions abstain or refuse writes |
| D3 | Run the real-model trial as a parallel operational lane | A paid result may add Characterize evidence but never changes deterministic authority or blocks local contract work; the trial must be repinned and reviewed before any request |
| D4 | Keep benchmark admission, witness replay, and scoring outside `aggregate()` | The benchmark may evaluate product evidence but cannot change findings or verdict semantics; `NO_REFUTATION_FOUND` is not proof of safety |
| D5 | Represent unavailable signing, intended-change approval, hostile-target isolation/truth, spend, and release authority as explicit blocked states | Work fails toward risk and remains inspectable; no model or local implementation invents external authority |
| D6 | Preserve the executor as a bounded trusted-host adapter and state that setup is not a sandbox | Hostile-target qualification requires a distinct disposable, network-denied boundary rather than stronger setup copy |
| D7 | Deterministic code, not model output, owns identities, evidence validation, classifications, benchmark outcomes, and verdicts | Schema-constrained model proposals remain untrusted inputs |

## Rejected alternatives

| Rejected alternative | Reason for rejection |
| --- | --- |
| Parallel conflicting migrations across corpus, setup, values, oracle, and benchmark subsystems | Shared persistence and protocol boundaries would make migration order ambiguous and regressions difficult to attribute |
| Demo-first integrity deferral | Visible polish cannot precede known false-safety, stale-provenance, validation, and atomicity fixes |
| Model-authored authority, including expected behavior, approval, benchmark truth, or verdicts | A model proposal cannot authenticate intended change, lifecycle promotion, hidden truth, or release acceptance |
| Setup-as-sandbox claims | Virtual environments and fixed setup commands do not remove target code's host filesystem or network authority |

## Verification evidence

### Git identity captured for the immutable baseline

```text
git rev-parse HEAD
ea14e2f4f7a16f15f0603b4e3b5355d258725a9c

git rev-parse origin/main
f6524eac4270cf566d3acbf1f3a77ebb24ed904f
```

### Baseline test attempts

The following two attempts are the exact Phase 0 baseline record:

```text
uv run pytest -q
Result: interrupted before collection; the checkout .venv contained macOS hidden,compressed,dataless Hypothesis source and bytecode files.

UV_PROJECT_ENVIRONMENT=/private/tmp/cross-examine-mission.Y52f1Y/venv uv run pytest -q
Result: 115 passed in 252.06s (0:04:12).
```

`/private/tmp/cross-examine-mission.Y52f1Y/venv` is an ephemeral local verification
environment and not a repository artifact. It was used to avoid relying on or mutating
the checkout's dataless `.venv`; it does not change repository behavior and is not
evidence of sandbox isolation.

Future evidence entries must append the objective ID, timestamp, exact command,
captured output or immutable artifact reference, decision, and any remaining
limitation. A completed objective without such an entry is invalid.

## Risks and limitations

| Risk | Baseline limitation and required posture |
| --- | --- |
| R1 false safety | A model-set `preserve_critical=False` can hide a preservation mismatch, and omitted touched symbols can disappear from the verdict; both require conservative validation and tests before safety claims |
| R2 report integrity | Reports are not fully revalidated on read, verdict equality and identifiers/linkage are not fully recomputed, and aggregation-stage validation can recurse; invalid evidence must not authorize decisions |
| R3 corpus authority | Mutable locators and symbols stand in for Git identity, duplicate pins overwrite evidence, and report completion is not atomic with corpus writes; P4 must replace these semantics before value persistence |
| R4 receipt context | Receipt v1 binds command/output but not repository, revision role, input, policy, runtime, or manifest; decided findings need context-bound receipts |
| R5 setup and value ambiguity | There is no deterministic install contract, Layer B can exceed Layer A's settled value contract, and protocol budget/minimization claims exceed implementation; unsupported cases abstain |
| R6 trusted-host exposure | The executor is not a sandbox, and a non-loopback service can expose unauthenticated host-authority execution; no hostile-target or public-safety claim is allowed without separate controls |
| R7 benchmark truth | No frozen harness, total witness oracle, or truth-separated target exists; local work is at most an unblinded development baseline |
| R8 external authority | Paid model access, intended-change approval, corpus lifecycle signing, evaluator truth isolation, public submission fields, and human release approval are not repository-owned capabilities |
| R9 release evidence | CI, packaging, accessibility, mobile/zoom/keyboard coverage, static-bundle equality, security, and deployed smoke gates remain incomplete |
| R10 local reproducibility | The successful baseline used an ephemeral temporary environment because the checkout `.venv` was unusable; CI and fresh environments must reproduce later claims |
| R11 Git maintenance | A stalled worktree creation and six malformed duplicate refs remain; neither is repaired as part of the mission ledger |

## External follow-ups

| Gate | Status | External owner/evidence required | Local safe behavior |
| --- | --- | --- | --- |
| G1 one paid GPT-5.6 Sol request and billing metadata | `blocked` until human authorization | Dedicated key/project, current model visibility and pricing, approved spend, one-attempt confirmation, usage/cost metadata | Complete offline preflight and deterministic replay; never fabricate or retry live evidence |
| G2 intended-change requirement approval | `blocked` until authenticated approval exists | Binding over repository identity, exact head, claim fingerprint, complete oracle set, setup profile, expiry, and approver identity | Emit `BLOCKED-INTENDED-AUTHORITY` and `RISKY`; do not let model prose approve a change |
| G3 corpus lifecycle promotion/rebinding signer | `blocked` until an external signer is configured | Signed lifecycle authority receipt with scope, identity, and audit trail | Keep promotion/rebinding disabled while ordinary conservative replay and inspection continue |
| G4 hostile-target benchmark isolation and evaluator truth separation | `blocked` until independently demonstrated | Disposable network-denied target boundary, evaluator-only truth, total witness coverage, and adversarial proof of separation | Label local results `UNBLINDED_DEVELOPMENT`; do not publish a qualification score |
| G5 public video, Devpost fields, and human release approval | `blocked` until supplied | Public artifact locations, final content review, and explicit human go/no-go | Finish and verify local demo/release artifacts without claiming publication or approval |

These blocked gate rows record missing repository authority; they do not change the
required initial `pending` status of P1-P9 or FINAL. When an objective reaches the
authority-requiring operation, append a transition to `blocked` with the exact failed
or unavailable gate evidence, or to `complete` only after the gate is proven.

## Next experiments

1. Close P0 by reconciling the three review domains and preserving the design,
   research, product-audit, baseline, and ledger commits without absorbing the user's
   pre-existing submission change.
2. For P1, mechanically compare roadmap, architecture, README, submission, demo, and
   research claims; append a truthful capability-status matrix and documentation check
   output.
3. In the parallel P2 lane, repin the trial to the implementation commit, build the
   offline artifact/replay contract, and stop before any paid request unless G1 is
   independently cleared.
4. Begin P3 with failing contract and lossless-persistence tests for `none` and
   `wheel-no-deps`; do not add installed Layer B until installed Layer A passes end to
   end.
5. Characterize P4 legacy migration, ancestry, duplicate replay, and atomicity failure
   cases before changing persistence; only after P4 clears may P7 persist new value
   contracts.
6. Build P6 contracts and its pure scorer as local development work while keeping the
   scored run blocked on G4; normalize bounded Layer-B exhaustion to
   `NO_REFUTATION_FOUND`.
7. Turn every valid P8 audit finding into a named failing invariant test before its
   fix, then run the relevant focused checks and the full backend suite in a fresh
   documented environment.
