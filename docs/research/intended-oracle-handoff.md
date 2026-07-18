# Intended-change executable oracle handoff

## Superseding status — 2026-07-19

- **Historical source:** the original Phase 0 research is preserved verbatim at commit
  `5bea8baf5f031d9bfdff592b3e85e001842c651b`.
- **Applies-to snapshot:** this handoff describes the 2026-07-18 Phase 0 working-tree
  design/audit snapshot and declares no product implementation pin. It is distinct from
  current product commit `c3daef6d428aa775fae29b5f327c12dc6c2f3c4b`.
- **Current state:** the intended-change oracle adapter is `future`; intended-change
  approval authority is separately `blocked external`.
- **Dependency and authority gate:** P5 follows the P3 setup and P4 corpus contracts.
  Any deciding oracle also requires G2's authenticated, complete binding over the exact
  repository/head/claim/oracle/setup/expiry context; repository code, a model, and this
  design cannot grant that authority.
- **Current truth:** see the authoritative [capability status](../capability-status.md).
  The original prose below remains historical design evidence, not current
  implementation or authenticated approval.

Status: **recommended, fail closed; not blocked under an explicit operator trust root**.

This design can independently establish claim-to-oracle binding only when an authenticated operator (or an equivalent pre-existing trusted requirement authority) approves the exact claim and the complete executable oracle set. If a run has only model output, head-repository files, unscoped tests, or unkeyed hashes, that run is **BLOCKED from intended-change verification** and the claim remains critical `UNVERIFIABLE`, producing at least `RISKY`.

The guarantee is deliberately narrow: Cross-Examine can verify or refute **the independently approved claims in the report**. Without an independent requirement inventory and an approval over the full claim set, it cannot prove that Characterize found every intended behavior of the PR.

## Decision

Add a versioned, allowlisted `OracleBindingSetV1` at the Characterize → Cross-examine trust boundary. Characterize may emit opaque oracle candidates, but deterministic code must ignore those candidates when deciding which obligations exist. A trusted approval store supplies the complete, non-empty, conjunctive oracle set for an exact claim fingerprint, repository identity, and immutable head revision.

V1 should implement operator-approved, exact pytest leaf nodes first. The shared envelope also admits checked-in contract fixtures and harness-owned invariant identifiers, but neither a head fixture nor a registry entry independently binds itself to model prose. They still need an operator approval or a pre-existing trusted requirement binding.

The current five stages remain intact:

1. Ingest resolves canonical repository identity plus full base/head commit and tree IDs.
2. Characterize proposes bounded claims and optional opaque oracle IDs.
3. Cross-examine runs Layer A first, executes approved intended oracles from fresh head snapshots, then optionally runs Layer B and the existing broad repository-test gate.
4. Aggregate remains the existing pure `aggregate(findings, critical_claim_ids)` call.
5. Render exposes the exact authorization, resolution, execution, command, and captured output.

Layer A continues to work end-to-end before any Layer B extension. General repository tests remain attached only to `system:head-tests`; they never cover an intended-change claim.

## Discovery: why intended changes abstain today

The current path is sound and intentionally incomplete:

- `ClaimPayload` lets the model propose `kind`, target, prose, and `proposed_check`, but not findings or verdicts.
- `Characterizer` rejects unknown targets, duplicate IDs, empty checks, claim floods, and `intended_change` claims marked `preserve_critical`.
- `Pipeline._critical_claim_ids()` treats every `ClaimKind.INTENDED_CHANGE` as critical.
- `run_layer_a()` forces every intended-change replay to `UNVERIFIABLE`, explicitly stating that preservation evidence cannot verify an intended change.
- Layer B currently runs only `preserve_critical` claims.
- Discovered `pytest -q` commands produce findings for the synthetic preservation claim `system:head-tests`, not for model-authored intended-change claims.
- `aggregate()` therefore sees an uncovered or `UNVERIFIABLE` critical intended claim and returns `RISKY`.

This must not be repaired by relabeling base/head difference, repository-wide test success, probe-plan provenance, model confidence, or `proposed_check` prose as an oracle.

## Designs considered

