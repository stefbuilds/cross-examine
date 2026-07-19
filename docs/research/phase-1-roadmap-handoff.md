# Phase 1 roadmap and truthful-status handoff

Date: 2026-07-19
Product baseline: `b6997eed8e53b94ea6efb25b62dc401d55fc2bee`
Objective state: `P1 complete`
Task states: `Task 1 complete`; `Task 2 complete`; `Task 3 complete`; `Task 4 complete`

This handoff records the evidence and decisions for the documentation reconciliation
defined by the [reviewed Phase 1 plan](../superpowers/plans/2026-07-18-autonomous-mission-phase-1.md).
Current product truth lives in the [capability-status matrix](../capability-status.md),
while objective transitions remain append-only in the
[autonomous mission ledger](autonomous-mission-ledger.md). The chronological task
records below preserve their checkpoint wording; the final Task 4 section is the
authoritative Phase 1 closure state.

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

## Task 3A public narrative and executable roadmap

Task 3A status: `in_progress`; uncommitted pending independent review and combination
with the separate frontend/static Task 3B slice. This append does not rewrite Task 1 or
Task 2 history.

### Public-copy decisions

1. Public receipt promises now apply only to `VERIFIED` and `REFUTED` findings.
   Abstentions may show attempted evidence or a deterministic diagnostic.
2. The advertised offline hero clears `OPENAI_API_KEY`, forces
   `CROSS_EXAMINE_DEMO_CHARACTERIZER=fixture`, and uses a newly allocated explicit
   workspace. Its first run is `BROKEN/+2/2`; the same command and workspace repeat as
   `BROKEN/+0/2`.
3. A Claim and optional ProbePlan are untrusted schema-constrained proposals. Ingest
   catalogues broad candidate definitions in changed Python files; only a narrower
   synchronous/signature/value subset is probe-eligible.
4. A visible bounded-`SAFE` warning names the non-critical preservation false-safety
   path, omitted candidate coverage, incomplete semantic/read validation, mutable
   locator-only corpus authority/non-atomic completion, and unsupported unauthenticated
   non-loopback service exposure.
5. Corpus v1 is eligible verified Layer-A fixture replay by literal locator/symbol, not
   Git-identity/ancestry authority or a compounding moat. The demo proves repeat insertion
   with the run receipt's `+0`; it does not use the current Corpus summary as that proof.
6. Release copy distinguishes tested Python 3.12 from metadata `>=3.12`, configured CI
   from a cited immutable green run, wheel smoke from absent sdist smoke, semantic fixture
   checking from byte equality, and focused Vitest/axe/Chromium evidence from
   accessibility or cross-browser compliance.
7. The paid-model scene is conditional on current-pin P2 offline gates, independent
   review, spend/key authority, and an explicit one-request gate. Historical manual
   trials are labeled unblinded compatibility shadow evidence; no public change is called
   unseen by a model.
8. `REMEDIATION.md` retains its raw branch-era commands/output, with a top historical
   banner that directs current readers to the matrix, roadmap, and ledger.

Rejected alternatives were keeping a convenient ambient-credential hero, describing
manual trials as real-model proof, calling bounded exhaustion compatibility, using the
Corpus page's touched-row query as inserted growth, retaining the receipt-only “next
slice,” or presenting configuration/design as completed release evidence. Each would
contradict executable behavior or available authority.

### Roadmap reconciliation

The dated roadmap now carries the `ea14e2f` superseding status and publishes the stable
P0-P9 graph. P1 remains current; P2 offline preflight/local integrity can proceed while
paid execution is externally blocked. Before P3-P7 expansion, the P2 local gate must
make preservation criticality unable to hide an observed mismatch, make omitted
candidate coverage unable to produce `SAFE`, validate verdict/IDs/linkage/read semantics,
terminate aggregation-validation failure without recursion, and make current lossy or
ambiguous values abstain.

