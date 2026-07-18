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

Every `VERIFIED` or `REFUTED` finding must retain its exact command, captured output,
and a validated provenance reference. Deterministic validation must prove that the
provenance reference links the finding to its repository identity and revision,
execution context and receipt, and rendered evidence. Summaries may aid navigation
but never replace raw evidence or validated provenance. Models may propose only
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
| P2 | Real-model trial and deterministic replay | Trial implementation owner; human paid-run operator; research reconciliation and quality/release reviewers | Preflight/tooling design may proceed from P0 in parallel; execution or publication requires P1 truthful docs, then the current implementation pin, fresh review, and external spend/model authority | `pending` | Current-pin tooling, strict artifact schema, deterministic replay, malformed-claim tests, provenance checks, render equality, and redaction checks pass; after P1, at most one paid request occurs only after every external gate passes, otherwise the live lane records `blocked` | To be appended under P2; preflight/tooling is parallel, but execution/publication is logically gated by P1 and remains independent of P3-P8 |
| P3 | Deterministic Python setup contract | Setup/runtime owner; architecture/API/persistence reviewer | P0 and P1; P2 is not a prerequisite | `pending` | Versioned schema and lossless persistence land first; product-owned `none` and `wheel-no-deps` plans produce symmetric evidence; installed Layer A and repository tests work end to end; API/CLI/UI expose provenance; Layer B waits for all Layer-A gates | To be appended under P3 with focused and full-suite evidence |
| P4 | Corpus lifecycle v2 | Corpus/persistence owner; architecture/API/persistence and research reconciliation reviewers | P3 contract and persistence conventions | `pending` | Git identity and ancestry, deterministic migration/quarantine, immutable contracts and versions, append-only observations, atomic report completion, retention, and inspection work; unavailable lifecycle signing blocks promotion/rebinding but not conservative replay | To be appended under P4 with migration and adversarial evidence |
| P5 | Intended-change executable oracles | Oracle owner; independent authenticated approver; architecture/API/persistence reviewer | P3 and P4 | `pending` | Strict identities and bindings, approval verification, one hermetic exact-pytest-leaf adapter, pure outcome classification, persistence, rendering, and adversarial tests work; absent authenticated approval yields `BLOCKED-INTENDED-AUTHORITY` and `RISKY` | To be appended under P5; external approval is a separate gate |
| P6 | Frozen benchmark harness and development baseline | Benchmark owner; truth-separated evaluator owner; research reconciliation and quality/release reviewers | P3 for reproducible setup; P5 for intended-change qualification cases; external isolation and evaluator truth for scored qualification | `pending` | Versioned contracts, pure scorer outside `aggregate()`, frozen cases, admission and anti-gaming checks, CI smoke, telemetry, and an explicit baseline exist; qualification stays blocked without hostile-target isolation and total witness truth | To be appended under P6; unblinded development results cannot be called qualification |
| P7 | Values, exceptions, types, signatures, and serialization | Probe/codec owner; architecture/API/persistence and research reconciliation reviewers | P3, P4, and P6; corpus v2 precedes value persistence | `pending` | Separate probe and observation-codec versions preserve supported values losslessly; unsupported or ambiguous values abstain; each Layer-A increment works end to end before matching Layer-B support is added | To be appended under P7 with compatibility and round-trip evidence |
| P8 | Adversarial product hardening | Security/quality owner; all three Phase 0 review domains | Local evidence from P2-P7; an externally blocked live P2 attempt does not stop local hardening | `pending` | False-safety, coverage, validation, receipt, executor, migration, atomicity, corruption, redaction, malformed-input, timeout, accessibility, and cross-platform risks have named invariants and deterministic tests; `aggregate()` remains pure | To be appended under P8 with red-green-refactor evidence |
| P9 | Demo, developer experience, and release | Product/release owner; human release reviewer; quality/release reviewer | P1 and P8; P2 and P6 must be complete or truthfully represented by explicit blocked evidence | `pending` | Hosted mode leads with the working offline path; evidence and corpus affordances are accessible; static assets, packaging, CI, install, demo, and release narrative are synchronized; unavailable public publishing fields remain blocked | To be appended under P9 with build, browser, packaging, and demo evidence |
| FINAL | Truthful autonomous mission release | Mission owner; human release approver; all three Phase 0 review domains | P0-P9 and every release-critical external gate | `pending` | All local acceptance criteria pass; every `VERIFIED` or `REFUTED` finding retains its exact command, captured output, and validated provenance reference whose linkage to the finding, execution context, receipt, and rendered evidence is deterministically validated; external claims are either supported by their required authority or excluded as explicitly blocked; final PR, demo guidance, risks, and limitations are reviewable | To be appended under FINAL with final full-suite, artifact, provenance-linkage, and approval evidence |