| Reference design | Independent semantics | Main strength | Main weakness | Decision |
| --- | --- | --- | --- | --- |
| Operator-approved pytest leaf | The operator approves the exact claim, node, source blob, execution profile, and head tree | Lowest integration cost; reuses pytest and the bounded runner | A passing test may be vacuous, mocked, or narrower than the prose | **V1 first**, under a deliberately hermetic profile |
| Checked-in contract fixture | Canonical inputs and expected envelopes are explicit | Strong, transparent input/output oracle; reuses the probe protocol | A fixture added or changed in head is self-authored, not independent | Add after V1; accept only trusted-base/external bytes or explicit operator approval |
| Harness invariant ID | Versioned verifier-owned code defines the predicate | Smallest attack surface; no free command or expected prose | Limited vocabulary; a generic invariant may be too weak | Add last as a small registry, always with independent claim binding |

All three use the same authorization, set-completeness, resolution, evidence, and failure semantics. V1 has no arbitrary command oracle, shell oracle, network oracle, glob, `-k` expression, test path prefix, mutable URL, or model-supplied expected value.

## Exact proposed contract

These are design-level Python shapes. Security-critical decoders must reject unknown fields and type coercion.

```python
JSONValue = None | bool | int | float | str | list["JSONValue"] | dict[str, "JSONValue"]


class OracleKind(str, Enum):
    PYTEST_NODE_V1 = "pytest_node_v1"
    CONTRACT_FIXTURE_V1 = "contract_fixture_v1"
    INVARIANT_V1 = "invariant_v1"


class AuthorizationSource(str, Enum):
    OPERATOR_SESSION = "operator_session"
    OPERATOR_POLICY = "operator_policy"
    TRUSTED_REQUIREMENT_REGISTRY = "trusted_requirement_registry"


class OracleResolution(str, Enum):
    RESOLVED = "resolved"
    MISSING_BINDING = "missing_binding"
    INVALID_BINDING = "invalid_binding"
    UNAUTHORIZED = "unauthorized"
    STALE_REVISION = "stale_revision"
    DEFINITION_MISMATCH = "definition_mismatch"
    COLLECTION_MISMATCH = "collection_mismatch"
    EXECUTION_ABSTAINED = "execution_abstained"


class OracleResult(str, Enum):
    SATISFIED = "satisfied"
    MISMATCH = "mismatch"
    INDETERMINATE = "indeterminate"


@dataclass(frozen=True)
class OracleCandidateV1:
    # Model-owned hint only. It grants no authority and creates no obligation.
    oracle_id: str


@dataclass
class Claim:
    # Existing fields unchanged.
    proposed_oracle_ids: list[str] = field(default_factory=list)


@dataclass(frozen=True)
class ClaimBindingV1:
    claim_id: str
    claim_fingerprint: str
    claim_kind: Literal["intended_change"]
    target_symbol: str
    repo_identity: str
    base_sha: str
    head_sha: str
    head_tree_sha: str


@dataclass(frozen=True)
class PytestNodeOracleV1:
    kind: Literal["pytest_node_v1"]
    oracle_id: str
    node_id: str                 # One exact concrete leaf, including [param-id].
    test_blob_sha256: str
    execution_profile_id: Literal["pytest-node-hermetic-v1"]


@dataclass(frozen=True)
class ContractFixtureOracleV1:
    kind: Literal["contract_fixture_v1"]
    oracle_id: str
    source: Literal["trusted_base", "operator_artifact", "trusted_registry"]
    source_identity: str         # Base commit, approval artifact ID, or registry release.
    fixture_path: str
    fixture_sha256: str
    adapter_id: str              # Exact allowlisted harness adapter and version.
    target_symbol: str


@dataclass(frozen=True)
class InvariantOracleV1:
    kind: Literal["invariant_v1"]
    oracle_id: str
    invariant_id: str
    invariant_version: int
    registry_release_digest: str
    parameters: JSONValue
    parameters_digest: str
    target_symbol: str


OracleDefinitionV1 = (
    PytestNodeOracleV1 | ContractFixtureOracleV1 | InvariantOracleV1
)


@dataclass(frozen=True)
class ApprovalProvenanceV1:
    source: AuthorizationSource
    source_id: str
    actor: str
    approved_at: str             # Strict RFC 3339 UTC; audit metadata.
    authority_receipt: str       # Trusted-store receipt or verified signature/MAC.


@dataclass(frozen=True)
class OracleBindingSetV1:
    version: Literal[1]
    binding_set_id: str
    claim: ClaimBindingV1
    mode: Literal["all"]         # V1 is conjunctive only.
    definitions: tuple[OracleDefinitionV1, ...]  # Sorted, unique, non-empty.
    definition_set_digest: str
    approval_statement: Literal[
        "The complete listed oracle set is the normative and sufficient "
        "executable definition of this exact claim for this repository and revision."
    ]
    provenance: ApprovalProvenanceV1
    approval_digest: str
```

