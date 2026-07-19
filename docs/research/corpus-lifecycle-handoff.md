# Corpus lifecycle v2: identity, ancestry, invalidation, and promotion

## Superseding status — 2026-07-19

- **Historical source:** the original Phase 0 research is preserved verbatim at commit
  `5bea8baf5f031d9bfdff592b3e85e001842c651b`.
- **Applies-to snapshot:** this handoff describes the 2026-07-18 Phase 0 working-tree
  design/audit snapshot and declares no product implementation pin. It is distinct from
  the then-current Task 1 documentation baseline
  `c3daef6d428aa775fae29b5f327c12dc6c2f3c4b` and all later product commits.
- **Current state:** corpus lifecycle v2 is `future`; lifecycle mutation authority is
  separately `blocked external`.
- **Dependency and authority gate:** P4 follows the P3 setup/persistence conventions.
  Conservative local migration, inspection, and replay may be implemented without a
  signer, but G3 requires an external scope- and identity-bound authority receipt before
  promotion, rebinding, retirement, conflict resolution, or family mutation.
- **Current truth:** see the authoritative [capability status](../capability-status.md).
  The original prose below remains historical design evidence, not a production v2
  schema, migration, or authority grant.

**Status:** implementation handoff; no production code is changed by this document

**Scope:** the smallest safe v2 for Python repositories

**Decision:** adopt an internal repository-family identity, commit-anchored immutable baseline versions, ancestry-frontier selection, append-only observations, and promotion authorized outside the model/pipeline.

## Executive decision

V1 conflates four different things: a submitted repository locator, durable repository identity, a logical behavioral check, and one expected result. The literal `RunSpec.repo` string is both UI text and the corpus namespace, while the expected result is part of `corpus_checks.id`. Therefore equivalent paths and URLs do not share evidence, a reused path can inherit unrelated evidence, and an intentional behavior change creates a second check beside the old one. Both expectations then replay indefinitely.

V2 separates the concepts:

1. A **repository family** is an application-generated UUID. It is an evidence-sharing lineage namespace, not a URL and not an authority domain.
2. A **locator alias** is a sanitized path or URL used only to find candidate families. A locator never proves identity.
3. A **Git object identity** is `(object_format, full_oid)`. Git ancestry over real commit objects proves whether an expectation applies to a run.
4. A **corpus contract** is one target binding plus canonical input and compatibility policy. Expected output is deliberately excluded from its identity.
5. A **baseline version** is an immutable expected result effective at one commit. Different branches may legitimately have different versions.
6. A **frontier** is the set of applicable versions that are not ancestors of another applicable version. One distinct frontier expectation replays. Conflicting frontier expectations abstain toward risk.
7. An **observation** records each execution without overwriting prior command/output evidence.
8. A **promotion** creates a new baseline version at a grounded head commit. It never rewrites a report, deletes a prior version, or globally marks the prior version inactive.
9. Only a configured **external cryptographic non-model authority adapter** may promote, rebind, retire, resolve a branch conflict, merge repository families, or rebind a locator. Every such action writes an immutable audit receipt in the same transaction.

This is the smallest model that makes sharing and invalidation the same deterministic question: “which immutable expectation versions are ancestors of this run’s base?”

## Non-negotiable invariants

- The five stages remain Ingest, Characterize, Cross-examine, Aggregate, and Render.
- `aggregate()` remains pure and imports no corpus, Git, database, model, network, subprocess, or framework code.
- The model may propose a claim or promotion candidate; it cannot select corpus coverage, invalidate evidence, authorize promotion, resolve identity, or decide an outcome.
- A verified or refuted corpus finding retains the exact executed command, captured output, execution-boundary evidence hash, and a corpus-attestation hash binding family, commits, contract, input, expectation, and policy to that evidence.
- Missing objects, shallow history, ambiguous family resolution, conflicting frontier baselines, missing targets, incompatible execution policy, and Git errors resolve toward risk, never safety.
- A URL/path match is a hint. Only Git object/ancestry proof or an audited non-model identity action can attach it to a family.
- Expected output is never part of logical contract identity.
- A mismatch never changes a baseline. Repetition never converts a mismatch into intentional behavior.
- Promotion changes only future runs whose base descends from the promotion commit.
- Historical reports, observations, versions, and authority receipts are append-only.
- Corpus writes and completed run persistence must be one atomic transaction or use an outbox that provides the same all-or-nothing property.
- Layer A works end-to-end with v2 before Layer B consumes v2 coverage.

## Discovery: current implementation

### Current identity inputs

| Concern | Current input | Current use | Failure |
|---|---|---|---|
| Repository | literal `RunSpec.repo` | `runs.repo`, `Report.repo`, corpus lookup, corpus hash, UI label | aliases split evidence; locator reuse/repointing inherits stale evidence |
| Revisions | submitted `base_ref`, `head_ref`; resolved SHAs exist only in `IngestResult`/`Report.pr_ref` | materialize worktrees and render range | corpus does not persist or query ancestry |
| Symbol | `module:qualname` from changed Python AST | claim target and corpus filter | rename/move strands evidence; name reuse can misapply it |
| Input | parsed args/kwargs rendered as canonical JSON | corpus hash and replay fixture | sound within current JSON contract |
| Expected | canonical JSON | corpus hash | changed behavior becomes an additional simultaneously applicable check |
| Evidence | command/output, with in-progress `evidence_hash` support | overwritten on duplicate pin | loses observation history; legacy hash may be blank |
| Environment | implicit current executor/runtime | not part of applicability | incompatible Python/OS/policy can look like a behavioral regression |
| Claim | model-authored claim ID/kind/target | decides which checks are loaded | omission or `intended_change` classification can suppress corpus enforcement |

Relevant current flow:

- `IngestService` clones the submitted locator, resolves `base_ref^{commit}` and `head_ref^{commit}`, and creates detached worktrees.
- `Pipeline._applicable_corpus()` asks for rows with exact `repo` and `target_symbol`, rewrites each fixture to the current claim ID, and mixes it with newly captured base fixtures.
- `CorpusRepository.pin()` hashes `{repo, target_symbol, args, kwargs, expected}`. A different expectation necessarily creates a different row.
- `applicable()` has no state, commit, hash-format, ancestry, compatibility, or evidence-validity predicate.
- Duplicate pins overwrite `command`, `output`, `evidence_hash`, `last_run_id`, and `updated_at`.
- Pinning occurs before the run repository persists the completed report, so a crash can leave corpus state attributed to an incomplete run.
- `_pin_verified()` joins fixtures to findings only by `(claim_id, repro_input)` through a last-write-wins dictionary. Contradictory fixtures can therefore bind to the wrong finding; v2 requires a stable fixture/contract/version execution ID in every finding.
- `GET /api/corpus` returns only raw locator, total, recent-observation-like “growth,” last run, and timestamp.
- Codec/report contracts expose only `pinned_this_run` and `corpus_total`; they cannot explain inheritance, conflicts, quarantine, or promotion.

The checked-in database at `.cross-examine/cross-examine.db` is schema version `0`. Read-only inspection found `integrity_check=ok`, 4 complete reports, and 70 corpus rows in two groups (a local hero path and a GitHub URL); its JSON inputs are valid and its first/last run references are present. It has no foreign keys between corpus checks and runs and no resolved corpus anchors. Its legacy `corpus_checks` table predates `evidence_hash`; startup code currently mutates that shape with an ad hoc `ALTER TABLE`.

### Failure cases to preserve in tests