## Dependency graph

```text
P0 -> P1
P0 -> P2 preflight/tooling design  (may proceed in parallel)
P1 -> P2 execution/publication    (required logical gate before repin/review/run)
P1 -> P3 -> P4 -> P5
P3 ----------------> P6
P5 -- intended cases -> P6
P3 + P4 + P6 -------> P7
P2 + P3 + P4 + P5 + P6 + P7 -> P8
P1 + P8 + truthful P2/P6 state -> P9
P0 + P1 + P2 + P3 + P4 + P5 + P6 + P7 + P8 + P9 -> FINAL
```

P2 preflight and tooling design may proceed from P0 as a parallel operational lane,
but P2 execution or publication is logically dependent on the completed P1 truthful
roadmap/docs reconciliation. Only after P1 may the trial be repinned to the current
implementation, freshly reviewed, and considered for execution. P2 never authorizes
deterministic verdicts and does not block the P3-P8 local vertical slices. P4 must
precede value persistence changes in P7 so corpus and value migrations cannot
conflict. P6 scoring is an evaluator concern outside product aggregation. External
signing, approval, isolation, spending, and publication gates attach only to the
authority-requiring operation; their absence must not fabricate success or prevent
unrelated conservative local work.

## Architecture decisions

| Decision | Selected rule | Consequence |
| --- | --- | --- |
| D1 | Use evidence-gated vertical slices, completing Layer A before the matching Layer B extension | Each schema or migration lands only with deterministic recovery, compatibility, provenance, and failure-path tests |
| D2 | Maintain separate contract-version namespaces for report, receipt, execution policy/manifest, probe, observation codec, setup, intended-oracle, corpus, benchmark release, and benchmark result contracts | Compatibility is decided in the relevant namespace; unknown or incompatible versions abstain or refuse writes |
| D3 | Run real-model preflight/tooling design as a parallel operational lane, while gating execution and publication on P1 | A paid result may add Characterize evidence but never changes deterministic authority or blocks local contract work; after P1 truthful docs, the trial must be repinned to the current implementation and freshly reviewed before any request or publication |
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

Future evidence entries must append the objective ID, timestamp, finding ID and
outcome when applicable, exact command, captured output, provenance reference,
provenance-linkage validation result, decision, and any remaining limitation. For
every `VERIFIED` or `REFUTED` finding, exact command and captured output are mandatory
and cannot be replaced by an artifact summary; the provenance reference must be
validated as linked to that finding, its repository revision, execution context and
receipt, and rendered evidence. A completed objective without such an entry is
invalid.

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
3. In the parallel P2 lane, design preflight/tooling and build the offline
   artifact/replay contract from P0; only after P1 truthful docs may the trial be
   repinned to the current implementation and freshly reviewed, and it must stop
   before any paid request unless G1 is independently cleared.
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

## 2026-07-18 Phase 0 audit reconciliation

This dated entry corrects the current-state implication of "Next experiments" item
1 without rewriting the immutable baseline or objective register. It reconciles the
three Phase 0 review domains, records the present audit artifacts, and is the latest
authoritative status entry for stable objective `P0`.

### Current architecture map

| Stage or boundary | Current owner and flow |
| --- | --- |
| Ingest | `src/cross_examine/ingest/service.py` |
| Characterize | `src/cross_examine/characterize/{models,service}.py` |
| Cross-examine | `src/cross_examine/cross_examine/{layer_a,layer_b,probe_protocol,probe_runner,hypothesis_worker}.py` |
| Aggregate | `src/cross_examine/schema.py::aggregate` |
| Render | `validation.py -> codec.py -> persistence -> API -> React` |
| Execution | `src/cross_examine/execution.py`; a bounded trusted-input host-process adapter, not a sandbox |
| Corpus feedback | `corpus/repository.py -> Pipeline._applicable_corpus/_pin_verified` |

These owners preserve the five-stage pipeline: Ingest, Characterize, Cross-examine,
Aggregate, and Render. Corpus feedback and execution support that pipeline but do not
gain verdict authority, and `aggregate()` remains pure.