The trusted control plane looks up `OracleBindingSetV1` by `(repo_identity, head_sha, claim_fingerprint)`. It must not enumerate `Claim.proposed_oracle_ids`. Candidates may help an operator find a test, but they can neither add nor remove obligations. This prevents the model from omitting a failing approved oracle or adding garbage candidates to force or suppress a verdict.

V1 may initially enforce exactly one definition per set for product simplicity. The schema still makes the complete-set and `all` semantics explicit so later multi-oracle support cannot accidentally become “any pass wins.”

### Canonical identities

```python
claim_fingerprint = sha256(
    b"cross-examine-intended-claim-v1\0" + canonical_json_bytes({
        "id": claim.id,
        "text": claim.text,
        "target_symbol": claim.target_symbol,
        "risk": claim.risk,
        "proposed_check": claim.proposed_check,
        "preserve_critical": claim.preserve_critical,
        "kind": claim.kind.value,
    })
)

definition_set_digest = sha256(
    b"cross-examine-oracle-definition-set-v1\0" +
    canonical_json_bytes(sorted(definitions, key=lambda item: item.oracle_id))
)

approval_digest = sha256(
    b"cross-examine-oracle-approval-v1\0" +
    canonical_json_bytes(binding_without_approval_digest_or_authority_receipt)
)
```

`canonical_json_bytes` uses UTF-8, sorted keys, no insignificant whitespace, no duplicate keys, finite JSON numbers only, and a single documented Unicode policy. Plain SHA-256 digests identify content but do not authenticate it. Authority comes from trusted-store membership or a signature/MAC verified with a key unavailable to the model and target repository.

Claim IDs use `[a-z0-9][a-z0-9._-]{0,63}`; `system:` is reserved. IDs, node IDs, and approval strings reject control characters, bidirectional controls, surrogates, and non-canonical encodings. The UI escapes untrusted text and never derives status from strings such as `AUTHORIZED`, `SAFE`, or `[evidence source: ...]`.

### Report evidence

```python
@dataclass(frozen=True)
class RevisionIdentityV1:
    commit_sha: str
    tree_sha: str
    pre_execution_state_digest: str
    post_execution_state_digest: str
    clean_before: bool
    clean_after: bool


@dataclass(frozen=True)
class OracleExecutionEvidenceV1:
    oracle_id: str
    oracle_kind: OracleKind
    definition_digest: str
    resolution: OracleResolution
    result: OracleResult
    reason_code: str
    approved_identity: str       # Exact node, fixture, or invariant ID.
    observed_identity: str | None
    approved_content_digest: str
    observed_content_digest: str | None
    canonical_argv: tuple[str, ...]
    revision: RevisionIdentityV1 | None
    manifest: ExecutionManifest | None
    receipts: tuple[EvidenceReceipt, ...]
    collected_node_ids: tuple[str, ...] = ()
    collected_count: int = 0
    executed_count: int = 0
    call_outcome: str | None = None
    exit_code: int | None = None
    timed_out: bool = False
    output_truncated: bool = False


@dataclass(frozen=True)
class IntendedOracleEvidenceV1:
    version: Literal[1]
    claim_fingerprint: str
    binding_set_id: str | None
    definition_set_digest: str | None
    approval_source: AuthorizationSource | None
    approval_source_id: str | None
    approval_digest: str | None
    executions: tuple[OracleExecutionEvidenceV1, ...]


@dataclass
class Finding:
    # Existing fields unchanged.
    oracle_evidence: IntendedOracleEvidenceV1 | None = None


@dataclass
class Report:
    # Existing fields unchanged.
    contract_version: int = 2
    repo_identity: str | None = None
    base_sha: str | None = None
    head_sha: str | None = None
```

