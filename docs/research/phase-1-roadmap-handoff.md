# Phase 1 roadmap and truthful-status handoff

Date: 2026-07-19
Product baseline: `b6997eed8e53b94ea6efb25b62dc401d55fc2bee`
Objective state: `P1 in_progress`
Task 1 state: `in_progress`

This handoff records the evidence and decisions for the documentation reconciliation
defined by the [reviewed Phase 1 plan](../superpowers/plans/2026-07-18-autonomous-mission-phase-1.md).
Current product truth lives in the [capability-status matrix](../capability-status.md),
while objective transitions remain append-only in the
[autonomous mission ledger](autonomous-mission-ledger.md). Neither Task 1 nor P1 is
claimed complete in this entry.

## Hypothesis

Current public and engineering documents mix executable mechanisms with incomplete
trust guarantees, proposed designs, historical evidence, and externally blocked
authority. One evidence-backed four-state capability matrix, followed by scoped copy on
every public surface, should eliminate those contradictions without changing runtime
behavior or verdict authority.

## Audit sources

The Task 1 synthesis uses these read-only sources:

- `.superpowers/sdd/phase1-docs-audit.md`, an independent documentation/capability
  audit of current prose, source, tests, package, CI, release, frontend, and all six
  research handoffs;
- `.superpowers/sdd/phase1-roadmap-review.md`, an independent roadmap/dependency and
  claim-boundary review;
- immutable Phase 0 audit package
  `5bea8baf5f031d9bfdff592b3e85e001842c651b`;
- Phase 0 closure/push commit
  `b6997eed8e53b94ea6efb25b62dc401d55fc2bee`;
- current runtime, tests, package metadata, CI workflow, release scripts, and the six
  preserved research handoffs.

The two ignored scratch audits are review inputs, not shipped authority. Their findings
are preserved in the tracked matrix, risk register, decisions, and measurable exits.

## Architecture invariants

1. Preserve Ingest, Characterize, Cross-examine, Aggregate, and Render.
2. Models may propose schema-constrained Claims and optional ProbePlans only.
   Deterministic code owns evidence validation, outcomes, scoring, and verdicts.
3. A `VERIFIED` or `REFUTED` finding must carry exact command/output and a valid receipt;
   an abstention may instead show a deterministic diagnostic.
4. EvidenceReceipt v1 is command/output association metadata, not contextual provenance,
   authentication, attestation, or semantic proof.
5. `SAFE` is bounded to represented supported findings and is not proof of complete
   repository safety.
6. The executor remains a trusted-input host-process adapter, not a sandbox. Loopback is
   the only supported service posture even though the CLI does not enforce it.
7. `aggregate()` remains pure and imports no IO, model, network, subprocess, database,
   benchmark, or framework code.
8. Layer A works end to end before a corresponding Layer B extension. Build Week target
   scope remains Python repositories.
9. Historical Phase 0 research bytes remain recoverable at commit
   `5bea8baf5f031d9bfdff592b3e85e001842c651b`; later status notes supersede claims
   without rewriting that evidence.

## Risk register and ordered owners

| Risk | Current evidence boundary | Required disposition | Owner |
| --- | --- | --- | --- |
| False `SAFE` from non-critical preservation mismatch | `layer_a.py:188-195`; `schema.py:223-241` | Any observed preservation mismatch prevents `SAFE` | P2 integrity gate, repeated at P8 |
| Missing candidate coverage | Characterization validates shape but not one claim per discovered candidate | Omitted changed-file candidates are rejected or represented as critical abstentions | P2 integrity gate, repeated at P8 |
| Context-free and incomplete semantic validation | Receipt v1 hashes command/output and validates substring association only | Bind context and reject verdict, ID, and linkage tampering on write and read | P2 integrity gate |
| Aggregation validation recursion | Invalid decided evidence can reach aggregation failure handling | Return one valid `RISKY` abstention without recursive reaggregation or partial corpus effects | P2 integrity gate, repeated at P8 |
| Lossy current value paths | Ordinary JSON can convert tuples and erase nominal identity | Existing ambiguous paths abstain before any new value family is added | P2 integrity gate |
| Unsupported non-loopback service exposure | CLI accepts non-loopback host without authentication | Refuse the unsupported posture and align timeout policy before setup expansion | P3 prerequisite, enforced at P8 |
| Missing setup, recovery, and rendered provenance | Source paths, in-memory queue/SSE, and unrendered manifests | Persist versioned setup/run context and prove restart/render equality | P3 |
| Mutable locator-only corpus | No ancestry/base revalidation; duplicate evidence and completion are mutable/non-atomic | Migrate conservatively with immutable observations and atomic completion | P4 |
| Missing intended authority | No authenticated complete approval binding | Build fail-closed adapter; keep each unauthenticated claim blocked | P5 and external G2 |
| No frozen benchmark or qualification isolation | Design exists; no package/cases/scorer/current baseline | Build unblinded development harness; withhold qualification without G4 | P6 and external G4 |
| Value expansion could mask integrity debt | New family design is separate from present coercion defects | Expand only after P4 migration and P6 development contract | P7 |
| Incomplete release evidence | No cited green matrix, sdist, fixture-byte, broad accessibility, or deployed proof | Close local gates and preserve external release approval as blocked | P9 and external G5 |