P3 first refuses unsafe non-loopback service exposure and aligns the API/executor timeout
contract, then adds deterministic setup/recovery/provenance. P4 corpus migration precedes
P5 intended oracles and P7 value persistence. P6 builds an explicitly unblinded
development benchmark after setup and intended-case prerequisites; G4 still blocks
qualification. P7 adds new value families only after P4 and the P6 development contract,
without deferring the P2 current-value integrity work. P8 repeats a broader adversarial
sweep. P9 owns demo, package, accessibility/browser, deployed, and release completion.

External G1-G5 gates remain distinct: paid-model spend/one-request authority; intended
approval; lifecycle signing; hostile-target isolation/evaluator truth; and public
publication/final human approval. Repository work cannot synthesize any of them.

### Task 3A evidence scope

The tracked candidate is limited to `README.md`, `docs/submission.md`, `docs/demo.md`,
`docs/trials.md`, the dated roadmap and decision record, `REMEDIATION.md`, and this
handoff. It changes no runtime, frontend, static asset, source handoff, test, ledger,
index, commit, or remote state. Claim, stale-pin, status, local-link, safety-boundary,
whitespace, and exact-name results are appended after their commands execute. Task 3A
and P1 remain `in_progress` until independent review and Task 3 integration.

### Task 3A verification register

The exact post-edit scans were:

```text
rg -ni "every findin[g]|behind every verdic[t]|complete five-stag[e]|complete judge-facin[g]|pins verified behavio[r]|discovers touched Python symbol[s]|Claim objects onl[y]|minimized deterministic counterexampl[e]|frozen oracl[e]|cross-platform release check[s]|dev extra pin[s]|unsee[n]" README.md docs/submission.md docs/demo.md docs/trials.md docs/2026-07-18-ordered-implementation-roadmap.md docs/2026-07-18-verification-foundations-decision-record.md REMEDIATION.md docs/research/phase-1-roadmap-handoff.md
rg -ni "next slic[e]|Exact next implementation promp[t]|current pinning can preced[e]|implementation remains gate[d]|structural receipt hashing.*not implemente[d]" README.md docs/submission.md docs/demo.md docs/trials.md docs/2026-07-18-ordered-implementation-roadmap.md docs/2026-07-18-verification-foundations-decision-record.md REMEDIATION.md docs/research/phase-1-roadmap-handoff.md
rg -n "^(Status:|\\*\\*Status:\\*\\*|> \\*\\*Superseding status)|implemented|development-only|blocked external|future|configured|tested" README.md docs/submission.md docs/demo.md docs/trials.md docs/2026-07-18-ordered-implementation-roadmap.md docs/2026-07-18-verification-foundations-decision-record.md REMEDIATION.md docs/research/phase-1-roadmap-handoff.md
rg -n "OPENAI_API_KEY|CROSS_EXAMINE_DEMO_CHARACTERIZER|mktemp|Guid|\\+2 this run|\\+0 this run" README.md docs/submission.md docs/demo.md
rg -n "P0|P1|P2|P3|P4|P5|P6|P7|P8|P9|G1|G2|G3|G4|G5|P4 corpus migration|P6 development" docs/2026-07-18-ordered-implementation-roadmap.md docs/2026-07-18-verification-foundations-decision-record.md docs/research/phase-1-roadmap-handoff.md
rg -n "SAFE|false.?SAFE|coverage|semantic|corpus|loopback|sandbox|trusted-input|receipt|manifest|provenance|wheel|sdist|Chromium|axe|CI" README.md docs/submission.md docs/demo.md docs/trials.md docs/2026-07-18-ordered-implementation-roadmap.md docs/2026-07-18-verification-foundations-decision-record.md REMEDIATION.md docs/research/phase-1-roadmap-handoff.md
rg -n "\\]\\(" README.md docs/submission.md docs/demo.md docs/trials.md docs/2026-07-18-ordered-implementation-roadmap.md docs/2026-07-18-verification-foundations-decision-record.md REMEDIATION.md docs/research/phase-1-roadmap-handoff.md
UV_PROJECT_ENVIRONMENT=/private/tmp/cross-examine-mission.Y52f1Y/venv uv run pytest -q tests/unit/test_documentation.py
git diff --check -- README.md docs/submission.md docs/demo.md docs/trials.md docs/2026-07-18-ordered-implementation-roadmap.md docs/2026-07-18-verification-foundations-decision-record.md REMEDIATION.md docs/research/phase-1-roadmap-handoff.md
git diff --name-only -- README.md docs/submission.md docs/demo.md docs/trials.md docs/2026-07-18-ordered-implementation-roadmap.md docs/2026-07-18-verification-foundations-decision-record.md REMEDIATION.md docs/research/phase-1-roadmap-handoff.md
```