### Prioritized P0 risks

These are release-blocking integrity risks, ordered by the earliest false-safety or
authority failure they can cause. A target phase may not be marked complete until
its acceptance scenario has deterministic evidence.

| Rank | Risk ID | Risk | Concrete acceptance scenario | Target phase |
| ---: | --- | --- | --- | --- |
| 1 | P0-R1 | A non-critical preservation mismatch can produce `SAFE` when a model sets `preserve_critical=False` | Given an observed preservation mismatch and `preserve_critical=False`, validation and aggregation cannot return `SAFE`; the mismatch remains named and the deterministic verdict is `RISKY` | P8 |
| 2 | P0-R2 | Touched-symbol coverage can be incomplete | Given a diff that touches symbols A and B and characterization that covers only A, the pipeline rejects the incomplete coverage or records B as unverifiable and returns `RISKY` | P8 |
| 3 | P0-R3 | Locator-only mutable corpus authority permits stale rebinding and overwrite | Given the same locator and symbol at different Git identities or ancestry, plus a duplicate pin, replay preserves immutable distinct evidence and refuses unauthorized overwrite, promotion, or rebinding | P4 |
| 4 | P0-R4 | Semantic report validation and validation-on-read are incomplete | Given a decodable stored report with a tampered verdict, duplicate or reserved ID, or broken claim/finding linkage, read validation rejects or quarantines it before rendering or decision use | P8 |
| 5 | P0-R5 | Aggregation-stage validation can recurse on the same invalid decided finding | Given a decided finding that fails aggregation-stage validation, the pipeline terminates deterministically with `RISKY` evidence rather than reaggregating the same invalid finding | P8 |
| 6 | P0-R6 | Completed-run and corpus writes are not atomic | Given an injected failure between completion persistence and corpus pinning, restart exposes either both committed effects or neither, never a completed run with a missing or partial corpus effect | P4 |
| 7 | P0-R7 | Unauthenticated non-loopback serving can expose trusted-host execution | Given `serve` configured for a non-loopback address without authentication, startup refuses or execution endpoints remain inaccessible until an explicit authenticated trusted-host policy is present | P8 |
| 8 | P0-R8 | No frozen benchmark harness exists | Given a fixed benchmark release run twice, immutable case and manifest identities, truth separation, witness replay, and deterministic scores agree; without hostile-target isolation the result remains `UNBLINDED_DEVELOPMENT`, not qualification | P6 |

### Prioritized P1 risks

| Rank | Risk ID | Risk | Required resolution | Target phase |
| ---: | --- | --- | --- | --- |
| 1 | P1-R1 | Receipt v1 is context-free | Bind receipts to repository identity, revision role, input, expected value, policy, runtime, and manifest, and retain receipts for attempted abstentions | P2 |
| 2 | P1-R2 | Layer-B tuple values drift to JSON lists beyond Layer A's settled value contract | Version the probe and observation codec contracts; round-trip supported values and abstain on unsupported or ambiguous values | P7 |
| 3 | P1-R3 | `ProbePlan` budget and minimization claims exceed implementation | Make budget enforcement and minimization deterministic, or narrow the schema and product claims to implemented behavior | P7 |
| 4 | P1-R4 | No deterministic setup contract exists | Define versioned setup plans and persist symmetric command/output evidence for product-owned `none` and `wheel-no-deps` flows | P3 |
| 5 | P1-R5 | API and executor timeout limits disagree | Establish one versioned timeout policy so API-accepted runs cannot be rejected by the executor solely because defaults differ | P8 |
| 6 | P1-R6 | Run recovery and run-spec persistence are incomplete | Persist the submitted and resolved run context and deterministically recover or terminate stale queued/running records after restart | P3 |
| 7 | P1-R7 | Corpus growth misreports duplicate replay as new rows | Count inserted immutable observations separately from touched or replayed rows, including duplicate-pin cases | P4 |
| 8 | P1-R8 | Provenance and manifests are not rendered | Carry validated receipt and manifest references through persistence, API/CLI, and React render equality checks | P3 |
| 9 | P1-R9 | CI, accessibility, bundle, fixture, and deployment gates are incomplete | Add benchmark and packaging/security gates, Python and sdist coverage, accessible mobile/zoom/keyboard routes, generated-bundle equality, hosted-fixture byte equality, and deployed smoke checks | P9 |

