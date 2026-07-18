# Ordered implementation roadmap: P0-P9 verification program

> **Superseding status — 2026-07-19.** The original 2026-07-18 receipt-first sequence is
> no longer the current execution order. EvidenceReceipt v1 and validation-before-pin
> landed in `ea14e2f`. Receipt v1 still binds only command/output substrings; contextual
> binding, complete semantic report/read validation, and atomic completion remain open.
> The [capability matrix](capability-status.md) owns current truth, and this page is the
> executable presentation of the stable P0-P9 mission graph.

## Invariants

- Preserve Ingest → Characterize → Cross-examine → Aggregate → Render.
- Models propose schema-constrained Claims and optional ProbePlans only. Deterministic
  code owns outcomes, benchmark scoring, and verdicts.
- Every `VERIFIED` or `REFUTED` finding keeps exact command/output and a valid receipt;
  abstentions may carry attempted evidence or a deterministic diagnostic.
- Keep `aggregate()` pure: no IO, model, network, subprocess, database, benchmark, or
  framework imports.
- Work Layer A end to end before its corresponding Layer B extension. Build Week target
  scope remains Python repositories.
- Unavailable authority is `blocked external`; it never becomes inferred success.

## Current status and dependency graph

```text
P0 audit/design -------------------------- complete
 |
 +--> P1 truthful docs ------------------- in_progress
 |      |
 |      +--> P2 paid execution/publication gate
 |
 +--> P2 offline preflight + local integrity gate (may proceed without a request)
          |
          +--> P3 policy closure + deterministic setup
                    |
                    +--> P4 corpus lifecycle v2
                    |      |
                    |      +--> P5 intended-change adapter
                    |      |      |
                    |      |      +--> P6 intended benchmark cases
                    |      |
                    |      +--------------------------+
                    |                                 |
                    +--> P6 development benchmark ----+--> P7 value-family expansion

P2 + P3 + P4 + P5 + P6 + P7 --> P8 broader adversarial hardening
P1 + P8 + truthful P2/P6 state --> P9 demo/developer experience/release
P0 + P1 + P2 + P3 + P4 + P5 + P6 + P7 + P8 + P9 --> FINAL
```

P2's paid request may remain externally blocked while its offline tooling and local
integrity work complete. That external lane is never a prerequisite for conservative
P3-P8 repository work. P4 corpus migration and the P6 development benchmark contract
both precede P7 value-family persistence/expansion. P8 repeats a broader independent
adversarial sweep; it does not postpone known false-safety defects from the early gate.

## Now

### P1 — truthful documentation and status

**State:** `in_progress`.

**Work:** Reconcile the capability matrix, README, architecture, execution policy,
submission, demo, trials, provenance, dated decisions, and research status. Label
historical/manual evidence and every external gate. Correct trial/corpus presentation
copy without changing runtime semantics.

**Measurable exit:** Local links and status vocabulary pass; claim/stale-pin/safety scans
contain no unresolved current overclaim; fresh and repeated credential-cleared fixture
runs produce `BROKEN/+2/2` then `BROKEN/+0/2`; repository verification passes; an
independent reviewer reports no Critical or Important contradiction.

### P2 — local integrity gate and offline real-model tooling

**State:** local work is pending/integrity-critical; paid evidence is `blocked external`
until G1 and the P1/current-pin review gate clear.

**Local integrity work that must precede P3-P7 expansion:**

1. An observed preservation mismatch cannot produce `SAFE` because model output set
   `preserve_critical=False`.
2. If changed-file candidate definitions are omitted from characterization, the pipeline
   rejects incomplete coverage or records critical abstentions; omission cannot produce
   `SAFE`.
3. Report verdict, reserved/duplicate IDs, claim/finding linkage, receipt association,
   and read-time semantics are validated before decision use.
4. Aggregation-stage validation failure terminates as one valid `RISKY` abstention without
   recursion or partial corpus authority.
5. Existing tuple, optional-argument, subclass, nominal-type, and non-string-key paths
   either round-trip exactly or abstain; lossy ambiguity never refutes.

**Offline trial work:** Strict artifact schema, malformed-claim rejection, deterministic
replay, report/DB/export/Render equality, current-pin identities, one-request accounting,
and redaction tests. No network request is needed to complete these gates.

**Measurable exit:** The five named integrity scenarios have failing-then-passing tests;
offline trial fixtures pass strict validation/replay/render/redaction; the paid lane
either records an independently authorized single current-pin request or an explicit G1
blocked receipt. A paid result never gains verdict authority.

## Next

### P3 — execution-policy closure and deterministic Python setup

**Dependencies:** P1 truth plus the P2 local integrity gate; paid P2 evidence is not
required.

**First prerequisite:** Refuse unauthenticated non-loopback serving and reconcile the API
timeout range with the executor's effective 120-second ceiling before adding setup
capability.

**Setup work:** Versioned, losslessly persisted product-owned `none` and
`wheel-no-deps` plans; symmetric base/head prepared environments; installed Layer A and
repository tests; persisted RunSpec/setup/manifest evidence; deterministic restart
recovery. A venv is setup, not hostile-target isolation.

