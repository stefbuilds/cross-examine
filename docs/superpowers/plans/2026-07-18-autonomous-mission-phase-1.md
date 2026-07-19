# Autonomous Mission Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: use
> `superpowers:subagent-driven-development` task by task. Every implementation
> commit receives a fresh specification/quality review before the next task.

**Goal:** Make every judge-facing and engineering document describe the current
development implementation, known integrity gaps, external blockers, and ordered
Build Week roadmap without claiming unexecuted capability.

**Architecture:** Phase 1 changes documentation, status records, and one judge-facing
historical-trial label only. One authoritative four-state capability matrix owns
current truth; public narratives and historical handoffs link to it. Historical
research remains recoverable at the Phase 0 audit-package commit. Execution behavior,
schemas, persistence, fixtures, and the five-stage pipeline do not change; the existing
static bundle is rebuilt only to carry the corrected presentation copy.

**Tech stack:** Markdown, Git, rg, uv/Ruff/pytest, npm/Vitest/Oxlint/Vite, existing
repository verification scripts.

## Global constraints

- Preserve Ingest → Characterize → Cross-examine → Aggregate → Render.
- Models propose schema-constrained claims and optional untrusted plans only;
  deterministic code owns outcomes and verdicts.
- Promise exact command/output receipts only for `VERIFIED` and `REFUTED` findings.
- Describe EvidenceReceipt v1 as command/output integrity metadata, not semantic
  provenance, authentication, or attestation.
- Describe current `SAFE` as deterministic over represented findings, not proof of
  complete semantic safety.
- Describe the executor as a loopback-only, trusted-input host-process adapter, not a
  sandbox or hostile-target boundary.
- Keep `aggregate()` pure and unchanged.
- Preserve Layer-A-before-Layer-B sequencing and Python-only Build Week scope.
- Preserve historical source evidence: the exact Phase 0 research inputs remain
  immutable at `5bea8baf5f031d9bfdff592b3e85e001842c651b`; later status notes must name
  that commit instead of pretending the original prose was current.
- Do not repair malformed refs, rewrite history, force-push, or stage unrelated work.

## Authoritative statuses

Use only these current-state labels:

- `implemented`: executable in the stated supported scope.
- `development-only`: code exists, but a named integrity, qualification, evidence, or
  release gap prevents the broader claim.
- `blocked external`: the repository cannot supply the required authority.
- `future`: designed or planned, with no current implementation.

## File map

- Create `docs/capability-status.md`: authoritative status matrix, supported scope,
  exact evidence anchors, limitations, and external gates.
- Create `docs/research/phase-1-roadmap-handoff.md`: Phase 1 hypothesis, audit
  synthesis, acceptance criteria, commands/results, decisions, and review record.
- Modify `docs/research/autonomous-mission-ledger.md`: append-only P1 transitions and
  exact verification evidence.
- Modify `README.md`, `docs/architecture.md`, `docs/execution-policy.md`,
  `docs/submission.md`, `docs/demo.md`, `docs/trials.md`, `docs/probe-plans.md`, and
  `docs/provenance.md`: narrow public/current claims to implementation evidence.
- Modify `docs/2026-07-18-ordered-implementation-roadmap.md` and
  `docs/2026-07-18-verification-foundations-decision-record.md`: add superseding
  status notes and a dependency-correct Now/Next/Later view.
- Modify `REMEDIATION.md`: add a non-destructive historical/superseded status banner.
- Modify `frontend/src/features/trials/TrialsPage.tsx` and its focused test: label the
  displayed manual-characterization runs as historical shadow evidence; rebuild the
  checked-in static bundle without changing execution behavior.
- Modify `frontend/src/features/corpus/CorpusPage.tsx` and its focused app test: stop
  labeling rows touched by the latest run as new growth until corpus v2 fixes that
  metric.
- Create `tests/unit/test_documentation.py`: deterministic local-link/status-vocabulary
  checks for the authoritative documentation surfaces.
- Modify the six `docs/research/*-handoff.md` source documents only by appending or
  inserting a clearly dated superseding status note that links their immutable Phase
  0 version and the authoritative matrix; do not erase their original research.

### Task 1: Establish the authoritative capability/status contract

**Files:**

- Preserve and stage: `docs/superpowers/plans/2026-07-18-autonomous-mission-phase-1.md`
- Create: `docs/capability-status.md`
- Create: `docs/research/phase-1-roadmap-handoff.md`
- Create: `tests/unit/test_documentation.py`
- Modify: `docs/research/autonomous-mission-ledger.md`

**Consumes:** Phase 0 ledger/audits, the independent Phase 1 capability audit,
repository source/tests,
package/CI topology, six handoffs.

**Produces:** one reviewer-facing truth source and a P1 `pending → in_progress`
ledger transition.

