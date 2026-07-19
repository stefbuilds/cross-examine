# Cross-Examine capability status

Status date: 2026-07-19
Applies to product commit: `662aaa51f540d0171b18b6c38e276dd4465c0ddb`
Mission state: `P1 complete; P2 pending`

This page is the authoritative current-state source for Cross-Examine capabilities.
The [Phase 1 plan](superpowers/plans/2026-07-18-autonomous-mission-phase-1.md)
defines the reconciliation work; the
[Phase 1 handoff](research/phase-1-roadmap-handoff.md) records its evidence; and the
[mission ledger](research/autonomous-mission-ledger.md) owns objective transitions.
The [README](../README.md) remains a public introduction and must not broaden a state
recorded here.

## Status vocabulary

- `implemented`: executable now within the supported scope stated in its row.
- `development-only`: code exists, but a named integrity, qualification, evidence, or
  release gap prevents the broader claim.
- `blocked external`: the repository cannot supply the required authority.
- `future`: designed or planned, with no current implementation.

These are current-state labels, not priorities or estimates. Every matrix row uses
exactly one of them.

## Capability matrix

| Capability | Current state | Implementation and test evidence | Supported scope | Current limitation | Owner phase | Measurable exit |
| --- | --- | --- | --- | --- | --- | --- |
| Five-stage Python pipeline | `implemented` | `src/cross_examine/pipeline.py:59-196`; `tests/e2e/test_layer_a_pipeline.py:165-205` | Ingest, Characterize, Cross-examine, Aggregate, and Render execute locally for trusted Python repositories | Its represented findings can still be incomplete or semantically unsafe, so this is not a release-grade repository-safety guarantee | P2 integrity gate; repeated P8 sweep | The named false-SAFE, coverage, semantic-validation, and aggregation-failure invariant tests all pass |
| Git revision ingest | `implemented` | `src/cross_examine/ingest/service.py:25-98`; `tests/integration/test_ingest.py` | Materializes base and head revisions in detached worktrees | Repository setup is source-tree based and identity is not yet carried through every evidence contract | P3 | Root, `src`, and build-generated fixtures run symmetrically from persisted revision-specific setup plans |
| Python symbol discovery | `development-only` | `src/cross_examine/ingest/symbols.py:14-32,44-66`; `tests/unit/test_ingest_symbols.py` | Enumerates class, function, async, and nested candidate definitions in changed Python files | This is file-level discovery, not changed-line precision, and later probes reject classes, async functions, and generators | P2 integrity gate; repeated P8 sweep | A two-symbol changed-file fixture cannot return `SAFE` when characterization omits either candidate |
| Structured GPT adapter | `development-only` | `src/cross_examine/characterize/service.py:24-100`; `src/cross_examine/characterize/models.py:8-46`; `tests/unit/test_characterize.py` | Produces schema-constrained Claims and optional untrusted ProbePlans; neither carries outcomes or verdicts | It does not prove complete candidate coverage and has no current-pin paid-run evidence | P2 | Current-pin preflight proves strict schema, target-claim presence, one-request accounting, replay, render equality, and redaction |
| Current paid GPT evidence | `blocked external` | [current trial status](research/real-gpt56-run-handoff.md#superseding-status--2026-07-19); [human gate](research/real-gpt56-run-handoff.md#gate-c--human-only-api-and-budget-checks); [operator stop checklist](research/real-gpt56-run-handoff.md#operator-stop-checklist) | Offline preflight and replay tooling may proceed without a request | API-key, spend, current-pin review, and explicit one-request authority are unavailable from repository code | P2 | An authorized run records exactly one Responses POST, nonzero usage, immutable pins, valid decided receipts, and no published secret |
| Offline hero characterization | `implemented` | `src/cross_examine/hero.py:21-45`; `tests/e2e/test_cli_demo.py` | A labeled checked-in Claim fixture replaces the model call while local findings are executed | First-run `+2` requires a new workspace; a repeat truthfully reports `+0` and total `2` | P9 | The published credential-cleared fixture command passes twice in a fresh workspace with `+2/2`, then `+0/2` |
| Layer A base/head replay | `development-only` | `src/cross_examine/cross_examine/layer_a.py:40-215`; `src/cross_examine/characterize/edge_catalog.py:8-65`; `tests/integration/test_layer_a.py` | Synchronous eligible callables with a narrow scalar/list JSON-compatible input and result catalog | Unsupported setup, signatures, and values abstain; a non-critical mismatch can currently contribute to false `SAFE` | P2 integrity gate | Every observed preservation mismatch prevents `SAFE`, and unsupported or ambiguous current values deterministically abstain |
| Repository-test comparison | `development-only` | `src/cross_examine/pipeline.py:378-497`; `tests/e2e/test_layer_a_pipeline.py` | Runs one discovered pytest command with source-tree paths and the product interpreter | There is no revision-specific install plan, dependency provisioning, or complete environment-failure taxonomy | P3 | Paired installed tests pass for root, `src`, and generated-package fixtures without source-import fallback |
| Layer B Hypothesis search | `development-only` | `src/cross_examine/cross_examine/layer_b.py:19-95`; `src/cross_examine/cross_examine/hypothesis_worker.py:18-98`; `tests/integration/test_layer_b.py` | Searches supported preserve-critical claims without ProbePlans for 60 deterministic examples | Exhaustion is not proof, tuple transport is lossy, and expansion waits for Layer A and benchmark gates | P7 | Supported values round-trip losslessly and every Layer B increment follows a passing Layer A and P6 development-benchmark gate |
| ProbePlan v1 | `development-only` | `src/cross_examine/probe_plans.py:31-110`; `src/cross_examine/cross_examine/layer_a.py:218-352`; `tests/integration/test_probe_plan_relations.py` | Reliable list path executes one deterministic first seed | Budget validates proposal shape rather than executed breadth; no minimizer runs; tuple plans are unsupported after JSON reload | P7 | Tests prove enforced execution budget, actual minimization, lossless supported types, and deterministic abstention for incompatible plans |
| Pure aggregate | `implemented` | `src/cross_examine/schema.py:223-241`; `tests/unit/test_schema.py` | Purely maps supplied findings and critical IDs to `SAFE`, `RISKY`, or `BROKEN` | Unsafe upstream classification or missing coverage can supply an incomplete set; validation failure can recurse | P2 integrity gate; repeated P8 sweep | Import-boundary checks prove purity and aggregation-failure injection returns one valid `RISKY` abstention without recursion |
| EvidenceReceipt v1 | `development-only` | `src/cross_examine/schema.py:37-53`; `src/cross_examine/execution.py:313-328`; `src/cross_examine/validation.py:10-27`; `tests/unit/test_validation.py` | Hashes canonical command/output and checks that receipt text is associated with rendered decided evidence | It is context-free, unauthenticated, substring-based, and does not recompute verdict, IDs, or claim/finding linkage; abstentions may omit receipts | P2 | Receipt v2 binds repository, revision role, input, policy, runtime, manifest, finding, and render linkage and validates attempted abstention evidence |
| Report codec | `development-only` | `src/cross_examine/codec.py:22-87`; `tests/unit/test_codec.py` | Serializes the current JSON-shaped report fields | It is not a versioned lossless semantic contract and ordinary JSON can erase tuple, subclass, and nominal-type identity | P2 integrity gate | Read and write reject tampered semantics and current supported values preserve exact type and canonical bytes across fresh processes |
| Trusted-host command executor | `implemented` | `src/cross_examine/execution.py:79-198,218-387`; `tests/unit/test_execution.py` | Launches top-level allowlisted commands for trusted input with bounded output and timeout policy | It is not a sandbox; target code retains host filesystem/network authority and cleanup is best effort | P3 prerequisite; repeated P8 sweep | Non-loopback unauthenticated service startup refuses and timeout/cleanup policy has one tested contract |
| Execution manifests | `development-only` | `src/cross_examine/execution.py:297-329`; `tests/unit/test_execution.py` | Returned to the immediate runner for successfully launched children | They are not persisted in Report, API export, CLI output, or React rendering | P3 | DB, export, CLI, API, and React preserve and render a validated manifest reference byte-equivalently |
| Completed-run persistence | `development-only` | `src/cross_examine/persistence/runs.py:29-125`; `tests/integration/test_run_repository.py` | Persists newly pipeline-validated completed reports and progress snapshots in SQLite | Legacy or otherwise unvalidated stored JSON is decoded without validation-on-read; submitted/resolved run context and deterministic stale-job recovery are incomplete | P2 read integrity; P3 recovery | Reads reject or quarantine invalid semantics; restart tests recover or terminate every stale job and retain the submitted and resolved run specification |
| Single-worker API and SSE | `development-only` | `src/cross_examine/api/app.py:49-85,177-223,253-294`; `tests/integration/test_api_jobs.py` | One in-process worker exposes local run progress and history | Queue and SSE history are process-local; no authentication exists; only loopback use is supported but the CLI does not enforce it | P3 prerequisite; repeated P8 sweep | Non-loopback operation is mechanically refused without explicit authentication, and restart tests preserve terminal job truth |
| React evidence rendering | `development-only` | `frontend/src/features/report/report-model.ts:1-40`; `frontend/src/features/report/FindingEvidence.tsx:9-33`; `frontend/src/features/report/FindingEvidence.test.tsx` | Renders stored verdict, finding, command/output, and receipt fields | Legacy/unvalidated DB/API reports are not revalidated before Render; finding provenance and execution manifests are absent; browser/accessibility coverage is narrow | P2 read integrity; P3 provenance | Python, validated stored JSON, API/CLI export, and React render the same validated provenance and manifest identities |
| Corpus v1 replay | `development-only` | `src/cross_examine/corpus/repository.py:40-169`; `src/cross_examine/pipeline.py:198-257`; `tests/integration/test_corpus.py` | Replays eligible verified Layer-A fixtures by literal locator and symbol | No Git identity, ancestry, or base revalidation; duplicate evidence is mutable; completion is non-atomic; latest-growth counts touches | P4 | Migration classifies every row active or quarantined, ancestry is conservative, duplicate insert growth is zero, and crash effects are all-or-nothing |
| Hosted fixture explorer | `implemented` | `api/index.py:14-18`; `src/cross_examine/api/app.py:91-117,177-186`; `tests/integration/test_api_fixture.py` | Directly serves a labeled checked-in offline evidence fixture; arbitrary hosted runs are rejected | Hosted `/tmp` run and corpus state is ephemeral and the live deployment bytes were not inspected in this audit | P9 | Deployed smoke identifies the immutable fixture/product commits and proves the durable direct-fixture path without claiming hosted execution |
| Checked-in hosted capture synchronization | `development-only` | `src/cross_examine/fixtures.py:10-14`; `scripts/generate_hosted_fixture.py:19-61`; `tests/integration/test_hosted_fixture_capture.py` | Generator tests the expected semantic fields | No gate compares regenerated fixture bytes with the checked-in artifact | P9 | A repository verification check regenerates the fixture and fails on any byte difference |
| Wheel install and hero smoke | `implemented` | `tests/release/test_wheel_install.py`; `tests/release/test_local_product_run.py` | Builds a wheel, installs it, and runs the local hero in an isolated offline test workspace | There is no sdist install smoke or broad supported-Python matrix | P9 | Wheel and sdist install from clean environments on every supported Python and OS combination |
| Cross-platform CI | `development-only` | `.github/workflows/verify.yml`; `scripts/verify.sh`; `scripts/verify.ps1`; `tests/unit/test_verification_entrypoints.py` | Workflow is configured for Python 3.12 and Node 20 on Ubuntu, macOS, and Windows | No immutable green run is cited; action tags are mutable; Windows does not assert static-bundle byte equality | P9 | A pinned workflow yields an immutable green run across the supported matrix with equivalent bundle, package, security, and release gates |
| Compatibility trials | `development-only` | `docs/trials.md:1-34`; `scripts/run_trials.py` | Historical manual-characterization compatibility observations | They are unblinded summaries without frozen truth, complete tracked receipts, or qualification authority | P6 | Versioned admitted cases, immutable manifests, total witnesses, receipt validation, and the pure scorer reproduce a development baseline |
| Deterministic setup contract | `future` | [current status](research/setup-hook-handoff.md#superseding-status--2026-07-19); [implementation sequence](research/setup-hook-handoff.md#implementation-sequence-and-exact-files); [acceptance gates](research/setup-hook-handoff.md#deterministic-acceptance-gates) | Design covers product-owned `none` and `wheel-no-deps` setup for trusted repositories | No SetupPlan, prepared environment, installed Layer A, installed tests, or setup persistence exists | P3 | Root, `src`, and build-generated fixture matrix passes paired installed Layer A/tests with one critical abstention per asymmetry |
| Corpus lifecycle v2 | `future` | [current status](research/corpus-lifecycle-handoff.md#superseding-status--2026-07-19); [implementation phases](research/corpus-lifecycle-handoff.md#implementation-phases); [completion gates](research/corpus-lifecycle-handoff.md#deterministic-completion-gates) | Design covers Git identity, ancestry, migration, observations, and conservative replay | No production v2 schema/migration exists; promotion, rebinding, and retirement require a distinct external signer | P4 | Deterministic migration/recovery tests pass and unsigned authority-changing operations remain disabled |
| Lifecycle mutation authority | `blocked external` | [current status](research/corpus-lifecycle-handoff.md#superseding-status--2026-07-19); [authority boundary](research/corpus-lifecycle-handoff.md#promotion-authority-and-audit-receipt); mission gate G3 | Conservative local inspection/replay can proceed without it | Repository code cannot invent the independent signer required for promotion, rebinding, or retirement | P4 | A configured signer issues a scope-bound identity-bound audit receipt accepted by adversarial verification |
| Lossless current-value integrity | `development-only` | `src/cross_examine/cross_examine/probe_runner.py:55-65`; tuple-drift tests and P1 risk register | Existing JSON-shaped scalar/list cases execute | Current tuple, optional-argument, subclass, nominal-type, and non-string-key paths can coerce or lose identity | P2 integrity gate | Current ambiguous paths abstain and supported observations are type-exact and byte-identical across fresh processes and hash seeds |
| New value families and Enum support | `future` | [current status](research/value-support-handoff.md#superseding-status--2026-07-19); [compatibility rules](research/value-support-handoff.md#compatibility-and-versioning-rules); [implementation map](research/value-support-handoff.md#exact-implementation-map) | Design recommendations only | Expansion must follow P4 corpus migration and P6 development-benchmark contract; it cannot mask current integrity work | P7 | Each new family passes codec and installed Layer A end to end before its matching Layer B implementation and benchmark gate |
| Intended-change oracle adapter | `future` | `src/cross_examine/cross_examine/layer_a.py:185-195`; [current status](research/intended-oracle-handoff.md#superseding-status--2026-07-19); [implementation order](research/intended-oracle-handoff.md#migration-and-implementation-order); [acceptance matrix](research/intended-oracle-handoff.md#acceptance-test-matrix) | Current represented intended-change claims deliberately abstain | No authenticated complete binding or exact-leaf adapter is implemented | P5 | One approved exact pytest leaf collects and executes exactly once; every missing, forged, stale, broad, or incomplete binding abstains `RISKY` |
| Intended-change approval authority | `blocked external` | [current status](research/intended-oracle-handoff.md#superseding-status--2026-07-19); [allowed provenance](research/intended-oracle-handoff.md#allowed-provenance); [acceptance matrix](research/intended-oracle-handoff.md#acceptance-test-matrix); mission gate G2 | Adapter and rejection paths may be built against an operator trust root | Repository code and model prose cannot authenticate human intent | P5 | An independent approver supplies a complete repository/head/claim/oracle/setup/expiry binding whose signature verifies |
| Frozen benchmark harness | `future` | [current status](research/benchmark-handoff.md#superseding-status--2026-07-19); [implementation map](research/benchmark-handoff.md#15-implementation-file-and-test-map); [definition of done](research/benchmark-handoff.md#16-definition-of-done-and-explicit-blocked-outcomes) | Design defines versioned cases, manifests, admission, witness replay, telemetry, and a pure scorer outside `aggregate()` | No tracked benchmark package, admitted cases, scorer, CI smoke, or baseline exists | P6 | Frozen release run twice produces identical identities and a declared development baseline with zero false or unvalidated refutations |
| Scored benchmark qualification | `blocked external` | [current status](research/benchmark-handoff.md#superseding-status--2026-07-19); [threat model](research/benchmark-handoff.md#4-threat-model-and-current-blockers); [blocked outcomes](research/benchmark-handoff.md#16-definition-of-done-and-explicit-blocked-outcomes); mission gate G4 | Unblinded development scoring may be labeled and run locally after prerequisites | Qualification needs hostile-target isolation, evaluator-only truth, and total witness coverage unavailable from the current adapter | P6 | A disposable network-denied target boundary and truth-separated evaluator pass adversarial leak and witness-completeness checks |
| Public video, submission, and final approval | `blocked external` | [final submission checklist](submission.md#final-submission-checklist); mission gate G5 | Local demo/release artifacts may be prepared and verified | Public URLs, platform submission, and human go/no-go cannot be fabricated by repository work | P9 | Public artifact locations and an explicit human release decision are recorded and independently reviewed |
| Hostile-target containment | `blocked external` | `src/cross_examine/execution.py:185-196`; `docs/execution-policy.md:21-37` | The current host adapter remains usable only for trusted input | Filesystem/network denial, quotas, disposable isolation, and independent evaluator truth require a separate execution system | P6 | A disposable restricted environment proves network denial, host isolation, quotas, cleanup, and truth separation under adversarial tests |

## Deterministic safety doctrine

`SAFE` is bounded: it means deterministic aggregation found no represented refutation,
no critical abstention, and no missing critical claim among the characterized,
represented, supported checks it received.
It is not proof that a repository or pull request is correct. Four current release
risks remain open: a model-controlled non-critical preservation mismatch can escape a
`BROKEN` or `RISKY` result; characterization can omit candidate symbols; report verdict,
identity, claim/finding linkage, and read-time semantics are not fully validated; and an
aggregation-stage validation failure can recurse. P2 closes known local integrity
prerequisites before capability expansion, and P8 repeats the broader adversarial sweep.

Models propose Claims and optional ProbePlans only. Deterministic code owns evidence
validation, outcomes, benchmark scoring, and verdicts. `aggregate()` remains a pure
domain function and cannot import IO, model, network, subprocess, database, benchmark,
or framework code.

## Evidence and scope doctrine

EvidenceReceipt v1 provides command/output association metadata. On newly
pipeline-validated reports, it hashes canonical command and output strings and requires
their inclusion in a `VERIFIED` or `REFUTED` finding before persistence. Legacy or
otherwise unvalidated stored reports are not revalidated on read and can reach the
current API/Render path without that guarantee. Receipt v1 does not bind repository
identity, revision role, input, expected value,
policy, runtime, manifest, claim/finding linkage, or verdict; it is not authentication,
attestation, or full semantic validation. `UNVERIFIABLE` findings may instead carry a
deterministic diagnostic without a receipt.

Ingest discovers broad candidate definitions in changed Python files. Probe eligibility
is narrower: current execution excludes classes, async functions, generators, unsupported
signatures, and unsupported or ambiguous values. Discovery coverage and executable
support must never be described as the same set.

## Execution and durability doctrine

The executor is a trusted-input host-process adapter, not a sandbox. The top-level
executable basename allowlist constrains harness launches only; target Python retains the
local host user's filesystem and network authority and can spawn other commands. Cleanup
is best effort. The only supported service posture is `127.0.0.1`, but the current CLI
does not enforce that boundary; unauthenticated non-loopback serving is unsafe. The
effective current command-timeout ceiling is 120 seconds even though the API accepts
larger values.

SQLite persists completed reports and progress snapshots. The single-worker queue and
SSE history remain in memory, and stale queued/running jobs are not recovered after a
restart. Execution manifests are returned by the runner but are not part of persisted or
rendered Reports.

## Compatibility and release-evidence doctrine

The verified environment uses Python 3.12. Project metadata permits Python `>=3.12`,
which is not evidence that every later Python release works. The release tests smoke a
wheel, not an sdist. CI is configured on three operating systems but needs an immutable
green run before it can be called verified. Hosted-fixture tests check semantics rather
than checked-in byte equality. Frontend evidence is focused component coverage, two
Chromium flows, and one axe smoke with contrast disabled; it is not WCAG compliance,
cross-browser, keyboard, screen-reader, zoom, resize, reduced-motion, touch, or deployed
proof.

## Authority and dependency doctrine

External authorities remain distinct gates: API-key/spend and one-request permission;
authenticated intended-change approval; corpus lifecycle signing; hostile-target
isolation plus evaluator-only truth; and public publication plus final human approval.
One key or approval cannot substitute for another, and unavailable authority is recorded
as `blocked external`, never invented.

Known trust-critical integrity work precedes expansion. P2 must make observed
preservation mismatches and omitted candidate coverage unable to produce `SAFE`, reject
tampered report verdict/IDs/linkage on write and read, terminate aggregation failure
without recursion, and make current lossy or ambiguous value paths abstain. P3 then
establishes setup, run-spec, manifest, recovery, and execution-policy conventions before
P4-P7 add corpus, oracle, benchmark, or value capability. P7 adds new lossless value
families only after P4 migration and the P6 development-benchmark contract; it does not
defer the existing value-integrity gate.