## Decisions and rejected alternatives

| Decision | Selected rule | Rejected alternative and reason |
| --- | --- | --- |
| Current truth | One matrix uses only `implemented`, `development-only`, `blocked external`, and `future` | Per-document ad hoc labels drift and make reviews non-deterministic |
| Scope of Phase 1 | Documentation/status, one deterministic doc test, and later copy-only UI corrections | Runtime fixes inside a truth-reconciliation phase would blur evidence and review scope |
| Safety language | Define bounded `SAFE` and name every open false-safety/coverage/semantic risk | Treating deterministic aggregation as complete safety overclaims its upstream inputs |
| Receipt language | Promise receipts only for decided findings and state v1 limits | Calling a context-free hash provenance or attestation grants authority the receipt lacks |
| Discovery language | Separate broad changed-file candidate discovery from narrow probe eligibility | “Touched symbols” incorrectly implies changed-line precision and executable support |
| Execution posture | Supported loopback trusted-host adapter; explicitly disclose missing enforcement | “Sandbox” or unqualified deterministic execution hides target filesystem/network authority |
| Dependency order | P2 integrity core and P3 policy/setup conventions precede P4-P7 expansion; P8 repeats broader hardening | Deferring known false-SAFE and lossy-value defects until after capability expansion compounds unsafe state |
| External gates | Record each authority separately as `blocked external` | One key, signer, approval, evaluator, or release decision cannot substitute for another |
| Historical evidence | Add superseding status notes later; never rewrite the Phase 0 package | Editing preserved handoffs would destroy supplied hashes and audit provenance |

## Plan-review result

The independent roadmap review first reported ordering, wording, reproducibility, UI,
and verification gaps. The reviewed plan now:

- separates the early P2 integrity core from later P8 breadth;
- makes loopback a supported posture rather than an enforced current fact;
- calls changed-file items candidate definitions and separates probe eligibility;
- declares tuple ProbePlans unsupported in the reliable v1 path;
- removes the invalid Corpus-page no-growth proof in favor of the repeat-run receipt;
- splits current lossless-value integrity from later P7 value-family expansion;
- uses Oxlint, the verified temporary uv environment, explicit local-link checks, the
  repository verifier, frontend install/build/tests, and fresh/repeat hero commands;
- keeps push delivery evidence distinct from local documentation correctness.

The final explicit repeat-receipt demo correction cleared the plan review. Task-level
implementation still requires a fresh independent specification/quality review before
the next task.

## Task 1 acceptance criteria

Task 1 is not complete merely because the files exist. Its review gate requires all of
the following:

1. The capability matrix covers every named current, planned, and external capability;
   every row has one allowed state, exact evidence, supported scope, a limitation, an
   owner phase, and a measurable exit.
2. Bounded `SAFE`, receipt v1, discovery/eligibility, trusted-host/loopback, durability,
   runtime/package/CI/browser evidence, external-authority, integrity-order, and value
   split doctrines are explicit.
3. The documentation contract test first fails only because the two authoritative
   documents are absent, then passes against real repository files.
4. The ledger appends the Phase 0 closure pin, `P1 pending -> in_progress`, both audit
   owners/outputs, authoritative artifacts, limitations, and the Task 2 gate.
5. Focused test, Ruff, full pytest, whitespace check, and exact five-path index pass.
6. A fresh reviewer finds no Critical or Important scope, truth, or test defect.

## TDD evidence

The first sandboxed invocation could not initialize the existing external uv cache and
exited before test collection:

```text
UV_PROJECT_ENVIRONMENT=/private/tmp/cross-examine-mission.Y52f1Y/venv uv run pytest -q tests/unit/test_documentation.py
error: Failed to initialize cache at `/Users/stefanospalivos/.cache/uv`
  Caused by: failed to open file `/Users/stefanospalivos/.cache/uv/sdists-v9/.git`: Operation not permitted (os error 1)
```

The exact command was rerun with approved access. It reached both real tests and produced
the expected RED failure, not an import or syntax error:

```text
FF                                                                       [100%]
AssertionError: Missing authoritative documentation surfaces: docs/capability-status.md, docs/research/phase-1-roadmap-handoff.md
FAILED tests/unit/test_documentation.py::test_authoritative_documentation_surfaces_have_resolving_local_links
FAILED tests/unit/test_documentation.py::test_capability_matrix_uses_only_authoritative_current_states
2 failed in 1.26s
```

At that TDD checkpoint the missing documents had not been created. After the minimum
matrix, handoff, and ledger transition existed, the exact focused command passed:

```text
..                                                                       [100%]
2 passed in 4.63s
```

The first repository-wide implementation checks also passed before this evidence text
was added:

```text
UV_PROJECT_ENVIRONMENT=/private/tmp/cross-examine-mission.Y52f1Y/venv uv run ruff check .
All checks passed!

UV_PROJECT_ENVIRONMENT=/private/tmp/cross-examine-mission.Y52f1Y/venv uv run pytest -q
........................................................................ [ 61%]
.............................................                            [100%]
117 passed in 25.73s
```

After this evidence text was added, the final focused test and Ruff rerun also exited 0
with `2 passed in 2.16s` and `All checks passed!`. The mandatory non-quiet full suite
then exited 0 with this captured summary:

```text
======================= 117 passed in 103.51s (0:01:43) ========================
```

Collection progressed continuously to all 117 tests; the longer duration was observed,
not treated as a hang or replaced by a weaker check. Whitespace/index checks, commit,
and independent review remain later Task 1 gates. These results do not mark Task 1 or
P1 complete.

## Exact command register

Commands run so far:

```text
git rev-parse HEAD
git rev-parse '@{upstream}'
UV_PROJECT_ENVIRONMENT=/private/tmp/cross-examine-mission.Y52f1Y/venv uv run pytest -q tests/unit/test_documentation.py
UV_PROJECT_ENVIRONMENT=/private/tmp/cross-examine-mission.Y52f1Y/venv uv run ruff check .
UV_PROJECT_ENVIRONMENT=/private/tmp/cross-examine-mission.Y52f1Y/venv uv run pytest
UV_PROJECT_ENVIRONMENT=/private/tmp/cross-examine-mission.Y52f1Y/venv uv run pytest -q
```

Commands required before the Task 1 commit:

```text
UV_PROJECT_ENVIRONMENT=/private/tmp/cross-examine-mission.Y52f1Y/venv uv run pytest -q tests/unit/test_documentation.py
UV_PROJECT_ENVIRONMENT=/private/tmp/cross-examine-mission.Y52f1Y/venv uv run ruff check .
UV_PROJECT_ENVIRONMENT=/private/tmp/cross-examine-mission.Y52f1Y/venv uv run pytest
git diff --check
git diff --cached --name-only
git diff --cached --check
```

## Current task status and next gate

Task 1 remains `in_progress` through implementation and independent review. P1 remains
`in_progress` through Tasks 2-4. The next Task 2 gate is a clean review of this exact
five-file commit; only then may architecture, execution policy, ProbePlan, provenance,
and the six preserved handoffs receive their scoped trust-boundary reconciliation.

## Task 2A engineering trust-boundary reconciliation

Task 2A status: `in_progress`; uncommitted pending independent review. This subsection
appends the engineering-document rationale and does not alter the Task 1 evidence above.
The six immutable Phase 0 source handoffs remain unchanged for the separate Task 2B
superseding-status slice.

### Changed-claim rationale