### Research claim reconciliation

| Prior or ambiguous claim | Current reconciled statement |
| --- | --- |
| Receipt v1 was absent | Receipt v1 is implemented, but it is not context-bound and attempted abstentions may lose their receipts |
| Pinning occurred before validation | Validation now precedes pinning, but completed-run persistence and corpus writes are not atomic |
| The real-model handoff is current | `docs/research/real-gpt56-run-handoff.md` pins the pre-receipt `f6524ea`; it must be repinned to the current implementation and freshly reviewed before any request or publication |
| One shared schema version can cover compatibility | Separate version namespaces remain mandatory for report, receipt, execution policy/manifest, probe, observation codec, setup, intended-oracle, corpus, benchmark release, and benchmark result contracts |
| Value persistence can land independently | Corpus v2 must precede value persistence changes so corpus and value migrations cannot conflict |
| Setup provides sufficient isolation | Setup creates prepared environments; it is not hostile-target isolation or benchmark isolation |
| One approval or key can stand in for all authority | Corpus lifecycle authority, intended-change approval, benchmark evaluator truth, and API-key/spend authority remain distinct external authority systems |
| Bounded Layer-B exhaustion proves correctness | For benchmark scoring, a bounded Layer-B search with no counterexample maps to `NO_REFUTATION_FOUND`, never proof of safety |
| Intended-change Layer B can infer its contract | Intended-change Layer B remains abstaining because no implementation contract has been approved |

### P0 present-evidence inventory

| Required evidence | Present artifact or evidence |
| --- | --- |
| Mission design | `docs/superpowers/specs/2026-07-18-autonomous-build-week-mission-design.md` |
| Phase 0 plan | `docs/superpowers/plans/2026-07-18-autonomous-mission-phase-0.md` |
| Three independent review domains | architecture/API/persistence; research reconciliation; quality/release |
| Six research handoffs | `docs/research/benchmark-handoff.md`; `docs/research/corpus-lifecycle-handoff.md`; `docs/research/intended-oracle-handoff.md`; `docs/research/real-gpt56-run-handoff.md`; `docs/research/setup-hook-handoff.md`; `docs/research/value-support-handoff.md` |
| Product audit | `artifacts/product-audit-2026-07-18/audit.md` and its seven captured product views |
| Active branch | `codex/autonomous-build-week` |
| Backend baseline | Exact command `UV_PROJECT_ENVIRONMENT=/private/tmp/cross-examine-mission.Y52f1Y/venv uv run pytest -q`; captured output `115 passed in 252.06s (0:04:12)` |

### P0 status transition

| Date | Objective | Previous state | New state | Reason | Supporting evidence |
| --- | --- | --- | --- | --- | --- |
| 2026-07-18 | P0 | `in_progress` | `complete` | The design, plan, three review domains, six handoffs, product audit, branch, baseline result, architecture, prioritized risks, acceptance scenarios, target phases, and stale-claim corrections are all present at the artifact level | Immutable Phase 0 baseline, verification evidence, and the present-evidence inventory above |

The immutable Phase 0 audit-package commit is produced by Task 3B. P0 is complete at
the artifact level; Task 3B's next documentation commit appends that immutable commit
link without amending this entry.

## 2026-07-19 Phase 0 immutable closure

This append-only closure links the reviewed Phase 0 evidence package to commit
`5bea8baf5f031d9bfdff592b3e85e001842c651b` (`docs: record autonomous mission
audit`) on branch `codex/autonomous-build-week`. The package review was approved
without findings. Its scope was exactly these 16 files:

```text
artifacts/product-audit-2026-07-18/01-welcome.png
artifacts/product-audit-2026-07-18/02-run-locally.png
artifacts/product-audit-2026-07-18/03-verification-form.png
artifacts/product-audit-2026-07-18/04-hero-result.png
artifacts/product-audit-2026-07-18/05-expanded-evidence.png
artifacts/product-audit-2026-07-18/06-sidebar-expanded.png
artifacts/product-audit-2026-07-18/07-mobile-verification-form.png
artifacts/product-audit-2026-07-18/audit.md
docs/research/benchmark-handoff.md
docs/research/corpus-lifecycle-handoff.md
docs/research/intended-oracle-handoff.md
docs/research/real-gpt56-run-handoff.md
docs/research/setup-hook-handoff.md
docs/research/value-support-handoff.md
docs/superpowers/plans/2026-07-18-autonomous-mission-phase-0.md
docs/superpowers/specs/2026-07-18-autonomous-build-week-mission-design.md
```