Every intended-change claim gets at least one finding. Missing or rejected authorization produces an `UNVERIFIABLE` finding with `IntendedOracleEvidenceV1` and a machine-readable reason. `VERIFIED` and `REFUTED` require a fully resolved binding and execution evidence. The report persists the exact command and captured output in the existing `Finding.command`, `Finding.output`, and `EvidenceReceipt` fields; the UI must not replace those with a friendly summary.

The current `CwdIdentity.digest` hashes the path string, not tree contents. It must remain path identity only; `RevisionIdentityV1` supplies actual revision and pre/post state evidence. The current receipt hash is also integrity-only, not proof that `execution.py` produced it. A later authenticated/append-only execution receipt can strengthen provenance without changing aggregation semantics.

## Allowed provenance

### Allowed in V1

1. **Operator session approval** created after Characterize. The trusted UI displays the exact canonical claim, complete oracle set, target, repository identity, full base/head/tree SHAs, definition digests, and execution profile. Approval explicitly attests semantic sufficiency and set completeness.
2. **Operator policy approval** stored outside both target worktrees and authenticated by the trusted control plane. It binds the same exact fields and may include expiry/revocation policy.

### Eligible later, but not self-authorizing

3. **Trusted requirement registry** whose immutable entry predates or is external to the change and already binds a requirement ID, target, definition set, and version. A harness invariant supplies executable semantics, but it does not prove that it matches a new model claim without this binding or operator approval.
4. **Trusted-base contract fixture** whose bytes are pinned to base. It supplies expected behavior, but it must already be linked to an independent requirement or be separately approved for the exact claim.

### Always rejected as authority

- Model prose, `proposed_check`, confidence, priority, candidates, or probe-plan `provenance`.
- Diff/source comments, docstrings, PR descriptions, commit messages, test names, markers, or filenames containing “approved.”
- Head-added or head-modified manifests, fixtures, tests, or signatures without external approval.
- A repository-wide pytest pass, inferred test discovery, base/head equality, or base/head difference.
- Mutable URLs, floating branches, abbreviated SHAs, self-asserted `actor` fields, or plain attacker-supplied hashes.
- Repository stdout claiming that a test passed or that an oracle is authorized.

## Resolution and execution algorithm

```python
def resolve_and_run_intended_claim(claim, ingest, trusted_store, deadline):
    assert claim.kind is ClaimKind.INTENDED_CHANGE
    fingerprint = intended_claim_fingerprint(claim)

    matches = trusted_store.lookup_exact(
        repo_identity=ingest.repo_identity,
        head_sha=ingest.head_sha,
        claim_fingerprint=fingerprint,
    )
    if len(matches) != 1:
        return [unverifiable_oracle_finding(
            claim, fingerprint,
            "missing_binding" if not matches else "ambiguous_binding",
        )]

    binding = strict_decode(matches[0])
    try:
        require(binding.version == 1)
        require(binding.claim.claim_id == claim.id)
        require(binding.claim.claim_kind == "intended_change")
        require(binding.claim.target_symbol == claim.target_symbol)
        require(binding.claim.repo_identity == ingest.repo_identity)
        require(binding.claim.base_sha == ingest.base_sha)
        require(binding.claim.head_sha == ingest.head_sha)
        require(binding.claim.head_tree_sha == ingest.head_tree_sha)
        require(binding.claim.claim_fingerprint == fingerprint)
        require(binding.mode == "all")
        require_unique_nonempty_sorted_definitions(binding.definitions)
        require(definition_set_digest(binding.definitions)
                == binding.definition_set_digest)
        require(valid_approval_statement(binding.approval_statement))
        require(trusted_store.authenticates(binding.provenance, binding))
        require(approval_digest(binding) == binding.approval_digest)
    except ContractError as exc:
        return [unverifiable_oracle_finding(claim, fingerprint, exc.reason)]

    findings = []
    for definition in binding.definitions:  # never model candidates
        resolution = resolve_allowlisted_definition(definition, ingest)
        if resolution.invalid:
            findings.append(unverifiable_with_resolution(claim, binding, resolution))
            continue

        execution = execute_from_fresh_head_snapshot(
            resolution,
            execution_profile=definition.execution_profile_id,
            deadline=deadline,
        )
        if execution.is_satisfied:
            outcome = Outcome.VERIFIED
        elif execution.is_definitive_mismatch:
            outcome = Outcome.REFUTED
        else:
            outcome = Outcome.UNVERIFIABLE
        findings.append(finding_from_execution(claim, binding, execution, outcome))

    # Exactly one terminal finding per approved oracle. Missing, duplicate, or
    # extra results become an additional critical UNVERIFIABLE finding.
    return enforce_complete_conjunctive_result_set(claim, binding, findings)
```