| Surface | Prior implication | Reconciled current boundary |
| --- | --- | --- |
| `docs/architecture.md` | Target execution was deterministic; all findings had exact evidence; codec and React mirrored a lossless contract; a frozen oracle existed; every failure became risk evidence | Execution is model-free and bounded but target code retains nondeterminism and host authority; receipts are required only for decided findings; codec/React are current-field subsets; the benchmark is future; known failure/coverage gaps are explicit |
| `docs/execution-policy.md` | Every command produced a persisted audit manifest and the policy boundary described all relevant launches | Only successfully launched children return manifests to the immediate runner; Reports do not persist/render them; the allowlist governs top-level harness launches only |
| `docs/probe-plans.md` | List and tuple relations, budgeted breadth, bounded cost, minimization, and rendered structured provenance were implemented | The reliable path is list-only, executes one first seed, uses budget for proposal shape/order, runs no minimizer, and does not expose structured provenance in React |
| `docs/provenance.md` | Compilation and browser verification broadly covered the integrated shell | Evidence is focused Vitest coverage, one axe smoke with contrast disabled, two Chromium flows, production compilation, and POSIX bundle equality; untested accessibility/browser/deployment dimensions are named |

### Engineering decisions

1. Preserve the five stages and pure `aggregate()` while narrowing the inputs and
   evidence guarantees around them.
2. Call execution model-free and bounded, never deterministic target execution: target
   code can use time, randomness, filesystem, network, and child processes.
3. Describe EvidenceReceipt v1 as context-free command/output hash plus substring
   association. It does not bind repository/revision/role/input/policy/runtime/manifest,
   authenticate execution, recompute verdict, or validate IDs and claim/finding linkage.
4. Keep the executor's supported service posture at `127.0.0.1` while recording that the
   CLI does not enforce it and non-loopback unauthenticated serving is unsafe.
5. Record the effective 120-second executor ceiling, best-effort cleanup, top-level-only
   executable allowlist, and unpersisted/unrendered manifests rather than widening claims
   to the API's accepted values or target descendants.
6. Keep ProbePlan v1 development-only until typed tuple reconstruction, executed breadth,
   and an actual minimizer exist. Do not conflate its original seed with Hypothesis
   shrinking in Layer B.
7. Preserve source-component attribution while separating it from verdict provenance and
   accessibility/browser qualification.

Rejected alternatives were leaving current prose as aspirational architecture, calling
context-free receipt hashes attestation, treating a returned runner manifest as durable
Report evidence, or implying a planned benchmark/minimizer exists. Each would contradict
the authoritative capability matrix and executable tests.

### Evidence anchors and remaining limitations

The reconciliation is grounded in `schema.py:37-53,223-241`,
`validation.py:10-27`, `codec.py:22-87`, `execution.py:79-198,297-387`,
`characterize/service.py:54-100`, `probe_plans.py:31-110`,
`cross_examine/layer_a.py:185-195,218-352`,
`persistence/runs.py:29-125`, `api/app.py:49-85,177-294`, and the current
frontend report model/tests. The authoritative row-level status and exits remain in
`docs/capability-status.md`.

This documentation does not close the false-`SAFE`, omitted-candidate, semantic report
validation/read-validation, aggregation-recursion, non-loopback enforcement, timeout,
restart recovery, manifest rendering, typed-value, benchmark, browser, accessibility,
or external-authority gaps. Those remain assigned to their measured P2-P9 gates.

### Task 2A verification register

The post-edit gate uses exact claim, status, stale-pin, safety-boundary, local-link, and
whitespace/scope commands. Results are recorded only after the commands execute; Task 2A
and P1 remain `in_progress` regardless of a local passing scan until independent review
and integration are complete.

The initial post-edit commands were:

```text
rg -n "deterministic, no mode[l]|lossless persistence boundar[y]|mirrors, but does not reinterpre[t]|detects accidental provenance loss and report tamperin[g]|frozen oracl[e]:|Every stage exceptio[n]|no missing critical execution can produce SAF[E]|Every command return[s]|list or tuple paramete[r]|bounded cos[t]|the minimized deterministic counterexampl[e]|production compilation and browser verification cove[r]" docs/architecture.md docs/execution-policy.md docs/probe-plans.md docs/provenance.md docs/research/phase-1-roadmap-handoff.md
rg -n "^(Status:|Task 2A status:)|implemented|development-only|blocked external|future" docs/architecture.md docs/execution-policy.md docs/probe-plans.md docs/provenance.md docs/research/phase-1-roadmap-handoff.md
rg -n "f6524e[a]|ea14e2[f]|current working tre[e]|next slic[e]|Exact next implementation promp[t]" docs/architecture.md docs/execution-policy.md docs/probe-plans.md docs/provenance.md docs/research/phase-1-roadmap-handoff.md
rg -n "sandbox|trusted-input|network|filesystem|loopback|0\\.0\\.0\\.0|authentication|SAFE|UNVERIFIABLE|receipt|manifest|provenance" docs/architecture.md docs/execution-policy.md docs/probe-plans.md docs/provenance.md docs/research/phase-1-roadmap-handoff.md
UV_PROJECT_ENVIRONMENT=/private/tmp/cross-examine-mission.Y52f1Y/venv uv run pytest -q tests/unit/test_documentation.py
git diff --check -- docs/architecture.md docs/execution-policy.md docs/probe-plans.md docs/provenance.md docs/research/phase-1-roadmap-handoff.md
git diff --name-only -- docs/architecture.md docs/execution-policy.md docs/probe-plans.md docs/provenance.md docs/research/phase-1-roadmap-handoff.md
```