1. Absolute path, relative path, symlink, `file://`, HTTPS, SSH, and mirror URLs for the same history create separate v1 corpora.
2. Moving a checkout strands evidence.
3. Recreating a repository at the same path reuses unrelated evidence.
4. A changed remote URL or Git `insteadOf` expansion changes the literal key.
5. A descendant fork cannot share common-ancestor evidence under a different locator.
6. Naively merging fork locators would leak a post-divergence expectation sideways to a sibling fork.
7. A rebase makes old anchors unreachable, but v1 replays them anyway because it has no anchors.
8. `base..head` is an endpoint diff; it does not prove that base is an ancestor of head. V1 treats siblings, reverse ranges, and unrelated histories as ordinary transitions.
9. An intentional result change inserts expectation B beside A. A and B both replay forever.
10. A renamed/deleted target is silently omitted when no current model claim uses its exact old name.
11. Reusing an old symbol name can attach old evidence to a new implementation.
12. Model omission or an `intended_change` label can prevent a corpus-owned preservation check from running.
13. Duplicate passes overwrite evidence instead of appending attestations.
14. A blank legacy `evidence_hash` can be replayed even though it cannot prove execution-boundary provenance.
15. Replace refs, grafts, shallow history, missing objects, and object-format mismatch can make an ancestry answer misleading or unknowable.
16. A commit-anchored expectation may already be stale at a later run base. If it is executed only on head, a pre-existing intentional change is falsely attributed to the current base→head transition.

## Models considered

| Model | Benefit | Fatal limitation | Decision |
|---|---|---|---|
| Canonical URL/path key | minimal schema and lookup change | there is no authoritative Git locator canonicalization; credentials, protocols, mirrors, moves, forks, `insteadOf`, symlinks, and repointing break equivalence or safety | reject as identity; retain as a hint |
| Root-commit/root-set fingerprint | clones and many forks share automatically | shallow history pretends commits are roots; unrelated-history merges change the set; full history rewrites change it; replace/graft affects traversal; it couples all forks into one apparent authority domain | reject as authority; optional diagnostic only |
| Tree/content fingerprint | survives some history rewrites | identical snapshots can be unrelated projects; it loses ancestry and branch scope; content equality cannot authorize expectation changes | reject |
| Generated family UUID + aliases + commit-anchored versions | locators can change; forks share only reachable evidence; promotions are branch-scoped; ambiguity is explicit | needs schema/migration and Git queries | **adopt** |

Git has no intrinsic repository UUID. V2 must not pretend otherwise. The repository-family UUID is local durable state, while Git object reachability proves evidence applicability.

## Explicit identities

### Repository family

`repository_family_id` is a random UUID generated on first grounded encounter. It groups histories allowed to discover one another’s commit-anchored evidence. It does not grant promotion authority across forks.

Family resolution rules:

- An exact sanitized alias match produces candidate families only.
- A candidate is accepted for this run only if at least one stored family anchor exists as a commit in the materialized clone and is connected to the run’s base by real Git ancestry.
- A new locator may join exactly one proven family automatically as an **observed alias**.
- If zero families prove connected, create a new family/epoch and inherit nothing.
- If more than one family proves connected, resolution is `ambiguous`; do not merge families or replay corpus until a non-model authority resolves it.
- If an existing alias no longer connects to its family, treat it as repointed/re-written: create a disconnected epoch, inherit nothing, and surface an identity warning. Never silently rebind the alias.

### Locator alias

Store both sanitized display text and a deterministic alias fingerprint. Strip URL userinfo, query, and fragment before persistence/logging. Cosmetic normalization may lower-case scheme/host, remove a default port, remove a trailing slash/`.git`, resolve a local path with `realpath`, and convert recognized SCP-like syntax to a URL-shaped hint. These operations affect discovery only.

`git remote get-url --all origin` may provide additional hints; Git expands `insteadOf`/`pushInsteadOf`, so the value is still not identity proof. Do not contact the remote merely to resolve identity.

### Git object

Every stored OID is tagged with the storage object format, currently `sha1` or `sha256`. Never compare untagged OIDs or abbreviations.

```
GitObjectId = (object_format: Literal["sha1", "sha256"], full_oid: str)
```

### Corpus contract

The logical contract key is versioned and excludes expected output:

```
contract_id = SHA256(
  "cross-examine-contract-v2\0" + canonical_json({
    "repository_family_id": family_id,
    "target_binding": target_symbol,
    "input": {"args": args, "kwargs": kwargs},
    "probe_protocol_version": probe_protocol_version,
    "compatibility_key": compatibility_key
  })
)
```

For v2, `target_binding` remains exact `module:qualname`. A deterministic language-aware symbol identity can be a later version; fuzzy/model mapping is forbidden.

`compatibility_key` minimally binds execution policy identity, probe protocol version, Python major/minor, OS, architecture, and a deterministic dependency/lock/environment manifest digest. A mismatch produces `incompatible`, not `REFUTED`. If the repository has no supported lock identity, record that limitation explicitly rather than treating ambient dependencies as compatible.

### Baseline version

A baseline version is immutable:

```
(version_id, contract_id, kind, target_binding, expected_json,
 effective_object_format, effective_commit, source_run_id,
 source_finding_key, evidence_hash, authority_receipt_id, created_at)
```

`kind` is `expectation` or `tombstone`. Initial deterministic pinning creates an expectation with no authority receipt; promotion/rebind/retirement/conflict resolution requires one.

### Observation and authority receipt

Every replay appends an observation. It never overwrites the baseline’s source evidence. Every authority action appends a receipt whose hash binds its canonical payload and the prior receipt hash for that family. Hash chaining detects mutation/reordering; database authorization and backups must also detect deletion/truncation.

## Git identity and ancestry algorithm

All commands use argument arrays, `shell=False`, the current bounded execution policy, and `GIT_NO_REPLACE_OBJECTS=1` (or `git --no-replace-objects` immediately after `git`). Capture exact command, exit status, stdout, and stderr.

Before trusting traversal, also require no nonempty legacy graft file and no replacement refs in the materialized clone. Resolve the graft path with `git rev-parse --git-path info/grafts`; list replacement refs with `git for-each-ref refs/replace/`. `--no-replace-objects` is still mandatory, but an unexpected graft/replace configuration is surfaced as an identity-integrity warning rather than normalized away. A bounded `git fsck`/connectivity policy may strengthen this gate; failure is `UNKNOWN`, never “not ancestor.”

### Ingest facts

```text
git --no-replace-objects -C <repo> rev-parse --show-object-format=storage
  stdout sha1|sha256 => object_format
  other/error        => identity UNKNOWN, preserve-critical risk

git --no-replace-objects -C <repo> rev-parse --verify <base>^{commit}
git --no-replace-objects -C <repo> rev-parse --verify <head>^{commit}
  one full valid OID => resolved endpoint
  error/extra output => ingest failure

git --no-replace-objects -C <repo> rev-parse --is-shallow-repository
  false => ancestry may proceed
  true/error => corpus ancestry UNKNOWN; no replay/pin/promotion

git --no-replace-objects -C <repo> merge-base --is-ancestor <base_oid> <head_oid>
  exit 0 => FORWARD
  exit 1 => NON_ANCESTOR
  other  => UNKNOWN
```

Git documents `merge-base --is-ancestor A B` as exit `0` when A is an ancestor of B, `1` when it is not, and another nonzero status for errors. `git diff A..B` compares endpoints and does not establish that relation. Replacement refs are honored by most Git commands unless disabled. A shallow repository intentionally pretends boundary commits are roots. These are correctness constraints, not defensive extras.

### Family candidate proof

For each candidate family anchor with the same object format:

```text
git --no-replace-objects -C <repo> cat-file -e <anchor_oid>^{commit}
git --no-replace-objects -C <repo> merge-base --is-ancestor <anchor_oid> <base_oid>
git --no-replace-objects -C <repo> merge-base --is-ancestor <base_oid> <anchor_oid>
```

An anchor is connected if it exists and either commit is an ancestor of the other. For fork discovery, an existing family baseline ancestor of `base_oid` is sufficient. Missing objects and Git errors are `UNKNOWN`, not “unrelated.” A family with an unknown result may not be silently excluded if it was selected by an exact alias; surface risk/identity attention.

Do not use patch IDs, tree equality, remote URL equality, author identity, branch names, reflogs, or model judgment to bridge a disconnected rewrite in v2.

### Corpus applicability and frontier

Corpus enforcement is independent of model claims. The pipeline synthesizes corpus-owned preservation claims for every applicable contract within a deterministic configured budget. Skipping a critical applicable contract produces an explicit `UNVERIFIABLE` finding and risk.

For each contract at run base `B`:

1. Load non-quarantined versions in the resolved family and matching compatibility key.
2. For every version anchor `V`, prove that the object exists and run `merge-base --is-ancestor V B`.
3. Exit `0` means applicable; `1` means inapplicable; missing object or other error means applicability `UNKNOWN` and the contract is not safe to skip.
4. From applicable versions, remove any version whose effective commit is an ancestor of another applicable version for the same contract. The remainder is the ancestry frontier.
5. No frontier means no inherited baseline.
6. One frontier expectation replays. One frontier tombstone records an authorized skip.
7. Multiple frontier versions with the same `(kind, target_binding, expected_hash)` coalesce to one execution but retain all provenance.
8. Multiple frontier versions that disagree produce `baseline_branch_conflict`, a preserve-critical `UNVERIFIABLE` finding, and no guessed replay.
9. Execute the chosen expectation against the current run **base** first using its stable contract/version execution ID. If base does not reproduce it, append `stale_on_base` and emit preserve-critical `UNVERIFIABLE`; do not accuse head of a regression. Only a matching, grounded base execution may be replayed against head and become `VERIFIED` or `REFUTED` for this transition.

SQL narrows candidates; Git decides reachability. SQLite must never infer ancestry from timestamps, run order, row IDs, or a single `supersedes_id`.

### Pinning new evidence

Fresh Layer-A behavior may create an initial expectation only when:

- base/head relation is `FORWARD` (including base=head);
- base capture and head replay both have valid execution receipts;
- the finding is `VERIFIED`, Layer A, preservation semantics, and policy-compatible;
- the target/input contract is deterministic and schema-valid;
- there is no conflicting applicable frontier for that contract.

Anchor the new version at `head_oid`, the endpoint at which the expectation was verified. A repeated same expectation appends an observation only. A changed actual value appends a conflict observation only; it never auto-pins a competing version.

Every base/head execution carries `(contract_id, version_id or fresh_fixture_id, canonical_input_hash)` into the finding. Never recover that identity from `(claim_id, repro_input)` or list order.

For `NON_ANCESTOR`, verification may continue to produce a conservative report, but corpus replay, initial pin, rebind, retirement, and promotion are disabled. Add a preserve-critical system finding so the verdict cannot be `SAFE` under ordinary PR-transition semantics.

## State model

State is mostly derived from immutable facts. Avoid a mutable global `active` boolean because it is wrong on sibling branches.

| Derived state at a run base | Meaning | Replay behavior |
|---|---|---|
| `no_baseline` | no reachable version | fresh capture only; show no inheritance |
| `effective` | one distinct frontier expectation | replay |
| `retired_here` | one frontier tombstone | do not replay; show receipt/reason |
| `branch_conflict` | multiple disagreeing frontier versions | abstain/risk; require resolution |
| `applicability_unknown` | missing object, shallow history, Git error, or format mismatch | abstain/risk |
| `target_missing` | effective binding cannot be executed/imported | abstain/risk; baseline unchanged |
| `incompatible` | executor/probe compatibility differs | abstain/risk; baseline unchanged |
| `stale_on_base` | effective version no longer matches the current base | abstain/risk; do not attribute it to head; baseline unchanged |
| `challenged_on_head` | baseline matched base and grounded head differs | refute/risk as normal; baseline unchanged |
| `quarantined` | legacy or invalid provenance not eligible for selection | never replay; visible for adoption review |

### Transition table

| From | Event | Authority | Preconditions | Durable result |
|---|---|---|---|---|
| no baseline | fresh base capture equals head | deterministic pipeline | forward ancestry; valid receipts; compatible Layer A preservation | initial expectation at head + observation |
| effective | identical replay | deterministic pipeline | valid head receipt | append `passed`; no version mutation |
| effective | grounded mismatch on current base | deterministic pipeline | valid base receipt | append `stale_on_base`; critical abstention; do not classify head regression |
| effective | base matches, grounded head differs | deterministic pipeline | valid base/head receipts | append `challenged_on_head`; report refutation; version remains effective |
| effective | timeout/setup/error | deterministic pipeline | none | append `unverifiable`; no version mutation |
| effective | target absent/renamed | deterministic pipeline | deterministic lookup failed | append `target_missing`; no mutation |
| effective/stale_on_base/challenged_on_head | promote actual | externally signed non-model authority | completed grounded forward run; exact current frontier CAS; executed actual/head bound | child expectation at head + receipt |
| effective/stale_on_base/challenged_on_head | rebind symbol | externally signed non-model authority | grounded execution at exact new target/head; frontier CAS | child expectation with new binding + receipt |
| effective/stale_on_base/challenged_on_head | retire | externally signed non-model authority | explicit rationale/effective commit; frontier CAS | tombstone at commit + receipt |
| branch conflict | resolve at merge | non-model authority | all frontier IDs supplied; grounded merge commit; selected expectation executed | resolving version at merge + receipt |
| quarantined legacy | adopt | non-model authority | fresh grounded forward run and explicit legacy IDs | new v2 expectation + receipt; legacy retained |
| disconnected alias | attach/rebind alias | non-model authority | explicit family IDs and identity rationale | alias/family event + receipt; never alters old runs |
| any | model proposes change | model | schema-valid proposal only | candidate/display item; no corpus state change |

Promotion does not rewrite the run that motivated it. The old report remains refuted/risky/broken. The UI says: “Accepted for future descendant runs. This report remains unchanged; rerun to verify the promoted baseline.”

## Promotion authority and audit receipt

### Authority boundary

Allowed authority adapters are configured outside the model and pipeline:

- `signed_operator`: an operator signature verified against an allowlisted public key whose private key is held outside the model-, worker-, target-, and database-accessible process boundary (for example an OS/user approval service that requires presence);
- `signed_policy`: a deterministic policy approval signed by an allowlisted external policy key.

Disallowed actors include the characterizer, any model tool call, the verification worker, a repository hook, target code, an unauthenticated HTTP caller, or a string in a commit message/claim.

For the smallest safe local v2, expose promotion confirmation only on the local control plane, not the target execution environment. Mint a short-lived, one-use challenge after the operator views the exact diff, expected/actual, command/output, source/target commits, and affected scope. Bind the challenge to `(action, run_id, contract_id, motivating_base_frontier_ids, current_head_frontier_ids, head_oid, actual_hash, corpus_attestation_hash)`. The external authority signs the entire canonical request plus challenge. The worker/model-facing API cannot sign it, and an actor string, UI click, CLI flag, localhost cookie, or database row is never sufficient authority by itself.

This requirement follows the repository trust boundary: target code retains local host authority. If the private authority key is accessible to the verification process or target repository, “non-model” approval is forgeable. V2 must either provide the isolated signing boundary or leave promotion unavailable; it may not weaken the requirement silently.

### Preconditions

Promotion is one transaction and must reject unless:

1. the source run is complete and its stored report validates;
2. its resolved base/head relation is `FORWARD`;
3. the supplied effective commit exactly equals the stored head OID/object format;
4. the selected head observation contains the exact executed candidate output, command, evidence hash, and corpus-attestation hash; an operator may only adopt this executed value, never type arbitrary expected JSON;
5. canonical `actual_json` recomputes to the requested new expected hash;
6. both the motivating base frontier and current head frontier exactly equal their signed compare-and-swap sets; the head frontier is the scope superseded by promotion;
7. the authority adapter verifies an allowlisted external signature over the complete canonical payload and one-use challenge;
8. rationale is nonblank and bounded; external reference is sanitized;
9. no existing receipt/request hash has already performed the action.

### Receipt payload

```json
{
  "schema": "cross-examine-authority-receipt-v1",
  "event_id": "uuid",
  "action": "promote|rebind|retire|resolve_conflict|merge_family|rebind_alias|adopt_legacy",
  "repository_family_id": "uuid",
  "contract_id": "sha256",
  "from_version_ids": ["..."],
  "motivating_base_version_ids": ["..."],
  "to_version_id": "...",
  "object_format": "sha1",
  "effective_commit": "full oid",
  "run_id": "...",
  "finding_key": "...",
  "expected_before_hashes": ["..."],
  "expected_after_hash": "...",
  "command": "exact command",
  "output": "captured output",
  "evidence_hash": "...",
  "corpus_attestation_hash": "family/commit/contract/input/expected/policy-bound digest",
  "authority_type": "signed_operator",
  "authority_id": "configured stable id",
  "authority_key_id": "allowlisted signing key",
  "authority_signature": "signature over canonical approval payload",
  "rationale": "bounded operator text",
  "external_reference": null,
  "challenge_id": "one-use challenge id",
  "request_hash": "sha256 canonical request",
  "previous_receipt_hash": "family chain head or null",
  "created_at": "UTC timestamp"
}
```