- [ ] Record the Phase 1 hypothesis and invariants in the handoff: current docs mix
  implemented mechanisms with incomplete trust guarantees; a single evidence-backed
  matrix plus scoped public copy should eliminate contradictions without changing
  behavior.
- [ ] Add a matrix covering at least: five-stage pipeline, Git ingest/symbol scope,
  GPT adapter/live evidence, hero, Layer A, repository tests, Layer B, ProbePlan,
  aggregate, receipt v1, codec, host executor/manifests, runs/SSE, React rendering,
  corpus v1, hosted fixture, wheel, CI, compatibility trials, setup, lifecycle v2,
  values, intended oracles, benchmark, paid trial, public release, and isolation.
- [ ] Give every row a status, implementation/test evidence, supported scope,
  limitation, owner phase, and measurable exit criterion.
- [ ] Add the bounded-SAFE, receipt-v1, loopback trusted-host, persistence/recovery,
  Python 3.12, packaging, browser/accessibility, and external-authority doctrines.
- [ ] First add a failing `tests/unit/test_documentation.py` check that every local link
  in the authoritative current-status surfaces resolves to a repository file or valid
  same-document heading and that every matrix state uses the four allowed labels. Add
  the minimum docs needed to make it pass; external URLs remain outside this check.
- [ ] Append the immutable P1 start evidence and `P1 pending → in_progress` transition
  to the ledger. Do not edit Phase 0 history.
- [ ] Run the focused documentation test and status vocabulary scan; stage only these
  five files.
- [ ] Commit with `docs: publish capability status baseline`.

### Task 2: Reconcile engineering trust boundaries and research status

**Files:**

- Modify: `docs/architecture.md`
- Modify: `docs/execution-policy.md`
- Modify: `docs/probe-plans.md`
- Modify: `docs/provenance.md`
- Modify: all six `docs/research/*-handoff.md` files named by the mission
- Modify: `docs/research/phase-1-roadmap-handoff.md`

**Consumes:** authoritative matrix plus exact implementation/test anchors.

**Produces:** current engineering documentation whose guarantees stop exactly at the
implemented boundary.

- [ ] Replace “lossless codec,” full React mirroring, broad tamper detection, present
  frozen oracle, universal stage-failure conversion, and restart-durability claims
  with the narrower implemented behavior and named gaps.
- [ ] Use “model-free bounded execution,” not “deterministic target execution”:
  repository code can still use time, randomness, filesystem, and network authority.
- [ ] State that receipt v1 hashes canonical invocation/output and checks rendered
  substring association, but does not bind repository/revision/role/input/policy,
  authenticate execution, recompute verdict, or validate full claim/finding linkage.
- [ ] State that execution manifests are returned by the runner but not persisted or
  rendered, process cleanup is best effort, the effective current command timeout is
  120 seconds, and non-loopback unauthenticated serving is unsupported/unsafe.
- [ ] Say that `127.0.0.1` is the only supported serving posture, while explicitly
  recording that the current CLI does not enforce it. The top-level executable basename
  allowlist constrains harness launches only, not commands spawned by target code.
- [ ] Correct ProbePlan v1: reliable list path; one deterministic first seed; budget
  validates proposal size rather than executed breadth; no minimizer; structured plan
  provenance is absent from React.
- [ ] Narrow accessibility/browser provenance to the actual axe smoke (contrast
  disabled), focused component tests, and two Chromium flows.
- [ ] Add a dated superseding status block to each handoff with original Phase 0 commit,
  applies-to pin, current state, dependency/authority gate, and authoritative-matrix
  link. Preserve original research content.
- [ ] Update the Phase 1 handoff with changed-claim rationale and review evidence.
- [ ] Run claim/status/stale-pin/safety scans and `git diff --check`.
- [ ] Commit with `docs: clarify verification trust boundaries`.

### Task 3: Align the public narrative and executable roadmap

**Files:**

- Modify: `README.md`
- Modify: `docs/submission.md`
- Modify: `docs/demo.md`
- Modify: `docs/trials.md`
- Modify: `docs/2026-07-18-ordered-implementation-roadmap.md`
- Modify: `docs/2026-07-18-verification-foundations-decision-record.md`
- Modify: `REMEDIATION.md`
- Modify: `frontend/src/features/trials/TrialsPage.tsx`
- Modify: `frontend/src/features/trials/TrialsPage.test.tsx`
- Modify: `frontend/src/features/corpus/CorpusPage.tsx`
- Modify: `frontend/src/app/App.test.tsx`
- Rebuild: `src/cross_examine/static/assets/app.js`
- Modify: `docs/research/phase-1-roadmap-handoff.md`

**Consumes:** reviewed status/trust docs.