The claim scan returned only explicitly historical or negated text: the Task 2A prior-
implication row, the handoff rule that no public change is called unseen, two historical
`REMEDIATION.md` lines covered by its new top banner, and the historical manual-trial
label immediately disclaimed in `docs/trials.md`. No current public overclaim remained.

The stale scan returned only `REMEDIATION.md`'s historical “Structural receipt hashing:
deliberately not implemented” line. The new top banner explicitly supersedes that
snapshot with `ea14e2f` receipt v1 and names the remaining context/semantic gaps. Status,
hero, dependency, and safety scans showed the four current-state labels, explicit
external blocks, both credential-cleared fresh/repeat hero states, the complete P0-P9 and
G1-G5 graph, and bounded limitations rather than an unqualified current claim.

The local-link inventory was inspected: new links resolve to the capability matrix,
roadmap, README heading, mission ledger, architecture/provenance/demo files, and Phase 1
plan/handoff. The focused documentation contract then exited 0 with `2 passed in 2.26s`.

`git diff --check` exited 0 with no output. The exact scoped name result was:

```text
README.md
REMEDIATION.md
docs/2026-07-18-ordered-implementation-roadmap.md
docs/2026-07-18-verification-foundations-decision-record.md
docs/demo.md
docs/research/phase-1-roadmap-handoff.md
docs/submission.md
docs/trials.md
```

These are implementation results, not completion evidence. The exact advertised hero
commands, frontend/static Task 3B work, full verification, independent review, and commit
remain later integration gates. Task 3A and P1 stay `in_progress`.

## Task 3B frontend presentation-copy evidence

Task 3B used test-first copy contracts without changing the corpus API or execution
behavior. The first ordinary npm invocation stopped before collection because the shell
provided Node 18 while the locked toolchain requires Node 20.19 or later. Direct worker
runs then stalled on macOS dataless `node_modules` placeholders. A lockfile-driven
Node 20 `npm ci` hydrated the ignored dependency tree; this was an environment repair,
not product evidence.

After hydration, the test-only candidate reached the intended RED state:

```text
Test Files  2 failed (2)
Tests       3 failed | 8 passed (11)
```

The new Trials assertion could not find the historical/manual/unblinded shadow label,
and the Corpus assertion could not find `Rows observed in latest run`. Adding a second
Trials render also exposed the file's missing explicit cleanup; the test now registers
`afterEach(cleanup)` so test isolation is deterministic.

The minimal production change replaces the unqualified Trials evidence/model-authorship
copy and scopes the Corpus description/metric label to eligible locator/symbol Layer-A
fixtures. It intentionally continues to display the API's `latest_growth` value because
P4, not presentation copy, owns the touched-row metric correction. Focused GREEN was:

```text
Test Files  2 passed (2)
Tests       11 passed (11)
```

The complete frontend suite then passed `10` files and `29` tests; Oxlint exited 0; and
the production TypeScript/Vite build transformed 2,460 modules and exited 0. The rebuild
changed `app.js` as expected. It also added exactly one Tailwind rule, `.shadow`, to
`app.css`: Tailwind's lexical source scan recognizes the required visible phrase
“unblinded shadow evidence” as the `shadow` utility candidate. A PostCSS rule-set
comparison found zero removed rules and that single added rule. Keeping the regenerated
CSS is therefore required for checked-in bundle equality; it is a reviewed generated-
asset scope expansion, not an unrelated style change.

The combined Task 3 candidate changes the eight Task 3A documentation paths, four
frontend source/test paths, and two generated static assets. It remains unstaged and
`in_progress` pending an independent combined public-copy, TDD, and generated-bundle
review. P1 remains `in_progress` through Task 4.