Persist canonical receipt JSON plus `receipt_hash = SHA256("cross-examine-authority-receipt-v1\0" + canonical_json)`. Revalidate the signature, allowlist/revocation status, request digest, and bound corpus attestation whenever a version is selected. Invalid authority provenance quarantines the version and creates critical risk; it never silently falls back to a less-recent baseline. The new version, nonce consumption, receipt, family chain-head update, and observation linkage commit atomically.

## Data model

The DDL below is intentionally explicit pseudocode for SQLite. Names may be adjusted during implementation, but its constraints and separation of identities are completion requirements.

```sql
PRAGMA foreign_keys = ON;

CREATE TABLE schema_meta (
  singleton INTEGER PRIMARY KEY CHECK (singleton = 1),
  schema_version INTEGER NOT NULL,
  migration_state TEXT NOT NULL CHECK (migration_state IN ('clean','running','failed')),
  migration_id TEXT,
  updated_at TEXT NOT NULL
);

CREATE TABLE repository_families (
  id TEXT PRIMARY KEY,
  generation INTEGER NOT NULL DEFAULT 0 CHECK (generation >= 0),
  created_at TEXT NOT NULL,
  receipt_chain_head TEXT
);

CREATE TABLE repository_aliases (
  id TEXT PRIMARY KEY,
  family_id TEXT NOT NULL REFERENCES repository_families(id),
  kind TEXT NOT NULL CHECK (kind IN ('path','file_url','network_url','scp_like','legacy')),
  normalized_hint TEXT NOT NULL,
  locator_fingerprint TEXT NOT NULL,
  raw_locator_digest TEXT NOT NULL,
  display_locator TEXT NOT NULL,
  binding_state TEXT NOT NULL CHECK (binding_state IN ('observed','authorized','conflicted','repointed')),
  proof_object_format TEXT,
  proof_commit TEXT,
  first_seen_at TEXT NOT NULL,
  last_seen_at TEXT NOT NULL,
  UNIQUE(family_id, locator_fingerprint)
);
CREATE INDEX repository_alias_fingerprint_idx
  ON repository_aliases(locator_fingerprint);

CREATE TABLE run_revisions (
  run_id TEXT PRIMARY KEY REFERENCES runs(id),
  family_id TEXT REFERENCES repository_families(id),
  object_format TEXT CHECK (object_format IN ('sha1','sha256')),
  base_oid TEXT,
  head_oid TEXT,
  relation TEXT NOT NULL CHECK (relation IN ('forward','non_ancestor','unknown','legacy_unknown')),
  shallow INTEGER CHECK (shallow IN (0,1)),
  identity_status TEXT NOT NULL CHECK (identity_status IN ('proven','new_family','ambiguous','disconnected','unknown','legacy_unknown')),
  identity_receipt_json TEXT,
  created_at TEXT NOT NULL,
  CHECK ((object_format IS NULL) = (base_oid IS NULL)),
  CHECK ((base_oid IS NULL) = (head_oid IS NULL))
);
CREATE INDEX run_revisions_family_idx ON run_revisions(family_id, created_at);

CREATE TABLE run_completion_receipts (
  run_id TEXT PRIMARY KEY REFERENCES runs(id),
  completion_manifest_hash TEXT NOT NULL UNIQUE,
  completed_at TEXT NOT NULL
);

CREATE TABLE corpus_contracts (
  id TEXT PRIMARY KEY,
  family_id TEXT NOT NULL REFERENCES repository_families(id),
  target_binding TEXT NOT NULL,
  input_json TEXT NOT NULL,
  input_hash TEXT NOT NULL,
  probe_protocol_version TEXT NOT NULL,
  compatibility_key TEXT NOT NULL,
  criticality TEXT NOT NULL CHECK (criticality IN ('critical','noncritical')),
  source_run_id TEXT REFERENCES runs(id),
  created_at TEXT NOT NULL,
  UNIQUE(family_id, target_binding, input_hash, probe_protocol_version, compatibility_key)
);
CREATE INDEX corpus_contract_family_target_idx
  ON corpus_contracts(family_id, target_binding);

CREATE TABLE baseline_versions (
  id TEXT PRIMARY KEY,
  contract_id TEXT NOT NULL REFERENCES corpus_contracts(id),
  kind TEXT NOT NULL CHECK (kind IN ('expectation','tombstone')),
  target_binding TEXT NOT NULL,
  expected_json TEXT,
  expected_hash TEXT,
  object_format TEXT NOT NULL CHECK (object_format IN ('sha1','sha256')),
  effective_commit TEXT NOT NULL,
  source_run_id TEXT NOT NULL REFERENCES runs(id),
  source_finding_key TEXT NOT NULL,
  source_command TEXT NOT NULL,
  source_output TEXT NOT NULL,
  evidence_hash TEXT NOT NULL,
  source_attestation_hash TEXT NOT NULL,
  authority_receipt_id TEXT REFERENCES authority_receipts(id),
  provenance_state TEXT NOT NULL CHECK (provenance_state IN ('grounded','migration_quarantined','revoked')),
  created_at TEXT NOT NULL,
  CHECK ((kind = 'tombstone') = (expected_json IS NULL)),
  CHECK ((kind = 'tombstone') = (expected_hash IS NULL))
);
CREATE INDEX baseline_contract_anchor_idx
  ON baseline_versions(contract_id, object_format, effective_commit);
CREATE UNIQUE INDEX baseline_expectation_anchor_idx
  ON baseline_versions(contract_id, object_format, effective_commit, expected_hash)
  WHERE kind = 'expectation';
CREATE UNIQUE INDEX baseline_tombstone_anchor_idx
  ON baseline_versions(contract_id, object_format, effective_commit)
  WHERE kind = 'tombstone';

CREATE TABLE corpus_observations (
  id TEXT PRIMARY KEY,
  version_id TEXT REFERENCES baseline_versions(id),
  contract_id TEXT NOT NULL REFERENCES corpus_contracts(id),
  run_id TEXT NOT NULL REFERENCES runs(id),
  phase TEXT NOT NULL CHECK (phase IN ('base','head','system')),
  execution_key TEXT NOT NULL,
  result TEXT NOT NULL CHECK (result IN
    ('passed','stale_on_base','challenged_on_head','unverifiable','target_missing','incompatible','skipped','branch_conflict')),
  object_format TEXT,
  observed_commit TEXT,
  actual_json TEXT,
  command TEXT NOT NULL,
  output TEXT NOT NULL,
  evidence_hash TEXT NOT NULL,
  corpus_attestation_hash TEXT NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE(run_id, execution_key, phase)
);
CREATE INDEX corpus_observation_run_idx ON corpus_observations(run_id);

CREATE TABLE authority_challenges (
  id TEXT PRIMARY KEY,
  binding_hash TEXT NOT NULL UNIQUE,
  authority_id TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  consumed_at TEXT,
  consumed_by_receipt_id TEXT REFERENCES authority_receipts(id)
);

CREATE TABLE authority_receipts (
  id TEXT PRIMARY KEY,
  family_id TEXT NOT NULL REFERENCES repository_families(id),
  contract_id TEXT REFERENCES corpus_contracts(id),
  action TEXT NOT NULL CHECK (action IN
    ('promote','rebind','retire','resolve_conflict','merge_family','rebind_alias','adopt_legacy')),
  run_id TEXT REFERENCES runs(id),
  effective_commit TEXT,
  authority_type TEXT NOT NULL CHECK (authority_type IN ('signed_operator','signed_policy')),
  authority_id TEXT NOT NULL,
  authority_key_id TEXT NOT NULL,
  authority_signature TEXT NOT NULL,
  request_hash TEXT NOT NULL UNIQUE,
  previous_receipt_hash TEXT,
  receipt_json TEXT NOT NULL,
  receipt_hash TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL
);

CREATE TABLE baseline_predecessors (
  predecessor_id TEXT NOT NULL REFERENCES baseline_versions(id),
  successor_id TEXT NOT NULL REFERENCES baseline_versions(id),
  receipt_id TEXT NOT NULL REFERENCES authority_receipts(id),
  PRIMARY KEY(predecessor_id, successor_id),
  CHECK (predecessor_id <> successor_id)
);

CREATE TABLE legacy_corpus_quarantine (
  legacy_id TEXT PRIMARY KEY,
  family_id TEXT NOT NULL REFERENCES repository_families(id),
  contract_id TEXT REFERENCES corpus_contracts(id),
  payload_json TEXT NOT NULL,
  quarantine_reason TEXT NOT NULL,
  migrated_at TEXT NOT NULL
);

CREATE TABLE migration_ledger (
  id TEXT PRIMARY KEY,
  from_version INTEGER NOT NULL,
  to_version INTEGER NOT NULL,
  source_manifest_hash TEXT NOT NULL,
  destination_manifest_hash TEXT NOT NULL,
  started_at TEXT NOT NULL,
  completed_at TEXT,
  status TEXT NOT NULL CHECK (status IN ('running','complete','failed'))
);
```