Existing aggregation then gives the intended worst-case result:

- every approved oracle `VERIFIED` → the intended claim is covered;
- any approved oracle invalid, missing, stale, or indeterminate → critical `UNVERIFIABLE` → at least `RISKY`;
- any approved oracle definitively `REFUTED` → critical refutation → `BROKEN`, even if another oracle abstains;
- broad repository tests pass → no effect on intended-claim coverage;
- no approved binding → critical `UNVERIFIABLE` → `RISKY`.

### Pytest-node profile

V1 accepts one exact concrete collected leaf. It rejects path prefixes, whole files, functions that expand to multiple parametrized leaves, globs, `-k`, arbitrary flags, absolute paths, `..`, symlinks, whitespace/control characters, leading `-`, and paths outside approved test roots. Exotic parametrized node IDs should be rejected in V1 rather than weakly normalized.

The parent constructs argv; neither model nor approval supplies command fragments:

```python
argv = [
    sys.executable,
    "-m", "pytest",
    "-q",
    "-p", "no:cacheprovider",
    "-p", "cross_examine.oracle_pytest_plugin",
    "-c", trusted_empty_pytest_config,
    "--noconftest",
    approved_exact_node_id,
]
```

The oracle policy disables plugin autoload, ambient `PYTEST_*`, ambient `PYTHONPATH`, bytecode writes, network-dependent oracle kinds, and repository pytest configuration. If the approved test requires `conftest.py` or non-harness plugins, V1 returns `UNVERIFIABLE`; a future profile would have to bind every allowed config, conftest, plugin distribution, and dependency identity.

Execution occurs from a fresh snapshot pinned to the approved head commit/tree, separate from the mutable Layer A/B worktrees. Before execution, deterministic code checks the exact commit/tree, a clean working state, a regular non-symlink test file under the snapshot, the test blob digest, target tree, interpreter identity, environment policy, and runner profile. It checks state again after execution; mutation or identity drift abstains.

A trusted harness plugin reports the actual collected `Item` and terminal phases through a parent-owned structured channel where practical. Human stdout is evidence, not the decision protocol. Under the present trusted-input host adapter, target Python code shares process/filesystem authority and no in-process protocol is cryptographic attestation; hostile-code resistance requires an isolated, read-only, network-denied executor. This design does not expand that threat model.

Decision table for one exact leaf:

- exactly one collected and executed call-phase `passed`, normal session finish, exit `0`, matching identities, no timeout/truncation → `VERIFIED`;
- exactly one call-phase assertion failure or explicit `pytest.fail`, with all identities intact → `REFUTED`;
- skip, xfail, xpass, deselection, zero/multiple collection, setup/teardown error, import/dependency error, non-assertion exception, plugin/protocol error, unexpected exit, timeout, truncation, mutation, missing receipt/manifest, or identity mismatch → `UNVERIFIABLE`.

Base execution is optional diagnostic evidence only. A base fail/head pass transition is never used to decide intended correctness.

### Fixture and invariant profiles

Fixture bytes must validate against an allowlisted adapter-owned JSON schema. The adapter executes the exact target on the exact head snapshot and emits a tagged envelope containing oracle ID, adapter/version, head SHA/tree, input/fixture digest, `satisfied | mismatch | indeterminate`, expected, and actual. Only `satisfied` verifies and only a deterministic canonical mismatch refutes.

