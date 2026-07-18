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