**Measurable exit:** Root, `src`, and build-generated fixtures pass paired installed
Layer A/tests without source-import fallback; every setup asymmetry yields one critical
setup abstention and `RISKY`; stale jobs recover or terminate deterministically; API,
CLI, DB/export, and React expose the same validated setup/manifest identity.

### P4 — corpus lifecycle v2

**Dependencies:** P3 schema, persistence, identity, and recovery conventions.

**Work:** Git repository identity and ancestry, deterministic v1 migration/quarantine,
immutable contracts/versions, append-only observations, inherited-base revalidation,
atomic report/corpus completion, retention, and inspection. Promotion, rebinding, and
retirement remain disabled without G3 signing authority.

**Measurable exit:** Every legacy row is deterministically active or quarantined;
repointed/disconnected/shallow locators inherit no unsafe checks; clone/ancestry cases
select the same authorized frontier; duplicate replay reports inserted growth zero; fault
injection commits both run/corpus effects or neither.

### P5 — authenticated intended-change executable oracles

**Dependencies:** P3 and P4. Each decision still needs external G2 approval.

**Work:** Strict repository/head/claim/oracle/setup/expiry bindings; approval verification;
one hermetic exact-pytest-leaf adapter; pure classification, persistence, rendering, and
adversarial rejection. Model prose, broad tests, globs, `-k`, and head-authored authority
never approve intent.

**Measurable exit:** One approved exact leaf collects and executes exactly once; every
missing, forged, stale, broad, incomplete, skipped, xfailed, or mismatched binding emits
`BLOCKED-INTENDED-AUTHORITY`, a critical abstention, and `RISKY`.

### P6 — frozen benchmark development baseline

**Dependencies:** P3 reproducible setup; P5 for intended-change cases. Qualification is
separately blocked on G4 target/evaluator isolation and total witness truth.

**Work:** Versioned case/release/result contracts, admission and mutation controls,
immutable manifests, evaluator witness replay, telemetry, deterministic pure scorer
outside `aggregate()`, CI smoke, and an explicitly labeled unblinded development baseline.

**Measurable exit:** A frozen development release run twice yields identical identities;
all admitted refutations have evaluator witness classifications; false and unvalidated
refutations, invalid receipts, and truth leaks are zero. Without G4, no qualification or
population-safety score is published.

### P7 — new values, exceptions, types, signatures, and serialization

**Dependencies:** P3 setup, P4 corpus migration, and P6 development benchmark contract.
The P2 current-value integrity gate is already required; P7 is expansion, not its deferral.

**Work:** Separate probe and observation-codec versions; add new lossless value families,
including scoped Enum results, one Layer-A increment at a time. Add matching Layer B only
after that Layer-A slice and its development-benchmark gate pass.

**Measurable exit:** Supported values preserve exact type and canonical bytes across fresh
processes and hash seeds; unsupported/ambiguous/incompatible values abstain; no tuple,
subclass, or non-string-key coercion occurs; each new Layer B domain leaves common Layer A
semantics unchanged.

## Later

### P8 — broader adversarial product hardening

**Dependencies:** Local evidence from P2-P7. An externally blocked paid P2 lane does not
stop local hardening.

**Work:** Repeat an independent sweep across false-safety, complete coverage, semantic
validation/read validation, receipts, executor/service policy, corruption, migration,
atomicity, redaction, malformed input, timeouts, accessibility, packaging, and
cross-platform risks. Mechanically enforce the pure-aggregate import boundary.

**Measurable exit:** Every named P0/P1/security/release risk has a reproducing invariant
test before its fix; zero known false-`SAFE` path remains in the covered matrix; all
focused/full checks pass; independent reviewers report no unresolved Critical or
Important finding.

### P9 — demo, developer experience, and release

**Dependencies:** P1 and P8; P2 and P6 must be complete or truthfully represented by
explicit blocked evidence.

**Work:** Lead with the working offline path; accessible evidence/corpus affordances;
wheel and sdist installs; supported Python/OS matrix; static-bundle and hosted-fixture byte
equality; keyboard/mobile/zoom/contrast/reduced-motion/touch checks; deployed smoke; demo
rehearsal; exact narrative synchronization. Public submission and approval require G5.

**Measurable exit:** Fresh/repeat hero outputs match published copy; package, browser,
accessibility, fixture, bundle, CI, and deployed gates pass at immutable pins; secrets and
local paths are absent; final public locations and a human go/no-go are recorded.

## External authority gates

| Gate | Missing authority | Safe fallback |
| --- | --- | --- |
| G1 | API key, spend permission, explicit one-request authorization, current-pin review | Finish offline tooling; record paid evidence `blocked external`; make zero request |
| G2 | Authenticated complete intended-change approval | Emit `BLOCKED-INTENDED-AUTHORITY` and `RISKY` |
| G3 | Independent lifecycle signer for promotion/rebind/retire | Keep authority-changing operations disabled; continue conservative replay/inspection |
| G4 | Disposable network-denied target plus evaluator-only truth and total witnesses | Label results `UNBLINDED_DEVELOPMENT`; publish no qualification score |
| G5 | Public video/submission locations and final human release approval | Verify local artifacts without claiming publication or approval |

No local implementation, model output, shared key, or successful test run can substitute
for one of these distinct authorities.