The overclaim scan returned one explicitly historical hit: the Task 2A rationale table's
“Prior implication” cell for ProbePlan. The same row immediately supplies the corrected
current boundary; no current engineering surface retained the scanned overclaim. The
status scan returned only the four authoritative labels, scoped future/development
statements, and the explicit `in_progress` Task 2A line. The stale-pin scan returned no
output and exit 1, meaning no pattern matched. The safety scan returned the expected
explicit boundaries and limitations rather than an unqualified sandbox, authentication,
receipt, manifest, provenance, or `SAFE` claim.

The focused documentation contract exited 0 with `2 passed in 2.65s`.
`git diff --check` exited 0 with no output. The exact scoped name check returned:

```text
docs/architecture.md
docs/execution-policy.md
docs/probe-plans.md
docs/provenance.md
docs/research/phase-1-roadmap-handoff.md
```

These are local implementation results only. Task 2A remains uncommitted and
`in_progress` pending independent review; P1 is not complete.

## Task 2B preserved research status and combined gate

Task 2B added one dated, superseding status block near the top of each Phase 0
research handoff:

- `real-gpt56-run-handoff.md` records its obsolete `f6524eac...` execution pin,
  the missing current-pin tooling/review, and the separately blocked G1 authority;
- `setup-hook-handoff.md` records the setup contract as future and dependent on
  the P2 integrity gate;
- `corpus-lifecycle-handoff.md` separates future conservative v2 work from the
  externally blocked G3 lifecycle mutation authority;
- `intended-oracle-handoff.md` separates the future adapter from the externally
  blocked G2 approval authority;
- `benchmark-handoff.md` separates a future development harness from externally
  blocked G4 qualification; and
- `value-support-handoff.md` separates current lossy-value integrity from later
  P7 value-family expansion.

Each block names immutable Phase 0 source commit
`5bea8baf5f031d9bfdff592b3e85e001842c651b`, distinguishes its historical
snapshot or applies-to pin from current documentation commit
`c3daef6d428aa775fae29b5f327c12dc6c2f3c4b`, links the authoritative
capability matrix, and says the preserved prose is design/history rather than
current implementation or authority. No original research line was deleted or
rewritten.

Task 2B verification established that the six pre-edit files matched their
immutable Phase 0 versions, each diff contained exactly one near-top block,
`git diff --numstat` showed 17-18 additions and zero deletions per file, all six
blocks contained both commit identities and the capability link, the only stale
product pin was the deliberately disclosed `f6524eac...` trial pin, and the
exact six-file `git diff --check` passed.

The combined Task 2 candidate therefore changes exactly the four engineering
documents, this append-only Phase 1 handoff, and six preserved source handoffs.
An independent reviewer found no Critical or Important issue. Its one Minor
observation was that the ProbePlan page originally said the validator rejected
all variadic signatures, while the implementation rejects an input domain only
when that domain targets a variadic parameter. The wording was narrowed to the
implemented boundary before commit.

The reviewer also confirmed the exact eleven-file scope, additions-only source
handoff blocks, resolving links, exact matrix states and G1-G4/dependency gates,
receipt substring limits, manifest loss, the 120/600-second mismatch, unenforced
loopback posture, top-level-only allowlist, one-seed/non-minimizing ProbePlan,
and narrow browser/axe evidence. The focused documentation contract passed with
`2 passed`; exact-path whitespace and scope checks were clean. Task 2 is ready
for its exact-path commit but P1 remains `in_progress` through Tasks 3-4.