The source-preservation review checked the six research handoffs, product-audit
report, and seven screenshots against all 14 supplied SHA-256 records. Every record
returned `OK`; the plan and approved design completed the exact 16-file scope:

```text
c94f32a621faee070173a52f3228a087172579b1b13c2f3592fedfd3044ee824  docs/research/real-gpt56-run-handoff.md
1b015c7ac8731425bd731ac7431aada90b0e3bdbd16ccc38d11b3d9ea116f18b  docs/research/setup-hook-handoff.md
02e27e5220a68a207f944175356df03a10c6ec886c415b567f86befe312a7722  docs/research/benchmark-handoff.md
6cd22809f2d1b89a7c4fc65ea21c6fff0663e78ef216251f4f8c36586f74d51b  docs/research/intended-oracle-handoff.md
c7a457f664fa7a56a630a2e5e7aecc857b7391159f68f00238bc2278973fd97a  docs/research/corpus-lifecycle-handoff.md
47eefa7924c567f26f918db34295a95f343a0941b058f9900a8d161cea2f23bc  docs/research/value-support-handoff.md
fc19990bba1f8553d2f5842e47aac7dc48c724be1cc6c7c7e8f09942d6e3acc6  artifacts/product-audit-2026-07-18/audit.md
5de70704e0511c1287e7e3364c27daba2bdf52c872c50e9df7d6947b56f626db  artifacts/product-audit-2026-07-18/01-welcome.png
3a9d1ee925e0c34fc1ae371ededbd052fecc6035d119c2ed6f15f6998c4d4904  artifacts/product-audit-2026-07-18/02-run-locally.png
71c0a3d921ad736fc26d36c1c4f33c99e9df0b6d412aaff6793376bfe3a5231e  artifacts/product-audit-2026-07-18/03-verification-form.png
d83bd7ddac26d9898453f9d79c849d04e033bb0b2ba2e345b8bba1993026e16f  artifacts/product-audit-2026-07-18/04-hero-result.png
75fc40c8dce7cc5cff0df51798623e2f9d3b52cb3978b56dacb5b408168c7ce9  artifacts/product-audit-2026-07-18/05-expanded-evidence.png
4f644a2c49260361ca877ebc6c91ad4cc47643dacb0c68692e7848b80503e59f  artifacts/product-audit-2026-07-18/06-sidebar-expanded.png
f5061c2f4b1671a160462feac1e0c9a883a57e54a00d0fa07bdedf782589fc03  artifacts/product-audit-2026-07-18/07-mobile-verification-form.png
```

The same review found six inherited Markdown hard-break lines with trailing spaces:
three in `docs/research/benchmark-handoff.md`, one in
`docs/research/value-support-handoff.md`, and two in the approved design. Normalizing
them would have changed preserved source bytes (including supplied handoff hashes), so
source preservation won. The limitation is confined to the already immutable audit
package; this closure and the preserved submission checklist edit are whitespace
clean.

### Final verification evidence

The marker-safe placeholder scan produced no output and exited 1, which means no
marker matched:

```text
rg -n 'T[B]D|T[O]DO|PLACEHOLD[E]R|fill [i]n' docs/research/autonomous-mission-ledger.md docs/superpowers/specs/2026-07-18-autonomous-build-week-mission-design.md docs/superpowers/plans/2026-07-18-autonomous-mission-phase-0.md
```

The required Ruff command first encountered the local workspace sandbox's denial of
the external uv cache, with this exact output:

```text
UV_PROJECT_ENVIRONMENT=/private/tmp/cross-examine-mission.Y52f1Y/venv uv run ruff check .
error: Failed to initialize cache at `/Users/stefanospalivos/.cache/uv`
  Caused by: failed to open file `/Users/stefanospalivos/.cache/uv/sdists-v9/.git`: Operation not permitted (os error 1)
```

The exact command was rerun with authorized access to that existing cache and exited
0 with this captured output:

```text
UV_PROJECT_ENVIRONMENT=/private/tmp/cross-examine-mission.Y52f1Y/venv uv run ruff check .
   Building cross-examine @ file:///Users/stefanospalivos/Documents/cross%20examine
      Built cross-examine @ file:///Users/stefanospalivos/Documents/cross%20examine
Uninstalled 1 package in 2ms
Installed 1 package in 1ms
All checks passed!
```