The implementation may use a separate corpus transaction service rather than make `CorpusRepository` own every table. `aggregate()` still receives ordinary findings and remains pure.

## Representative queries and algorithms

### Candidate families by alias

```sql
SELECT DISTINCT f.id
FROM repository_aliases a
JOIN repository_families f ON f.id = a.family_id
WHERE a.locator_fingerprint = ?
  AND a.binding_state IN ('observed','authorized');
```

Each result still requires Git proof. A zero-row result may be followed by a bounded search of stored family anchors present in the current object database so a new alias/fork can discover a family.

### Candidate versions for Git filtering

```sql
SELECT v.*, c.target_binding, c.input_json, c.compatibility_key
FROM corpus_contracts c
JOIN baseline_versions v ON v.contract_id = c.id
WHERE c.family_id = ?
  AND c.compatibility_key = ?
  AND v.object_format = ?
  AND v.provenance_state = 'grounded'
ORDER BY c.id, v.created_at, v.id;
```

For each anchor, Git returns `APPLICABLE`, `INAPPLICABLE`, or `UNKNOWN`. Never encode exit `>1` as false.

### Frontier pseudocode

```python
def select_frontier(repo, base_oid, versions):
    applicable = []
    for version in versions:
        relation = is_ancestor(repo, version.effective_commit, base_oid)
        if relation is UNKNOWN:
            return ApplicabilityUnknown(version.id)
        if relation is TRUE:
            applicable.append(version)

    frontier = []
    for candidate in applicable:
        dominated = any(
            candidate.id != other.id
            and is_ancestor(repo, candidate.effective_commit, other.effective_commit) is TRUE
            for other in applicable
        )
        if not dominated:
            frontier.append(candidate)

    signatures = {(v.kind, v.target_binding, v.expected_hash) for v in frontier}
    if not frontier:
        return NoBaseline()
    if len(signatures) == 1:
        return Effective(frontier)
    return BranchConflict(frontier)
```

Cache ancestry answers within one run and batch object existence checks with `cat-file --batch-check` when scale requires it. Performance optimizations may not collapse `UNKNOWN` into false.

### Promotion transaction pseudocode

```python
# Git proof is computed from the still-present materialized source run before
# taking the database write lock. It carries every command receipt plus the
# family generation and frontier IDs observed at that generation. The base
# proof binds the motivating finding; the head proof is the current scope that
# the new version will supersede.
base_proof = corpus.compute_frontier_proof(
    repo_path=materialized_run_repo(request.run_id),
    contract_id=request.contract_id,
    at_base_oid=stored_run_revision(request.run_id).base_oid,
)
head_proof = corpus.compute_frontier_proof(
    repo_path=materialized_run_repo(request.run_id),
    contract_id=request.contract_id,
    at_base_oid=stored_run_revision(request.run_id).head_oid,
)

with database.begin_immediate() as tx:
    run = tx.get_completed_run_for_update(request.run_id)
    assert_forward_grounded_run(run, request.head_oid)
    observation = tx.get_observation_for_update(request.observation_id)
    verify_evidence_receipt(observation)
    assert canonical_hash(observation.actual_json) == request.expected_after_hash
    family = tx.get_family_for_update(request.family_id)
    assert base_proof.family_generation == head_proof.family_generation
    assert family.generation == head_proof.family_generation
    assert base_proof.version_ids == request.expected_base_frontier_ids
    assert head_proof.version_ids == request.expected_head_frontier_ids  # CAS
    verify_frontier_proof_receipts(base_proof, run.revision)
    verify_frontier_proof_receipts(head_proof, run.revision)
    authority = authority_adapter.verify_external_signature(
        request.signed_payload, request.bound_challenge, allowlisted_keys
    )
    challenge = tx.consume_unexpired_challenge(
        request.challenge_id, request.binding_hash
    )
    receipt = build_and_hash_receipt(request, run, observation, authority, family.chain_head)
    successor = build_immutable_version(effective_commit=run.head_oid, receipt=receipt)
    tx.insert_receipt(receipt)
    tx.insert_version(successor)
    tx.insert_predecessors(head_proof.version_ids, successor.id, receipt.id)
    tx.compare_and_advance_family(
        expected_generation=head_proof.family_generation,
        new_chain_head=receipt.receipt_hash,
    )
```

Git work occurs before `BEGIN IMMEDIATE` where possible; the transaction rechecks stored run/frontier generations and all hashes. Do not hold a SQLite write lock while executing target code or network operations.

### Atomic run-completion unit of work

The pipeline must stop calling `CorpusRepository.pin()` directly. It returns a validated report plus immutable `RunRevisionFacts` and `PendingCorpusEffect[]`. The API/CLI completes them through one service and one SQLite connection:

```python
def complete_run_atomically(run_id, report, revision, effects):
    validate_report(report)
    validate_revision_receipts(revision)
    validate_pending_effects_against_report(effects, report, revision)
    report_json = report_to_json(report)
    requested_manifest = completion_manifest(report_json, revision, effects)

    with database.begin_immediate() as tx:
        run = tx.require_run(run_id)
        if run.status == "complete":
            stored = tx.get_completion_receipt(run_id)
            recomputed = tx.recompute_stored_completion_manifest(run_id)
            if stored.manifest_hash == recomputed == requested_manifest:
                return run  # successful commit whose acknowledgement was lost
            raise CompletionConflict(run_id)
        if run.status not in {"queued", "running"}:
            raise CompletionConflict(run_id)
        tx.insert_run_revision(run_id, revision)
        for effect in effects:
            tx.insert_or_verify_family_and_contract(effect)
            tx.insert_immutable_version_if_initial_pin(effect)
            tx.insert_observation(effect)
        tx.compare_and_advance_affected_family_generations(effects)
        tx.insert_completion_receipt(
            run_id, requested_manifest, revision.completed_at
        )
        changed = tx.execute(
            """
            UPDATE runs
            SET status='complete', stage='complete', message='Report ready',
                updated_at=?, report_json=?
            WHERE id=? AND status IN ('queued','running')
            """,
            (revision.completed_at, report_json, run_id),
        ).rowcount
        assert changed == 1
```

The completion manifest is domain-bound to `run_id` and is a canonical digest of report bytes, run revision facts/receipts, and the ordered immutable corpus-effect payloads; it excludes the completion-receipt row that stores the digest. Any exception rolls back the run revision, contracts, versions, observations, generation changes, receipt, and completed report together. Selection joins source runs with `runs.status='complete'` and verifies the stored report/observation digest, so even manually introduced orphan rows are ineligible. Retrying the same completion is idempotent only when every immutable payload hash matches; a differing retry is corruption/conflict, not an update.

### Corpus summary

Do not call recent observations “growth.” Calculate created versions/contracts separately from passes:

```sql
SELECT
  f.id AS repository_family_id,
  COUNT(DISTINCT c.id) AS contract_total,
  COALESCE(q.quarantined, 0) AS quarantined,
  MAX(o.created_at) AS last_observed_at
FROM repository_families f
LEFT JOIN corpus_contracts c ON c.family_id = f.id
LEFT JOIN corpus_observations o ON o.contract_id = c.id
LEFT JOIN (
  SELECT family_id, COUNT(*) AS quarantined
  FROM legacy_corpus_quarantine
  GROUP BY family_id
) q ON q.family_id = f.id
GROUP BY f.id, q.quarantined;
```

“Effective at latest” remains Git-derived and is best computed by the corpus service for a selected family head, not by SQL timestamps.

## Migration from schema version 0

### Policy

All legacy corpus rows migrate deterministically but remain quarantined. They lack a reliable effective commit, object format, compatibility key, immutable observation history, promotion authority, foreign-key integrity, and—on existing databases—execution-boundary evidence hashes. Do not synthesize an evidence hash from stored command/output and call it grounded; that would create provenance retroactively.

Completed v1 reports may contain `pr_ref` with two full SHAs, but that is insufficient to prove which endpoint grounded the stored row, that the row belongs to that run, that the object format is SHA-1, or that the stored evidence came from the execution boundary. Preserve those values as diagnostic migration metadata only.

Migration must recognize two exact legacy shapes:

- v1a: `corpus_checks` without `evidence_hash`;
- v1b: the same table with `evidence_hash TEXT NOT NULL DEFAULT ''`.

Unknown columns, missing columns, different constraints, a newer version, or a partially completed migration fail closed before corpus writes. Run history may remain readable if the application can safely expose it without initializing corpus mutation.

### Deterministic mapping

- Create one family per exact legacy `repo` string appearing in the union of `runs` and `corpus_checks`. Do not normalize-merge aliases during migration.
- Freeze and publish one code constant `CORPUS_V2_MIGRATION_NAMESPACE_UUID`; `family_id = UUIDv5(constant, "legacy-repo\0" + repo)` and `alias_id = UUIDv5(constant, "legacy-alias\0" + repo)`.
- Store the exact legacy locator only after credential stripping; store its original hash for reconciliation.
- Create a logical contract using legacy target/input plus compatibility value `legacy-unknown` and criticality `critical`.
- Different legacy expectations for the same `(repo,target,input)` become separate quarantined payloads under the same contract, not active versions.
- Preserve every non-locator legacy column in canonical `payload_json`, including blank evidence hash and first/last run IDs. Preserve the exact raw row in the archived v1 table; the v2 payload stores only a credential-stripped locator plus its original digest so migration does not duplicate secrets.
- Add `run_revisions` rows as `legacy_unknown`, with submitted refs retained in `runs` but no invented resolved OIDs.
- If a legacy check names a missing `first_run_id`, keep `corpus_contracts.source_run_id` null and preserve the dangling value only in quarantine payload; do not fabricate a run.
- Count and hash source/destination manifests for both `runs` and `corpus_checks` before finalization.
- Capture one `migration_started_at` and reuse it for every migration-created semantic row. Exclude backup path, ledger start/completion times, and other operational timestamps from semantic reproducibility hashes.

The source manifest is SHA-256 over ordered, length-prefixed raw values for: exact `sqlite_master`/PRAGMA schema fingerprint; every `runs` column including a byte hash of `report_json`; every `corpus_checks` column; and source cardinalities. The destination manifest accounts for every v2/archive object and asserts exact cardinalities/digests:

- `runs` count and every report byte hash equal source; `run_revisions` count and `run_completion_receipts` count equal source runs and `0`, respectively;
- `repository_families` and `repository_aliases` each equal the number of distinct exact repo strings in the table union, with every deterministic ID and locator digest included;
- `corpus_contracts` equals the number of distinct deterministic contract keys among valid-input legacy rows; every contract ID/input digest is included;
- `legacy_corpus_quarantine` equals source corpus rows exactly, every legacy ID appears once, valid-input rows have the expected non-null contract ID, malformed-input rows have null contract ID, and every payload digest is included;
- `baseline_versions`, `corpus_observations`, `authority_challenges`, `authority_receipts`, and `baseline_predecessors` each have exactly zero rows;
- `schema_meta` has exactly one clean v2 row; `migration_ledger` has exactly one matching completed semantic entry; operational timestamps/backup paths are excluded but versions/checksums/status are included;
- `corpus_checks_legacy_v1` equals source corpus rows byte-for-byte, the downgrade-barrier view returns zero rows, and the required view/trigger/index schema fingerprints are present.

Manifests use binary ordering and explicit NULL/type markers, never locale-dependent text conversion. Any unaccounted table, row, index, view, or trigger is a migration failure rather than an ignored extension.

### SQL/pseudocode

```text
1. Open SQLite with foreign_keys=ON and a busy timeout.
2. Read application_id, user_version, sqlite_master, table_info, index_list,
   foreign_key_list, and integrity_check without mutating.
3. If shape is not exact recognized v1a/v1b, refuse migration/corpus startup.
4. Create an SQLite online backup to a uniquely named sibling file; fsync it;
   compute and store the backup's full source manifest.
5. BEGIN IMMEDIATE.
6. Recompute the full source manifest inside the lock and require exact equality
   with the backup manifest. If it differs, rollback, discard that migration
   attempt, and take a new backup of the current source before retrying.
7. Create schema_meta/migration_ledger with migration_state='running'.
8. Create the new v2 tables with their final, noncolliding names. Keep the
   unchanged v1 `runs` table in place; v2 extends it through `run_revisions`.
9. For each distinct legacy repo ordered by binary value:
     create deterministic family and legacy alias.
10. For each legacy corpus row ordered by id:
      validate JSON without changing its stored value;
      if valid, create/dedupe the logical legacy contract;
      if invalid, leave quarantine.contract_id NULL;
      insert legacy_corpus_quarantine payload with explicit reasons;
      do not insert a grounded baseline version.
11. Leave `runs` byte-for-byte unchanged; create one legacy_unknown
    run_revisions row per legacy run without inventing resolved OIDs.
12. Verify source counts, destination counts, canonical manifest hashes,
    PRAGMA foreign_key_check, and PRAGMA integrity_check.
13. Rename only `corpus_checks` to `corpus_checks_legacy_v1`. The existing
    `runs` table remains canonical and the newly created v2 tables already have
    final names.
14. Add INSERT/UPDATE/DELETE abort triggers to `corpus_checks_legacy_v1`.
    Create a read-only view named `corpus_checks` exposing the v1a columns but
    deliberately omitting `evidence_hash`. SQLite's v1 `CREATE TABLE IF NOT
    EXISTS corpus_checks` no-ops when that name is a view; the supported current
    v1 initializer must then fail when its `ALTER TABLE corpus_checks ADD COLUMN
    evidence_hash` targets the view. Older v1 code that lacks that ALTER still
    cannot INSERT/UPDATE the view. Test the actual supported prior binary and a
    direct legacy pin, not an assumed SQLite error.
15. Record completed migration ledger, set schema_meta clean,
    PRAGMA application_id=<Cross-Examine constant>, PRAGMA user_version=2 last.
16. Compute and require the complete expected final destination manifest.
17. COMMIT; fsync database and directory as supported.
18. Reopen through the normal v2 validator and verify clean/version/checks again.
```

Any failure before commit rolls back. If post-commit reopen validation fails, refuse corpus reads/writes and point the operator to the untouched backup; do not attempt an automatic reverse migration. Keep `_legacy_v1` tables read-only until a later, separately reviewed cleanup release. Migration is idempotent: a clean v2 database is opened, not re-migrated; `running`/`failed` state refuses normal startup.

Operational restore is never performed over a live SQLite generation. Stop all processes, validate the backup, move the failed database plus its matching `-wal`/`-shm` files together into a recovery directory, restore through SQLite backup to a new temporary database, fsync, then atomically rename that database into place. Never combine a database file with WAL/SHM files from another generation. A product-level baseline rollback is a new signed version, not a database restore or row deletion.

### Migration failure behavior