### Task 3 independent review

The independent combined review passed with no Critical, Important, or Minor findings.
It confirmed the exact 14-path scope, public-copy requirements and dependency graph,
copy/assertion-only frontend change, unchanged corpus API field, resolving current-doc
links, and the RED/GREEN evidence. Its independent PostCSS comparison reproduced
709 old rules, 710 new rules, zero removals, and `.shadow` as the sole addition; it
accepted `app.css` as a necessary canonical generated-bundle output rather than a style
feature or unrelated edit.

Task 3 is ready for its exact-path commit. P1 remains `in_progress`: Task 4 still owns
the fresh/repeat executable hero proof, complete backend/frontend/package/Playwright
verification, final Phase 1 ledger transition, closure review, and remote delivery.

## Task 4 integration, reliability correction, and Phase 1 closure

Task 4 status: `complete`. Objective P1 transitions from `in_progress` to `complete`
in the mission ledger. The transition closes truthful-status reconciliation and local
release verification only; it does not claim any paid-model, intended-authority,
benchmark-qualification, deployed-production, publication, or human release gate.

### Immutable Phase 1 implementation commits

| Slice | Commit | Reviewed result |
| --- | --- | --- |
| Task 1 authoritative status baseline | `c3daef6d428aa775fae29b5f327c12dc6c2f3c4b` | No Critical or Important findings |
| Task 2 engineering/research trust boundaries | `64e3fbe7bf1dd43c10ee66a7dd1a84e91c0bd198` | No Critical or Important findings; one wording Minor fixed before commit |
| Task 3 public narrative, roadmap, UI copy, and bundle | `78b5dfdfacda569400c108603027c4746269e363` | Initial task review found no findings; closure review later found and fixed two Minors in ambient-state instructions and the aggregate diagram |
| Task 4 verifier reliability | `0a118979df1e9533365341bdc5ab9623cb8841c5` | No Critical or Important findings; one optional inherited-symlink hardening Minor remains non-blocking |
| Task 4 verifier isolation and cold-start bound | `662aaa51f540d0171b18b6c38e276dd4465c0ddb` | Ready after focused review; owned fresh/repeat demo state, poisoned-environment release checks, bounded cold Playwright start, and canonical verifier all pass |

Task 4 did not weaken product assertions or introduce retries. Playwright still runs
two real Chromium flows with `retries: 0`; its web server receives an empty
`OPENAI_API_KEY`, stores its database/runs in one unique OS-temporary workspace, and
cleans the owned workspace on normal Node process exit. A crash or `SIGKILL` can leave
the OS-temporary directory for later cleanup. The backend readiness test still
requires the real health response and an early process exit still fails immediately.
Its fixed approximately five-second poll loop was replaced by a monotonic 60-second
cold-start deadline. The Playwright server allowance is 300 seconds and expectations
remain bounded at 30 seconds.

### TDD and diagnostic evidence for Task 4

The first canonical verifier reached a real Playwright RED state:

```text
Error: Timed out waiting 30000ms from config.webServer.
```

After the server became healthy, the isolated E2E rerun exposed two real pending-flow
failures rather than selector errors:

```text
2 failed
e2e/broken-verdict.spec.ts:3:1 › opens every grounded receipt from a packaged direct route
e2e/broken-verdict.spec.ts:26:1 › runs the offline hero from the browser without model credentials
```

Trace evidence showed the fixture and hero requests still pending when the default
five-second expectations ended. A later canonical run reached the deterministic hero
pipeline but exhausted the 30-second total test budget at Layer B. Moving the E2E
database and run roots out of the cloud-backed checkout produced the focused GREEN:

```text
Running 2 tests using 1 worker
2 passed (13.7s)
```

An independent review found that a direct Playwright invocation could still inherit an
operator credential even though `scripts/verify.sh` unsets it. `OPENAI_API_KEY: ""`
now wins over Playwright's inherited environment. A direct run with a harmless parent
sentinel key passed both flows, and a post-run OS-temp scan showed that the revised
single-owner cleanup left no new Playwright workspace.

The backend readiness test then produced its own cold-start RED at the interim
30-second deadline:

```text
FAILED tests/e2e/test_cli_demo.py::test_serve_starts_health_endpoint_on_requested_port
AssertionError: serve did not become healthy within 30 seconds
1 failed in 34.48s
```

The subprocess form was reproduced independently and became healthy; the same
unchanged test then passed in `2.87s`, establishing cold source-import latency rather
than a serve defect. The final 60-second monotonic contract passed focused verification:

```text
1 passed in 1.05s
```

One verification-only symlink named `frontend/node_modules 2`, left by the earlier
temporary dependency hydration workaround, caused Vitest to collect 179 dependency
self-test files. Exact inspection proved it was an untracked symlink to
`/private/tmp/cross-examine-node.20yseW/node_modules`; only the symlink was removed and
its temporary target was preserved. The shell default Node 18 was also below the Vite 8
toolchain requirement. All final frontend and canonical commands therefore explicitly
put the bundled Node `v24.14.0` runtime first in `PATH`.

### Focused, package, and hero evidence

The focused backend integration contract passed:

```text
UV_PROJECT_ENVIRONMENT=/private/tmp/cross-examine-mission.Y52f1Y/venv uv run pytest -q tests/unit/test_ingest_symbols.py tests/unit/test_characterize.py tests/unit/test_probe_plans.py tests/unit/test_execution.py tests/unit/test_validation.py tests/unit/test_schema.py tests/integration/test_ingest.py tests/integration/test_layer_a.py tests/integration/test_layer_b.py tests/integration/test_probe_plan_relations.py tests/integration/test_corpus.py tests/integration/test_run_repository.py
70 passed in 112.56s
```

The release, installed-package, CLI, and hosted-fixture group passed as one exact run:

```text
UV_PROJECT_ENVIRONMENT=/private/tmp/cross-examine-mission.Y52f1Y/venv uv run pytest -q tests/release tests/e2e/test_cli_demo.py tests/integration/test_hosted_fixture_capture.py
7 passed in 11.29s
```

The first credential-cleared hero run used a newly allocated workspace:

```text
env -u OPENAI_API_KEY CROSS_EXAMINE_DEMO_CHARACTERIZER=fixture UV_PROJECT_ENVIRONMENT=/private/tmp/cross-examine-mission.Y52f1Y/venv uv run --isolated --no-editable cross-examine demo --no-open --workspace /private/tmp/cross-examine-phase1-hero.wQQktp
Characterization: deterministic hero fixture
Verdict: BROKEN
Corpus: +2 this run · 2 total
Refuted claim: preserve-empty
Reproducing input: []
```

The identical command and workspace then produced the required repeat receipt:

```text
Characterization: deterministic hero fixture
Verdict: BROKEN
Corpus: +0 this run · 2 total
Refuted claim: preserve-empty
Reproducing input: []
```

No live API request ran, no secret value was inspected, and no paid-model evidence is
claimed.

### Pre-correction canonical verifier (superseded)

This uninterrupted verifier established the runtime/frontend baseline before the final
closure-review corrections. Its 117-test count and one-run demo are superseded by the
post-review register below. It used the supported bundled Node runtime:

```text
PATH=/Users/stefanospalivos/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/stefanospalivos/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/override:/Users/stefanospalivos/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback:$PATH UV_PROJECT_ENVIRONMENT=/private/tmp/cross-examine-mission.Y52f1Y/venv bash scripts/verify.sh
All checks passed!
117 passed in 506.36s (0:08:26)
Test Files  10 passed (10)
Tests       29 passed (29)
found 0 vulnerabilities
✓ 2460 modules transformed.
2 passed (1.7m)
Characterization: deterministic hero fixture
Verdict: BROKEN
Corpus: +0 this run · 2 total
Refuted claim: preserve-empty
Reproducing input: []
```

The same script also ran Oxlint, TypeScript/Vite production build, generated-static
equality, Chromium installation/check, and the isolated credential-cleared final demo;
it exited 0. Vite emitted its existing non-fatal large-chunk warning, and Node emitted a
cosmetic `NO_COLOR`/`FORCE_COLOR` warning during Playwright. Neither altered the result.