Invariant IDs resolve by exact `(registry_release_digest, invariant_id, invariant_version)`. No tag, similarity, or fallback lookup is allowed. Registry code owns the parameter schema, eligible target shapes, predicate, canonicalization, and finite-domain disclosure. The UI must not present a finite invariant as universal proof beyond the operator-approved normative claim.

## Validation pseudocode

`validate_report()` remains deterministic and may call pure helpers, including `aggregate()`. It must not load approval stores, execute code, access the network, or import the model.

```python
def validate_report(report):
    require(report.contract_version in {1, 2})
    claims = require_unique_claim_ids(report.claims)
    require_all_findings_reference_unique_known_claims(report.findings, claims)

    if report.contract_version == 2:
        require_full_repo_and_revision_identity(report)

    for finding in report.findings:
        claim = claims[finding.claim_id]
        validate_existing_command_output_and_receipts(finding)

        if claim.kind is not ClaimKind.INTENDED_CHANGE:
            require(finding.oracle_evidence is None)
            continue

        if finding.outcome in {Outcome.VERIFIED, Outcome.REFUTED}:
            require(report.contract_version == 2)
            evidence = require_oracle_evidence(finding)
            require(evidence.claim_fingerprint == intended_claim_fingerprint(claim))
            require(evidence.binding_set_id and evidence.definition_set_digest)
            require(evidence.approval_source and evidence.approval_digest)
            require_exactly_one_execution_for_this_finding(evidence)
            execution = evidence.executions[0]
            require(execution.resolution is OracleResolution.RESOLVED)
            require(execution.result == (
                OracleResult.SATISFIED
                if finding.outcome is Outcome.VERIFIED
                else OracleResult.MISMATCH
            ))
            require(execution.revision.commit_sha == report.head_sha)
            require(execution.revision.tree_sha == approved_head_tree(evidence))
            require(execution.revision.clean_before and execution.revision.clean_after)
            require(execution.approved_identity == execution.observed_identity)
            require(execution.approved_content_digest
                    == execution.observed_content_digest)
            require_manifest_matches_argv_revision_policy_and_receipts(execution)
            require_receipts_exactly_match_displayed_command_and_output(finding)
        else:
            require_machine_readable_abstention_reason(finding)

    require_complete_oracle_result_sets(report.findings)
    expected_verdict = aggregate(report.findings, critical_claim_ids(report.claims))
    require(report.verdict is expected_verdict)
    return report
```

This closes a current gap: report validation does not recompute the verdict, so a tampered persisted report could otherwise pair critical abstention with `SAFE`. It also replaces substring evidence relationships with exact structured relationships for V2 oracle findings.

## UI evidence and approval requirements

The approval screen must show, without truncation or model-generated summaries:

- exact escaped claim ID, full text, kind, target, `proposed_check`, and claim fingerprint;
- canonical repository identity, full base/head commit IDs, and head tree ID;
- the complete oracle set, `mode=all`, set cardinality, exact node/fixture/invariant definitions, source/registry versions, and definition digests;
- for pytest, exact test source/blob digest and the hermetic execution profile limitations;
- an explicit statement that approval attests semantic sufficiency and completeness for this exact claim;
- if global completeness is claimed, the independently supplied requirement inventory and claim-set digest.

The evidence panel must show:

- approval source, actor, time, source/store receipt, binding-set ID, approval digest, and current/stale status;
- approved versus observed head/tree/content identities;
- exact canonical argv, CWD/path identity, revision identity, runner/policy/executable/runtime/dependency identities;
- collection count, executed count, exact collected node, phase outcome, skip/xfail/error counts;
- timeout, truncation, exit code, structured expected/actual, every receipt hash;
- **Exact command** and **Captured output** for every execution;
- a prominent `Operator-authorized oracle`, `Missing/invalid authorization`, or `Legacy/unvalidated` label.

The report reduces each claim visually with the same worst-case rule as aggregation. A verified row must not bury an abstention for another member of the same set. Candidates are labeled `Model proposal — not authorized` and are never styled as evidence.

## Migration and implementation order