| Condition | Behavior |
|---|---|
| recognized v1a/v1b, valid | backup, atomic deterministic migration, quarantine legacy corpus |
| schema version newer than supported | refuse writes and corpus startup; preserve file |
| unknown/partial schema at version 0 | refuse migration; preserve file |
| integrity/FK/count/hash check fails | rollback; preserve file and backup; report exact check |
| duplicate/colliding normalized aliases | keep exact legacy families separate; record conflict; no auto-merge |
| malformed input/expected JSON | preserve raw payload in quarantine with reason; never activate |
| missing referenced run | preserve quarantine payload; no FK claim to missing run |
| blank/invalid evidence hash | preserve as ungrounded; never backfill/activate |
| interrupted before commit | SQLite rollback; next open sees v1 or explicit non-clean state and fails safely |
| interrupted after commit | v2 validator accepts only exact clean version/checks; otherwise fail closed |
| supported v1 binary opens migrated v2 | compatibility-barrier view makes startup fail before any fresh v1 corpus can be created |

## API, codec, and UI implications

### Run/report contract

Extend `CorpusDelta` compatibly rather than reinterpret old fields:

```json
{
  "schema_version": 2,
  "pinned_this_run": 2,
  "corpus_total": 16,
  "created": 2,
  "effective_total": 16,
  "inherited": 14,
  "passed": 12,
  "stale_on_base": 0,
  "challenged_on_head": 1,
  "target_missing": 0,
  "incompatible": 0,
  "skipped": 1,
  "branch_conflicts": 0,
  "quarantined": 68,
  "identity_status": "proven",
  "lineage_relation": "forward",
  "messages": []
}
```

The codec is an explicit union. A corpus object without `schema_version` is v1: decode `created=pinned_this_run`, `effective_total=corpus_total`, all disposition counts as zero, identity/lineage as `legacy_unknown`, and add a legacy message. A v2 object requires `schema_version=2` and retains `pinned_this_run == created` plus `corpus_total == effective_total` for old clients; contradictory aliases are invalid. The serializer emits v2 for new runs. Historical `report_json` bytes and their hashes remain unchanged in storage; compatibility decoding happens at read time rather than rewriting old reports during promotion/migration.

### Endpoints

- `GET /api/corpus` returns family ID, sanitized display alias, contracts, effective-at-selected-head count, created count, stale-on-base/challenged-on-head/conflict/quarantine counts, identity status, and last observation.
- `GET /api/corpus/{family_id}/contracts` returns contract/version timelines, effective scopes, observations, and redacted authority receipts.
- `GET /api/runs/{id}` exposes lineage and per-run corpus disposition without changing verdict semantics.
- `POST /api/corpus/promotion-candidates/{id}/confirm` accepts only a complete externally signed approval over the one-use challenge; unsigned callers may create/view proposals but cannot activate them.
- `POST /api/corpus/contracts/{id}/rebind`, `/retire`, and `/resolve` use the same authority boundary.
- Family/alias merges are administrative and separate from behavioral promotion.

Responses:

- `403` missing, invalid, or revoked external authority signature, or an unauthorized key;
- `409` stale frontier/generation, reused challenge, concurrent action, or unresolved branch conflict;
- `422` evidence mismatch, wrong head/effective commit, non-forward run, incompatible policy, or ungrounded target;
- `503` ancestry/object lookup unknown when retry could recover objects.

### Product copy and interaction

- Replace “same repository” with “connected Git history.”
- Show “No connected ancestor; no evidence inherited” instead of a silent zero.
- Show “Baseline unchanged” after every mismatch/error.
- Show “Target missing—rebind or retire” for rename/deletion.
- Before promotion show old/new expected values, exact command/output, source/effective commits, affected descendant-only scope, actor, and required rationale.
- After promotion show the receipt and the message that the motivating report remains unchanged.
- Separate “created this run” from “observed/passed this run.”
- Quarantined legacy rows remain visible but are never counted as effective coverage.

## Threat cases and fail-closed rules

| Threat | Required response |
|---|---|
| URL normalization collision or spoofed `origin` | locator is hint only; require Git proof; ambiguous candidates block |
| path reused for unrelated repo | disconnected identity; new family/epoch; zero inheritance |
| fork sibling receives branch-only promotion | ancestry frontier excludes non-ancestor promotion |
| force-push/full rebase removes all known anchors | disconnected epoch; zero inheritance; no patch/tree heuristic |
| branch merge contains two different promoted expectations | branch conflict; preserve-critical abstention until authorized resolution |
| imported unrelated history connects families | do not auto-merge multiple candidate families; authority-domain merge required |
| replace refs/grafts alter reachability | use `--no-replace-objects`; reject shallow/unknown traversal |
| anchor object absent/pruned | applicability unknown/risk, not inapplicable/safe |
| SHA-1/SHA-256 mismatch | tagged comparison only; no cross-format bridge in v2 |
| symbol renamed/deleted | target missing; no invalidation; grounded authorized rebind/tombstone required |
| symbol name reused | exact binding alone cannot carry across disconnected anchor; no fuzzy inheritance |
| model marks intended change or omits claim | corpus-owned claim still runs; model classification has no authority |
| repeated new output | append repeated challenges; never auto-promote |
| forged/edited observation | recompute evidence and corpus-attestation hashes, verify completed-run linkage, and reject promotion |
| model calls promotion HTTP endpoint | endpoint may create a proposal only; activation requires an external allowlisted signature the model/worker/target cannot produce |
| challenge replay/concurrent promotions | unique consumed challenge + request hash + frontier CAS; one transaction |
| receipt row edited/deleted | hash chain verification and backup/export audit fail; corpus authority state becomes invalid/risky |
| pin committed before run | atomic run/corpus transaction or outbox; FK to completed grounded run |
| migration infers a legacy anchor | prohibited; quarantine by default |
| legacy evidence hash recomputed after the fact | retain as ungrounded; never describe as execution receipt |
| budget omits a critical contract | explicit skipped `UNVERIFIABLE`; verdict cannot be safe |
| incompatible runtime/policy | abstain/recapture; never refute or silently pass |
| baseline already differs on run base | `stale_on_base` critical abstention; never report it as a head regression |

## Implementation phases

### Phase 0 — freeze and characterize v1

- Add schema fingerprint fixtures for v1a, v1b, corrupt, partial, and newer databases.
- Add failing regression tests for contradictory expectations, locator split/repointing, and non-ancestor replay.
- Freeze v1 report codec fixtures and capture migration manifests.

Gate: all current Layer-A tests pass unchanged; new tests demonstrate the v1 hazards without modifying production outcomes.

### Phase 1 — grounded Git identity facts

- Extend ingest contracts with object format, full OIDs, shallow flag, and base/head relation receipts.
- Disable replacement objects for identity/ancestry commands.
- Persist `run_revisions`; keep aggregate pure.
- Block corpus use on shallow/unknown/non-forward runs as specified.

Gate: path/URL variants resolve the same commit facts; every Git exit code maps deterministically; non-ancestor/unknown can never yield corpus-derived safety.

### Phase 2 — v2 schema and deterministic migration

- Replace ad hoc `CREATE IF NOT EXISTS`/column ALTER with exact schema validation and versioned migration.
- Implement backup, transactional final-name table creation, manifest-checked quarantine, legacy-table archival/downgrade barrier, and clean reopen verification.
- Preserve v1 reports byte-for-byte.

Gate: independent migration-review checklist passes; golden v1a/v1b databases migrate identically twice; every injected interruption yields complete v1 or clean v2, never partial state.

### Phase 3 — contract/version/observation repository

- Introduce family resolution, aliases, logical contracts, immutable versions, observations, and Git frontier selection.
- Make corpus selection independent of model claims.
- Re-execute inherited expectations on base before head; persist stable fixture/version identity end-to-end.
- Pin initial versions at verified head; never auto-pin a mismatch.
- Commit run completion and corpus effects atomically.

Gate: Layer A runs end-to-end; clone/fork/branch/rebase matrix passes; duplicate observation never overwrites evidence; branch conflicts risk-abstain.

### Phase 4 — non-model lifecycle authority

- Add promotion candidates, isolated external operator/policy signing adapter, bound one-use challenges, signature allowlist/revocation, CAS, receipts, promotion, rebind, retirement, and conflict resolution.
- Verify the receipt chain on read/startup and surface invalid chains as risk.