The full required test command exited 0 with this captured output:

```text
UV_PROJECT_ENVIRONMENT=/private/tmp/cross-examine-mission.Y52f1Y/venv uv run pytest
============================= test session starts ==============================
platform darwin -- Python 3.12.13, pytest-9.1.1, pluggy-1.6.0
rootdir: /Users/stefanospalivos/Documents/cross examine
configfile: pyproject.toml
testpaths: tests
plugins: cov-7.1.0, asyncio-1.4.0, anyio-4.14.2, hypothesis-6.156.6
asyncio: mode=Mode.STRICT, debug=False, asyncio_default_fixture_loop_scope=None, asyncio_default_test_loop_scope=function
collected 115 items

tests/e2e/test_cli_demo.py ....                                          [  3%]
tests/e2e/test_layer_a_pipeline.py ........                              [ 10%]
tests/integration/test_api_fixture.py .........                          [ 18%]
tests/integration/test_api_jobs.py ...                                   [ 20%]
tests/integration/test_corpus.py .....                                   [ 25%]
tests/integration/test_hosted_fixture_capture.py .                       [ 26%]
tests/integration/test_ingest.py .                                       [ 26%]
tests/integration/test_layer_a.py .....                                  [ 31%]
tests/integration/test_layer_b.py ..                                     [ 33%]
tests/integration/test_probe_plan_relations.py ....                      [ 36%]
tests/integration/test_run_repository.py ..                              [ 38%]
tests/release/test_local_product_run.py .                                [ 39%]
tests/release/test_wheel_install.py .                                    [ 40%]
tests/unit/test_characterize.py ...........                              [ 49%]
tests/unit/test_codec.py ....                                            [ 53%]
tests/unit/test_edge_catalog.py ....                                     [ 56%]
tests/unit/test_execution.py ....................                        [ 73%]
tests/unit/test_ingest_symbols.py .                                      [ 74%]
tests/unit/test_probe_plans.py .........                                 [ 82%]
tests/unit/test_probe_runner.py .                                        [ 83%]
tests/unit/test_schema.py ..........                                     [ 92%]
tests/unit/test_validation.py .........                                  [100%]

============================= 115 passed in 25.72s ==============================
```

Phase 0 closes with these remaining limitations: verification still depends on the
ephemeral `/private/tmp/cross-examine-mission.Y52f1Y/venv` because the checkout
`.venv` contains macOS dataless placeholders; six malformed duplicate Git refs remain
untouched; and paid-model/spend, intended-change approval, lifecycle signing,
hostile-target isolation and truth separation, publication, and human release gates
remain externally blocked. The closure commit uses subject
`docs: establish autonomous mission ledger`; its immutable hash is appended by the
next Phase 1 documentation commit rather than by amending history.

## 2026-07-19 Phase 1 truthful-status start

Phase 0 closure and remote delivery are pinned by commit
`b6997eed8e53b94ea6efb25b62dc401d55fc2bee` on
`codex/autonomous-build-week`. That immutable commit contains the closure record and
the preserved submission checklist change; upstream equality was verified before this
Phase 1 entry began.

### P1 status transition

| Date | Objective | Previous state | New state | Reason | Supporting evidence |
| --- | --- | --- | --- | --- | --- |
| 2026-07-19 | P1 | `pending` | `in_progress` | Independent audits found current documents mix implemented mechanisms, bounded development evidence, future design, and externally blocked authority. Work began with a test-first authoritative four-state contract. | `docs/capability-status.md`; `docs/research/phase-1-roadmap-handoff.md`; `docs/superpowers/plans/2026-07-18-autonomous-mission-phase-1.md`; `tests/unit/test_documentation.py` |

### Audit and review ownership

| Owner | Read-only output | Finding carried into P1 |
| --- | --- | --- |
| Independent documentation/capability auditor | `.superpowers/sdd/phase1-docs-audit.md` | Current executable scope, false-SAFE and coverage gaps, receipt/context limits, setup/corpus/value/benchmark state, external gates, and release-evidence boundaries |
| Independent roadmap/documentation reviewer | `.superpowers/sdd/phase1-roadmap-review.md` | Dependency ordering, stale roadmap/public claims, UI/demo contradictions, verification requirements, and the corrected reviewed Phase 1 plan |