The paragraphs above are a diagnostic narrative with captured failure/summary excerpts,
not a complete shell transcript. The closure does not claim that every intermediate
Playwright rerun, sentinel-key scan, or readiness reproduction command was retained.

### Post-review correction and scope-variance register

Closure audits found that the earlier candidate still overclaimed `SAFE` semantics and
receipt/read validation, mixed current and historical phase/pin status, left the public
terminal/UI state disconnected, and allowed canonical/release subprocesses to inherit
operator model or storage state. The stale 117-test/one-demo closure evidence was itself
a blocking evidence defect. Two Task 3 Minors—ambient demo-state clearing and an
incomplete aggregate-diagram branch—were also fixed before closure.

The public contract was expanded test-first. Its consolidated RED state was:

```text
UV_PROJECT_ENVIRONMENT=/private/tmp/cross-examine-mission.Y52f1Y/venv uv run pytest -q tests/unit/test_documentation.py
....FFFF                                                                 [100%]
FAILED tests/unit/test_documentation.py::test_public_receipt_claims_disclose_the_unvalidated_read_path
FAILED tests/unit/test_documentation.py::test_quickstart_serves_the_terminal_hero_workspace
FAILED tests/unit/test_documentation.py::test_current_status_surfaces_use_superseding_dependencies_and_stable_evidence
FAILED tests/unit/test_documentation.py::test_research_status_blocks_do_not_call_task1_the_current_product
4 failed, 4 passed in 16.34s
```

After correcting README, architecture, capability/status ownership, submission/demo,
provenance, the P0-P9 graph, six superseding research blocks, and stable evidence links,
the combined documentation and verifier-entrypoint contracts passed:

```text
UV_PROJECT_ENVIRONMENT=/private/tmp/cross-examine-mission.Y52f1Y/venv uv run pytest -q tests/unit/test_documentation.py tests/unit/test_verification_entrypoints.py
.........                                                                [100%]
9 passed in 22.50s
```

Verifier isolation used poisoned temporary operator paths and a sentinel key. Before the
fix, all four tests failed because canonical scripts, CLI E2E, wheel smoke, and the
outside-checkout package run inherited operator state:

```text
UV_PROJECT_ENVIRONMENT=/private/tmp/cross-examine-mission.Y52f1Y/venv uv run pytest -q tests/unit/test_verification_entrypoints.py tests/e2e/test_cli_demo.py::test_demo_exits_zero_and_prints_the_grounded_catch tests/release/test_wheel_install.py tests/release/test_local_product_run.py
FAILED tests/unit/test_verification_entrypoints.py::test_canonical_verifiers_clear_operator_state_and_isolate_the_demo
FAILED tests/e2e/test_cli_demo.py::test_demo_exits_zero_and_prints_the_grounded_catch
FAILED tests/release/test_wheel_install.py::test_wheel_installs_and_runs_the_offline_hero
FAILED tests/release/test_local_product_run.py::test_packaged_hero_runs_from_outside_space_bearing_checkout
4 failed in 166.40s (0:02:46)
```

The same exact group then proved that the requested workspace owns its DB/run paths and
the poisoned operator paths remain absent:

```text
....                                                                     [100%]
4 passed in 158.67s (0:02:38)
```

A later contract caught the inherited internal Playwright workspace override before the
final run (`1 failed in 0.11s`); clearing it in both canonical scripts produced
`2 passed in 0.09s`. The first corrected full verifier then exposed a genuine cold-start
RED at the CLI test's 60-second outer bound:

```text
FAILED tests/e2e/test_cli_demo.py::test_demo_exits_zero_and_prints_the_grounded_catch
subprocess.TimeoutExpired: Command [...] timed out after 60 seconds
1 failed, 124 passed in 379.97s (0:06:19)
```

Both fresh and repeat subprocesses now share a bounded 120-second allowance; the failed
contract and its guard passed together with `2 passed in 9.25s`. No retry was added and
runtime verdict semantics did not change. After the evidence append, the final combined
documentation/link/status and verifier-entrypoint rerun passed:

```text
UV_PROJECT_ENVIRONMENT=/private/tmp/cross-examine-mission.Y52f1Y/venv uv run pytest -q tests/unit/test_documentation.py tests/unit/test_verification_entrypoints.py
..........                                                               [100%]
10 passed in 17.29s
```

This is a reviewed variance from the original Task 4 two-record scope. Commit
`0a118979df1e9533365341bdc5ab9623cb8841c5` first changed Playwright/readiness test
infrastructure because the planned verifier reached real cold-start failures. The final
isolation slice changes only canonical scripts and test subprocesses/contracts; it does
not change the five-stage pipeline, finding classification, receipt schema, or pure
`aggregate()`. Its immutable commit is recorded after the focused pre-commit review.

The exact API-inclusive focused gate from the reviewed plan, rather than the earlier
substitute group, passed:

```text
UV_PROJECT_ENVIRONMENT=/private/tmp/cross-examine-mission.Y52f1Y/venv uv run pytest -q tests/unit/test_schema.py tests/unit/test_validation.py tests/unit/test_characterize.py tests/unit/test_probe_plans.py tests/integration/test_ingest.py tests/integration/test_layer_a.py tests/integration/test_layer_b.py tests/integration/test_probe_plan_relations.py tests/integration/test_corpus.py tests/integration/test_run_repository.py tests/integration/test_api_fixture.py tests/integration/test_api_jobs.py
70 passed in 159.77s (0:02:39)
```

The final canonical verifier cleared model, DB, run-root, and internal Playwright
workspace overrides; allocated owned OS-temporary browser/demo state; asserted fresh and
repeat corpus truth; and exited 0. The Documents checkout had dataless macOS File
Provider entries, so the command ran from an APFS-cloned `/private/tmp` snapshot after
all 211 indexed paths had passed byte-for-byte comparison with the working tree:

```text
cwd=/private/tmp/cross-examine-exact-snapshot.DW4WEv PATH=/Users/stefanospalivos/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/stefanospalivos/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/override:/Users/stefanospalivos/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback:$PATH UV_PROJECT_ENVIRONMENT=/private/tmp/cross-examine-mission.Y52f1Y/venv bash scripts/verify.sh
All checks passed!
127 passed in 25.64s
Test Files  10 passed (10)
Tests       29 passed (29)
found 0 vulnerabilities
✓ 2460 modules transformed.
2 passed (4.8s)
Characterization: deterministic hero fixture
Verdict: BROKEN
Corpus: +2 this run · 2 total
Refuted claim: preserve-empty
Reproducing input: []
Characterization: deterministic hero fixture
Verdict: BROKEN
Corpus: +0 this run · 2 total
Refuted claim: preserve-empty
Reproducing input: []
```

The output for each decided hero finding also printed its exact base/head probe-runner
commands and request paths. The verifier-owned temporary workspace was removed by normal
cleanup. No live model call ran, no key value was inspected, and neither poisoned
operator storage path was created.

### Closure review and limitations

Task reviews and the Task 4 reliability re-review contain no unresolved Critical or
Important finding. The one optional Task 4 Minor notes that a maliciously pre-seeded
internal temp-path variable could name a matching direct-child symlink or stale
directory. Only a process that calls `mkdtempSync()` owns recursive cleanup, so the
condition cannot redirect deletion; it is deferred hardening rather than a release
blocker.

Local verification required the ephemeral
`/private/tmp/cross-examine-mission.Y52f1Y/venv`, explicit bundled Node 24, and
non-destructive tracked-file reads because this macOS cloud-backed checkout repeatedly
evicted source and dependency content. These are environment constraints, not product
qualification claims. The paid GPT-5.6 Sol request remains separately blocked by G1
and the Phase 2 current-pin/integrity/artifact/replay gates. G2-G5 remain externally
blocked exactly as recorded in the roadmap and mission ledger.

The verifier-isolation closure is immutable as
`662aaa51f540d0171b18b6c38e276dd4465c0ddb`; this research record is its documented
evidence companion. Remote delivery is attempted only after the documentation closure
commit exists; push success or failure is delivery evidence and cannot change the
deterministic local verification result.