Gate: all forged, replayed, stale, wrong-commit, non-forward, ungrounded, and model-originated promotion attempts fail with no state change; valid promotion affects descendants only.

### Phase 5 — API/UI/codec

- Version report corpus deltas and preserve v1 decoding.
- Add family/contract lifecycle reads and authorized mutation endpoints.
- Render identity, lineage, quarantine, challenge, conflict, and receipt scope explicitly.

Gate: API contract tests and frontend tests distinguish created/inherited/passed/stale-on-base/challenged-on-head; historical reports do not change after promotion; all mutation errors are actionable and fail closed.

### Phase 6 — Layer B integration and scale

- Only after Layer A is complete, feed v2 deterministic coverage counts to Layer B.
- Batch `cat-file`/ancestry checks and add bounded caching without changing tri-state semantics.

Gate: Layer A remains end-to-end green; corpus performance meets the chosen budget; optimization never changes selected frontier or verdict.

## Deterministic test matrix

| Area | Cases | Required result |
|---|---|---|
| Locator equivalence | absolute/relative/symlink/file URL/HTTPS/SSH/mirror with common objects | one proven family/effective frontier; aliases remain distinct receipts |
| Locator repoint | same path/URL, unrelated history | disconnected identity; no replay/pin/promotion |
| Forks | common ancestor, upstream descendant, sibling descendants | ancestor evidence shares; post-fork evidence never flows sideways |
| Rebase | anchor retained; all anchors rewritten | reachable versions only; otherwise disconnected/no inheritance |
| Run relation | base=head, base→head, head→base, siblings, unrelated, Git error | forward only enables corpus mutation/promotion; others risk/disable |
| Graph manipulation | replace ref, graft, shallow clone, missing/pruned anchor | real graph used or applicability unknown/risk |
| Hash format | SHA-1, SHA-256, mismatch, abbreviation | full tagged OIDs only; mismatch blocks |
| Frontier | one version, identical incomparable versions, conflicting incomparable versions | replay; coalesce; conflict/risk respectively |
| Intentional change | mismatch already on base; head-only mismatch; repeated mismatch; externally signed promotion; old branch; descendant; sibling | base-stale abstains; head-only refutes; no auto-change; new version scope is correct |
| Symbol lifecycle | rename, deletion, name reuse, authorized rebind, retirement | missing/risk; no auto-invalidation; audited actions only |
| Model boundary | omitted claim, intended-change label, promotion prose/tool request, forged actor string/local API request | corpus-owned enforcement unchanged; no authority without external signature |
| Evidence | exact receipt, blank hash, altered command/output/actual, duplicate pass | valid only; invalid blocks; duplicates append/retain history |
| Concurrency | two promotions, nonce replay, stale frontier, crash before/after commit | one winner/409; atomic state; idempotent retry |
| Migration | v1a, v1b, malformed JSON, missing run, duplicate expectation, alias collision, corrupt/partial/newer schema, same-count concurrent update, supported-v1 downgrade attempt | deterministic quarantine or startup refusal; exact manifest retry; old binary fails before writes; never speculative replay |
| Codec | v1 fixture, v2 round trip, unknown enum/version | safe defaults; lossless v2; invalid payload rejected |
| API/UI | identity warning, no ancestor, quarantine, challenge, conflict, promotion scope/receipt | explicit copy/status; no silent zero or misleading growth |
| Purity | import graph/static test for `aggregate()` | no IO/model/network/subprocess/database/framework import |

Required backend verification after implementation:

```text
uv run pytest
```

Add focused commands with captured expected results to the implementation plan, including corpus, ingest, API, codec, migration crash injection, and end-to-end Layer-A tests. A completion claim requires the exact commands and captured output, consistent with repository guidance.

## Deterministic completion gates

V2 is not complete until all statements below are mechanically demonstrated:

1. Expected output is absent from logical contract identity and present only in immutable versions.
2. Every selected baseline has a valid evidence receipt, tagged full OID, compatible policy, and proven ancestor relation to the run base.
3. `UNKNOWN` ancestry/applicability cannot enter the “not applicable” or safe path.
4. Equivalent repository locations with shared Git objects find the same evidence family without treating locator equality as proof.
5. Repointed/unrelated locations inherit zero evidence.
6. Fork descendants inherit ancestor versions; sibling forks do not inherit each other’s promotions.
7. Conflicting maximal versions abstain toward risk.
8. A mismatch, target failure, model output, repetition, or successful head execution cannot mutate/invalidate a baseline.
9. Promotion/rebind/retirement/conflict resolution requires an allowlisted external cryptographic signature inaccessible to the model/worker/target and writes a hash-bound receipt atomically.
10. Promotion affects future descendants only and never changes a historical report.
11. V1a/v1b rows are preserved and quarantined; no fabricated anchor/evidence receipt is activated.
12. Unknown/newer/partial/corrupt databases refuse corpus mutation without damaging the original file.
13. Run completion and corpus effects cannot diverge across a crash.
14. Corpus selection is independent of model claims and deterministic under a fixed Git graph/database.
15. Layer A passes end-to-end before Layer B reads v2 coverage.
16. `uv run pytest` passes with exact captured output before any backend commit.
17. Every inherited expectation matches the current base before a head mismatch may be classified as a regression.
18. Fixture-to-finding linkage uses stable contract/version/input identity, never claim/repro last-write-wins matching.

## Verification record

Five read-only subagent reviews were required and completed:

- Git identity/ancestry reviewed locator aliases, forks, rebases, non-ancestor graphs, object formats, shallow history, grafts, and replacement refs against primary Git documentation.
- Persistence/migration reviewed current SQLite shapes, deterministic quarantine, DDL, transaction order, rollback, and compatibility.
- Product semantics reviewed lifecycle states, non-model authority, rename/deletion behavior, API/UI copy, and least-surprise errors.
- Adversarial stale-evidence review forced base-before-head revalidation, stable execution identity, external cryptographic authority, compatibility binding, and crash/tamper gates.
- An independent migration reviewer initially rejected the draft, then passed the revised design after the downgrade barrier, complete manifests, malformed-row quarantine, atomic/idempotent completion unit of work, and head-frontier promotion CAS were corrected.

Local verification parsed the complete proposed DDL with SQLite and returned `PRAGMA foreign_key_check` with no rows plus `PRAGMA integrity_check = ok`. A separate SQLite probe confirmed `ALTER TABLE <view> ADD COLUMN ...` fails, which is the supported-v1 downgrade barrier the implementation must reproduce with the actual prior binary. No production files, databases, commits, or external state were changed.

## Primary Git references

- [`git merge-base`](https://git-scm.com/docs/git-merge-base): common-ancestor definition and `--is-ancestor` exit semantics.
- [`git rev-parse`](https://git-scm.com/docs/git-rev-parse): `^{commit}`, object-format reporting, shallow reporting, and repository path queries.
- [`git cat-file`](https://git-scm.com/docs/git-cat-file): object existence/type checks and batch modes.
- [`git diff`](https://git-scm.com/docs/git-diff): two-endpoint comparison semantics.
- [`git remote`](https://git-scm.com/docs/git-remote): remote URLs and expansion behavior.
- [`git clone`](https://git-scm.com/docs/git-clone): supported local/network locator forms and local clone object sharing.
- [`git replace`](https://git-scm.com/docs/git-replace): default replacement-object behavior and `--no-replace-objects`.
- [Git shallow repository documentation](https://git-scm.com/docs/shallow): shallow boundaries represented as pretend roots.
- [Git hash-function transition](https://git-scm.com/docs/hash-function-transition): object-format identities and transition constraints.

## Explicit non-goals for v2

- No universal URL canonicalizer or globally portable repository UUID.
- No patch-ID/tree/content bridge across disconnected rewrites.
- No model/fuzzy symbol rename inference with authority.
- No automatic intentional-change detection or promotion by repetition.
- No deletion of historical versions, observations, reports, or receipts.
- No cross-object-format ancestry mapping unless Git later provides and the project separately verifies a compatibility map.
- No Layer B extension before Layer A lifecycle behavior is complete.

These omissions are deliberate: each would make an unverifiable equivalence look authoritative. V2 shares evidence when Git can prove lineage and otherwise makes the gap visible.