The ignored scratch outputs remain review inputs. Their durable conclusions are recorded
in the tracked capability matrix, Phase 1 handoff risk register, and measurable exits.
The reviewed plan passed after the explicit repeated-run receipt correction removed the
invalid Corpus-page no-growth proof.

### Authoritative artifacts and TDD start evidence

The current truth source is `docs/capability-status.md`; the evidence/decision record is
`docs/research/phase-1-roadmap-handoff.md`; the reviewed execution contract is
`docs/superpowers/plans/2026-07-18-autonomous-mission-phase-1.md`; and
`tests/unit/test_documentation.py` checks real repository links, same-document GitHub-
style heading fragments, and the exact four-state vocabulary.

Before either missing authoritative document existed, the required focused command
first encountered the known external uv-cache sandbox restriction. Rerunning the same
command with approved cache access reached the tests and produced the expected RED:

```text
UV_PROJECT_ENVIRONMENT=/private/tmp/cross-examine-mission.Y52f1Y/venv uv run pytest -q tests/unit/test_documentation.py
FF                                                                       [100%]
AssertionError: Missing authoritative documentation surfaces: docs/capability-status.md, docs/research/phase-1-roadmap-handoff.md
FAILED tests/unit/test_documentation.py::test_authoritative_documentation_surfaces_have_resolving_local_links
FAILED tests/unit/test_documentation.py::test_capability_matrix_uses_only_authoritative_current_states
2 failed in 1.26s
```

This is a Task 1 start record, not a completion transition. Passing focused/full
verification and the immutable Task 1 commit are appended only after they exist.

### Current limitations and Task 2 gate

The matrix does not close runtime risks. `SAFE` remains bounded to characterized,
represented, supported findings. Preservation criticality, omitted candidate coverage,
semantic report validation/read validation, aggregation-failure recursion, and current
lossy value paths require the early P2 integrity gate. The supported service posture is
loopback even though the CLI does not enforce it; the executor retains trusted-host
authority and best-effort cleanup. Completed reports persist, but queue/SSE history is
in memory and stale jobs are not recovered. Evidence remains limited to tested Python
3.12, wheel smoke, configured rather than cited-green CI, semantic rather than byte-equal
fixture checks, and focused Chromium/axe coverage. Paid model/spend, lifecycle signing,
intended approval, hostile-target isolation/evaluator truth, public publication, and
human release approval remain separate external gates.

Task 2 may start only after an independent reviewer approves the exact Task 1 five-file
commit with no Critical or Important finding. Task 2 then reconciles architecture,
execution policy, ProbePlan, provenance, and the six preserved research handoffs; it
must add superseding notes rather than rewriting immutable Phase 0 source evidence.

### Task 1 implementation checkpoint

After the authoritative matrix, handoff, and transition existed, the focused GREEN
command exited 0:

```text
UV_PROJECT_ENVIRONMENT=/private/tmp/cross-examine-mission.Y52f1Y/venv uv run pytest -q tests/unit/test_documentation.py
..                                                                       [100%]
2 passed in 4.63s
```

The first repository-wide checks also exited 0:

```text
UV_PROJECT_ENVIRONMENT=/private/tmp/cross-examine-mission.Y52f1Y/venv uv run ruff check .
All checks passed!

UV_PROJECT_ENVIRONMENT=/private/tmp/cross-examine-mission.Y52f1Y/venv uv run pytest -q
........................................................................ [ 61%]
.............................................                            [100%]
117 passed in 25.73s
```

This checkpoint remains `in_progress`. The final non-quiet suite, exact index review,
commit, and independent Task 1 review remain required before Task 2 starts.

### Task 1 final local-suite correction

This later append supersedes only the preceding checkpoint's statement that the
non-quiet suite remained pending. After the evidence files were updated, the focused
documentation test and Ruff rerun exited 0 with `2 passed in 2.16s` and
`All checks passed!`. The required non-quiet full command then exited 0:

```text
UV_PROJECT_ENVIRONMENT=/private/tmp/cross-examine-mission.Y52f1Y/venv uv run pytest
======================= 117 passed in 103.51s (0:01:43) ========================
```

Collection advanced continuously to all 117 items before execution completed. The
longer duration is preserved as observed evidence rather than treated as a hang or
silently replaced by the earlier quiet run. Exact index review, commit, and independent
review remain pending, so Task 1 and P1 both remain `in_progress`.