**Produces:** honest quickstart/submission/demo language plus dependency-correct
Now/Next/Later roadmap with measurable exits.

- [ ] Narrow “every verdict/finding” to decided findings; explain deterministic
  diagnostics for abstentions.
- [ ] Make the hero expected output conditional on a fresh workspace and document
  stable `+0` repeat behavior. The command must clear `OPENAI_API_KEY`, force
  `CROSS_EXAMINE_DEMO_CHARACTERIZER=fixture`, and use an explicitly new workspace;
  ambient credentials must never make the advertised offline command call the model.
- [ ] Call `Claim` an untrusted schema-constrained proposal, mention optional
  ProbePlans, and describe symbol discovery as all callable/class symbols in changed
  Python files rather than changed-line precision. Separately state that only a narrow
  eligible subset can actually be probed.
- [ ] Add a visible bounded-SAFE warning and enumerate the current false-safety,
  complete-coverage, semantic-validation, corpus-authority, and non-loopback risks.
- [ ] Scope corpus claims to eligible locator/symbol Layer-A fixtures; do not call v1
  an ancestry-safe compounding moat.
- [ ] Remove `docs/demo.md`'s instruction to use the Corpus page as proof of “no
  duplicate growth.” Direct the recording to the repeated run receipt, which truthfully
  reports `+0 this run`, while the Corpus UI labels its current value only as rows
  observed in the latest run pending the P4 metric fix.
- [ ] Mark CI as configured until an immutable green run is cited; Python 3.12 as the
  tested version; wheel smoke versus absent sdist; semantic hosted-fixture test versus
  absent byte equality; focused Chromium/axe coverage versus accessibility compliance.
- [ ] Mark the current real-model segment conditional on P2 and the one-request gate;
  keep historical manual trials labeled unblinded shadow evidence rather than
  qualification.
- [ ] Add a failing focused frontend assertion for the historical/manual/shadow label,
  then update `TrialsPage` so the UI no longer calls the rows unqualified “Product
  evidence” or implies model-authored real runs. Rebuild the checked-in bundle after
  the focused test passes.
- [ ] Add a failing focused assertion for Corpus copy, then replace “Latest growth” with
  a truthful “Rows observed in latest run” label and scope the corpus description to
  eligible locator/symbol Layer-A fixtures. Do not change the API field or hide the P4
  metric bug.
- [ ] Add a banner to `REMEDIATION.md` that identifies its branch-era evidence as
  historical and links current status; do not rewrite the original task record.
- [ ] Add a superseding status to the dated roadmap/ADR: receipt v1 and
  validation-before-pin landed at `ea14e2f`; context binding and semantic validation
  remain open.
- [ ] Publish Now/Next/Later in mission order: P1; P2 offline preflight in parallel;
  P3 setup; P4 corpus; P5 oracle; P6 benchmark development; P7 values; P8 hardening;
  P9 release. State each external gate and measurable exit.
- [ ] Make the trust-critical integrity core an explicit P2 local prerequisite before
  P3–P7 capability expansion: model-controlled `preserve_critical` cannot hide an
  observed mismatch; omitted candidate coverage cannot produce `SAFE`; report verdict,
  IDs, claim/finding linkage, and read-time semantics are validated; currently lossy
  tuple/optional-argument paths abstain. The paid P2 request may remain externally
  blocked while this local gate completes. P3 must then close the non-loopback/timeout
  execution-policy inconsistencies before adding setup capability. P8 repeats a broader
  independent adversarial sweep rather than postponing these known release blockers.
- [ ] Separate value integrity from value expansion: fail closed on existing lossy or
  ambiguous value paths in the P2 integrity gate; add new lossless value families only
  in P7 after P4 corpus migration and the P6 development benchmark contract.
- [ ] Replace stale “next receipt-only slice” language with the authoritative P0–P9
  dependency graph.
- [ ] Update the Phase 1 handoff with public-copy decisions and rejected alternatives.
- [ ] Run all documentation scans and `git diff --check`.
- [ ] Commit with `docs: align submission roadmap with repository reality`.

### Task 4: Verify Phase 1, close the ledger, review, and push

**Files:**

- Modify: `docs/research/phase-1-roadmap-handoff.md`
- Modify: `docs/research/autonomous-mission-ledger.md`
- Inspect: every Phase 1 path and the whole branch diff since
  `b6997eed8e53b94ea6efb25b62dc401d55fc2bee`

**Consumes:** reviewed Tasks 1–3.

**Produces:** exact Phase 1 evidence, P1 `in_progress → complete`, one closure commit,
and a pushed remote branch.