1. **Freeze abstention behavior.** Add characterization, Layer A, Layer B, pipeline, and aggregation tests proving that intended claims without authorization remain critical `UNVERIFIABLE/RISKY`; broad tests and base/head differences never cover them.
2. **Add pure identity and strict contract types.** Create a focused oracle-contract module for canonical JSON, fingerprints, discriminated definitions, set digests, and strict decoding. Keep `aggregate()` unchanged and free of IO/model/framework imports.
3. **Add the two-phase control-plane boundary.** After Characterize, persist a frozen claim challenge and pause the run in an approval state. Store approvals outside target worktrees, keyed by repo/head/fingerprint. Resume only from trusted-store membership or verified signature. Preserve the five conceptual stages.
4. **Implement the hermetic pytest-node adapter.** Use exact leaf collection/execution, parent-built argv, fresh head snapshots, fixed config, no conftest/plugins, sanitized environment, structured outcomes, shared monotonic deadline, output cap, and pre/post revision checks. Run it after Layer A and before optional Layer B.
5. **Add V2 evidence, codec, persistence, and validation.** Persist manifests and typed oracle evidence; recompute verdicts and exact evidence relationships on write and read. Add `contract_version=2`; decode absent version as legacy V1 but never manufacture oracle proof or reinterpret historical outcomes. Quarantine invalid/tampered persisted reports.
6. **Add API and UI approval/evidence surfaces.** Pending approvals live in a separate trusted table/store, not Characterize payloads or unconsumed report JSON. Add typed API response models. Add optional TypeScript fields during rollout, then make V2 intended evidence required for decided intended claims.
7. **Add contract fixtures.** Reuse the probe protocol only with strict adapter-owned schemas and trusted bytes/approval provenance.
8. **Add a small invariant registry.** Ship versioned implementation/definition digests and parameter schemas; no dynamic plugins or similarity lookup.
9. **Add isolation as a production hardening track.** Read-only disposable filesystem, network denial, dependency identity, resource quotas, and an out-of-process evidence channel strengthen TOCTOU/provenance without changing the report or aggregate contracts.

The existing report JSON column permits an additive report migration. Pending approvals that must survive restart need their own trusted persistence; they must not be sourced from the target repository or the model. Current manual codec behavior (`bool("false")`, ignored unknown fields) is unsuitable for security-critical V2 structures and must be replaced with strict variant decoders.

## Acceptance test matrix