- [ ] Run and capture the claim-language scan:

  ```bash
  rg -n "every finding|behind every verdict|complete five-stage|complete judge-facing|pins verified behavior|discovers touched Python symbols|Claim objects only|minimized deterministic counterexample|frozen oracle|cross-platform release checks|dev extra pins" README.md docs
  ```

  Any hit must be explicitly historical, negated, or scoped; unresolved current claims
  fail the gate.

- [ ] Run status, stale-pin, and safety-boundary scans from the Phase 1 audit. Record
  why every remaining hit is valid.
- [ ] Run focused backend contract checks:

  ```bash
  uv run pytest -q \
    tests/unit/test_schema.py tests/unit/test_validation.py \
    tests/unit/test_characterize.py tests/unit/test_probe_plans.py \
    tests/integration/test_ingest.py tests/integration/test_layer_a.py \
    tests/integration/test_layer_b.py \
    tests/integration/test_probe_plan_relations.py \
    tests/integration/test_corpus.py tests/integration/test_run_repository.py \
    tests/integration/test_api_fixture.py tests/integration/test_api_jobs.py
  ```

- [ ] Run full backend verification:

  ```bash
  uv run ruff check .
  uv run pytest -q
  ```

- [ ] Run frontend/package verification:

  ```bash
  npm --prefix frontend ci
  npm --prefix frontend test -- --run
  npm --prefix frontend run lint
  npm --prefix frontend run build
  git diff --exit-code -- src/cross_examine/static
  uv run pytest -q \
    tests/release tests/e2e/test_cli_demo.py \
    tests/integration/test_hosted_fixture_capture.py
  ```

  Describe these as the current unit/contract/build/wheel/fixture-semantic evidence,
  not deployed, WCAG, sdist, or cross-platform proof.

- [ ] Prove the advertised offline hero twice in one newly allocated workspace:

  ```bash
  phase1_demo_workspace=$(mktemp -d)
  env -u OPENAI_API_KEY -u CROSS_EXAMINE_DB -u CROSS_EXAMINE_RUNS \
    CROSS_EXAMINE_DEMO_CHARACTERIZER=fixture \
    uv run --isolated --no-editable cross-examine demo --no-open \
    --workspace "$phase1_demo_workspace"
  env -u OPENAI_API_KEY -u CROSS_EXAMINE_DB -u CROSS_EXAMINE_RUNS \
    CROSS_EXAMINE_DEMO_CHARACTERIZER=fixture \
    uv run --isolated --no-editable cross-examine demo --no-open \
    --workspace "$phase1_demo_workspace"
  ```

  The first run must report `BROKEN`, `+2`, total `2`; the repeat must report
  `BROKEN`, `+0`, total `2`. Never print or preserve an ambient key.

- [ ] Run the repository's full POSIX verifier, including packaged Playwright:

  ```bash
  bash scripts/verify.sh
  ```

  If this machine requires a fresh external uv environment, prefix the exact command
  with the actual `UV_PROJECT_ENVIRONMENT` used and record that local limitation in the
  ledger; do not hard-code one machine's ephemeral path into public instructions.

- [ ] Run `git diff --check`, verify all links/status rows, and obtain an independent
  Phase 1 documentation/release review with no Critical or Important findings.
- [ ] Append exact commands, captured output summaries, immutable commit links,
  limitations, review result, and `P1 in_progress → complete` to the handoff/ledger.
- [ ] Stage only the two closure records and commit with
  `docs: complete research roadmap integration`.
- [ ] Push `codex/autonomous-build-week` without force and verify upstream equality.
  A remote/network failure blocks delivery evidence, not the locally verified P1
  status; record it explicitly and retry only when access is available.

## Phase 1 acceptance criteria

1. One tracked authoritative matrix uses exactly the four current-state labels.
2. README, architecture, execution policy, roadmap/ADR, submission, demo, trials,
   provenance, ProbePlan docs, and six handoffs agree with it.
3. Exact receipts are promised only for newly pipeline-validated decided findings;
   receipt v1 limits and the current validation-on-read gap are clear.
4. Bounded SAFE, incomplete coverage, false-safety, semantic-validation, and corpus-v1
   risks are visible rather than buried.
5. Executor, supported-loopback posture versus missing enforcement,
   persistence/recovery, setup, version, package, CI, browser, and
   accessibility scopes match executable evidence.
6. Paid-model, lifecycle signer, intended approval, evaluator isolation/truth, public
   publishing, and final human approval remain explicit external gates.
7. Now/Next/Later preserves mission dependencies and gives every exit a measurable
   test or authority receipt.
8. Every required command is captured; all executable gates pass; independent review
   has no Critical/Important contradiction.
9. P1 changes documentation/status, its deterministic documentation test, and the
   matching trial/corpus presentation copy only. The local completion state is clean;
   delivery is pushed without rewriting history when remote access is available.