| Area | Case | Required result |
| --- | --- | --- |
| Baseline | Intended claim, no trusted binding | Critical `UNVERIFIABLE`; verdict `RISKY` |
| Baseline | Equal or different base/head output, no binding | Never `VERIFIED`/`REFUTED` for intended correctness |
| Baseline | Broad suite passes, intended binding missing | `system:head-tests` may verify; intended claim remains `UNVERIFIABLE/RISKY` |
| Authority | Model proposes a real passing node, no approval | `UNVERIFIABLE` |
| Authority | Head adds an “approved” manifest/fixture | `UNVERIFIABLE` absent external approval |
| Authority | Approval means executable-only, not sufficient/normative | Reject approval; `UNVERIFIABLE` |
| Authority | Wrong repo/base/head/tree/claim/kind/target/fingerprint | Reject; `UNVERIFIABLE` |
| Authority | Missing, duplicate, ambiguous, expired, revoked, or forged store/signature record | Reject; `UNVERIFIABLE` |
| Authority | Model omits one member of approved set | Execute the complete trusted set anyway |
| Authority | Model adds candidates outside approved set | Display as proposals; do not execute or count them |
| Set semantics | All approved members pass | Intended claim covered by `VERIFIED` findings |
| Set semantics | Pass plus invalid/unresolved member | `RISKY` |
| Set semantics | Refutation plus invalid/unresolved member | `BROKEN` |
| Set semantics | Missing, duplicate, or extra terminal result | Additional critical `UNVERIFIABLE` |
| Pytest | Exact approved leaf collects once, executes once, call passes | `VERIFIED` with exact command/output |
| Pytest | Exact approved leaf has assertion/`pytest.fail` mismatch | `REFUTED` with exact command/output |
| Pytest | Node expands to multiple parameters | `UNVERIFIABLE` |
| Pytest | Separately approved exact `[param-id]` leaf | Eligible when exactly one leaf executes |
| Pytest | Skip, xfail, xpass, deselect, zero collection | `UNVERIFIABLE`, regardless of exit code |
| Pytest | Setup/teardown/import/dependency/plugin/protocol error or non-assertion exception | `UNVERIFIABLE` |
| Pytest | Path prefix, `-k`, flag, glob, absolute/traversal/control/symlink node | Reject before execution; `UNVERIFIABLE` |
| Pytest | Ambient addopts/plugin/PYTHONPATH tries to alter selection | Ignored by profile or `UNVERIFIABLE` |
| Pytest | Repository test requires conftest/plugin in V1 | `UNVERIFIABLE`; never silently widen profile |
| Revision | Earlier Layer A/B code mutates its worktree | Oracle uses a fresh head snapshot |
| Revision | Approved test/target/config changes after approval | Digest/tree mismatch; `UNVERIFIABLE` |
| Revision | Oracle mutates snapshot during run | Post-state mismatch; `UNVERIFIABLE` |
| Runner | Timeout, total-deadline exhaustion, truncation, cleanup fallback | `UNVERIFIABLE` |
| Runner | Forged “1 passed” or tagged JSON in stdout | Cannot decide without trusted structured result |
| Runner | Receipt/manifest from another argv/CWD/revision/policy | Validation rejects report |
| Fixture | Trusted/approved canonical fixture matches head | `VERIFIED` |
| Fixture | Deterministic canonical mismatch | `REFUTED` |
| Fixture | Head-only, changed, malformed, unknown adapter, or indeterminate | `UNVERIFIABLE` |
| Invariant | Exact registry/version/parameters satisfy predicate | `VERIFIED` |
| Invariant | Deterministic counterexample | `REFUTED` |
| Invariant | Unknown/downgraded version, invalid parameters, finite-domain ambiguity | `UNVERIFIABLE` |
| Prompt injection | Diff/source requests approval, verdict, command, or provenance | May affect candidate only; no authority; `UNVERIFIABLE` without approval |
| Prompt injection | Reserved/control/bidi/overlong/confusable claim ID | Schema rejects it |
| Completeness | Approved requirement has no matching characterized claim | Synthetic critical `UNVERIFIABLE` |
| Completeness | No independent requirement inventory | UI/report says “approved claims,” not “all PR intent” |
| Codec | V2 round-trip preserves all exact fields and enums | Equal report; strict validation passes |
| Codec | Unknown fields, duplicate keys/IDs, string booleans/numbers, wrong union discriminator | Decode rejects |
| Codec | Legacy report has decided intended claim without V2 evidence | Reject or downgrade to `UNVERIFIABLE`; never accept as proof |
| Persistence | Tampered verdict paired with critical abstention | Read validation recomputes and quarantines |
| Purity | Oracle modules unavailable while importing/running `aggregate()` | Pure decision tests still pass |

## Attacks, residual risk, and stop condition

The main false-verification attacks are: unrelated passing-test reuse, approval replay, model omission of a failing oracle, head self-authorization, vacuous or mocked tests, pytest hook/config manipulation, skip/xfail interpreted as success, fake stdout protocols, mutable-worktree TOCTOU, dependency substitution, weak invariant downgrade, fixture co-change, permissive codec coercion, tampered persisted verdicts, misleading UI reduction, and incomplete model claim sets. The controls above either bind and authenticate the relevant identity or abstain.

Three limits remain fundamental:

1. Automated code cannot prove that a finite oracle semantically entails arbitrary natural-language prose. The operator (or trusted requirement authority) is the semantic trust root and must attest normative sufficiency.
2. Model-generated claims cannot prove completeness relative to unstated product intent. Global completeness requires an independent requirement inventory and approved claim-set digest.
3. The current host-process adapter assumes trusted target code. A deliberately malicious head can detect finite inputs and tamper with mutable host state. Strong hostile-code evidence requires isolation; this contract does not call the current adapter a sandbox.

Therefore the design is **not blocked** for the scoped goal of deciding exact, independently approved intended-change claims in trusted Python repositories. A specific claim is **BLOCKED from verification** whenever its exact claim-to-complete-oracle binding cannot be authenticated; deterministic resolution must emit critical `UNVERIFIABLE`, and aggregation must resolve toward `RISKY`, never safety.
