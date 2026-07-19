# P2 Deterministic Integrity Core Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make covered local integrity failures resolve deterministically to `RISKY` or `BROKEN`, never `SAFE`, before persistence or rendering.

**Architecture:** Strengthen existing stage outputs and the existing validation boundary. Pipeline coverage and aggregation fallback remain in `pipeline.py`; report semantics remain in `validation.py` and `codec.py`; exact-value admission remains in the child probe protocol.

**Tech Stack:** Python 3.12, dataclasses, pytest, existing offline hero fixture.

## Global Constraints

- Preserve the five stages and keep `aggregate()` free of IO/model/network/subprocess/database/framework imports.
- Deterministic code, not Claims or ProbePlans, decides outcomes and verdicts.
- Preserve scalar/list offline hero behavior and command/output receipts.
- Invalid or lossy evidence must not gain corpus authority or render as `SAFE`.
- No live model request or secret inspection.

---

### Task 1: Represent every observed preservation mismatch

**Files:**
- Modify: `tests/integration/test_layer_a.py`
- Modify: `tests/integration/test_probe_plan_relations.py`
- Modify: `src/cross_examine/cross_examine/layer_a.py`

**Consumes:** base/head probe envelopes and `Claim.kind`.
**Produces:** `Finding(outcome=Outcome.REFUTED)` for observed preservation mismatch; pure aggregate maps non-critical refutation to `RISKY`.

- [ ] Write failing tests:

```python
def test_noncritical_observed_base_head_mismatch_is_refuted() -> None:
    assert run_layer_a([noncritical_claim], [fixture], head, state)[0].outcome is Outcome.REFUTED

def test_noncritical_failed_probe_plan_relation_is_refuted() -> None:
    assert run_probe_plans([noncritical_claim], [plan], base, head, state)[0].outcome is Outcome.REFUTED
```

- [ ] Run `uv run pytest -q tests/integration/test_layer_a.py tests/integration/test_probe_plan_relations.py`; expect RED because mismatches are `UNVERIFIABLE`.
- [ ] Change the non-intended-change mismatch branches in both Layer A functions to `Outcome.REFUTED`; keep intended-change claims `UNVERIFIABLE`.
- [ ] Re-run the same command; expect GREEN.
- [ ] Commit: `git commit -m "fix: preserve observed mismatch authority"`.

### Task 2: Turn omitted touched symbols into critical coverage abstentions

**Files:**
- Modify: `tests/e2e/test_layer_a_pipeline.py`
- Modify: `src/cross_examine/pipeline.py`

**Consumes:** `IngestResult.touched_symbols` and `Claim.target_symbol`.
**Produces:** sorted deterministic `system:coverage:<sha256-prefix>` critical Claims and matching `UNVERIFIABLE` findings.

- [ ] Write failing test:

```python
def test_omitted_touched_symbol_becomes_critical_risky_coverage_finding(tmp_path: Path) -> None:
    report = pipeline_with_two_touched_symbols_and_one_claim(tmp_path).run(spec)
    finding = next(item for item in report.findings if item.claim_id.startswith("system:coverage:"))
    assert finding.outcome is Outcome.UNVERIFIABLE
    assert report.verdict is Verdict.RISKY
```

- [ ] Run `uv run pytest -q tests/e2e/test_layer_a_pipeline.py -k omitted`; expect RED.
- [ ] Implement `_coverage_abstentions(touched, claims)`: compare targets, sort missing symbols, derive stable IDs, emit critical synthetic Claim/Finding pairs, and append them immediately after Characterize.
- [ ] Ensure synthetic coverage fixtures are never captured, replayed, or pinned.
- [ ] Re-run `uv run pytest -q tests/e2e/test_layer_a_pipeline.py`; expect GREEN.
- [ ] Commit: `git commit -m "fix: abstain on omitted touched symbols"`.

### Task 3: Enforce report semantics on write and read

**Files:**
- Modify: `tests/unit/test_validation.py`
- Modify: `tests/unit/test_codec.py`
- Modify: `tests/integration/test_run_repository.py`
- Modify: `src/cross_examine/validation.py`
- Modify: `src/cross_examine/codec.py`

**Consumes:** a complete `Report`.
**Produces:** the same report only when IDs, linkage, grounding, and recomputed verdict are valid.

- [ ] Write failing tests for tampered verdict, duplicate Claim ID, non-pipeline `system:` Claim ID, unknown Finding claim ID, and `report_from_json()` read-time rejection.
- [ ] Run `uv run pytest -q tests/unit/test_validation.py tests/unit/test_codec.py tests/integration/test_run_repository.py`; expect RED.
- [ ] Implement `validate_report()` helpers that: reject empty/duplicate IDs; reserve `system:` for deterministic pipeline claims; require every Finding to reference exactly one Claim; retain receipt checks; compute `aggregate(report.findings, critical_ids)`; reject a stored verdict that differs.
- [ ] Make `report_from_json()` return `validate_report(report)` and preserve its public `ValueError("Invalid report payload")` wrapper.
- [ ] Re-run the same command; expect GREEN.
- [ ] Commit: `git commit -m "fix: validate report semantics on read and write"`.

### Task 4: Make aggregation failure a terminal abstention

**Files:**
- Modify: `tests/e2e/test_layer_a_pipeline.py`
- Modify: `src/cross_examine/pipeline.py`

**Consumes:** an exception from aggregation or semantic validation.
**Produces:** exactly one `system:aggregating` critical `UNVERIFIABLE` finding in a valid `RISKY` Report, with no corpus write.

- [ ] Write failing test that injects a decided finding without a receipt, runs the pipeline, and asserts one `system:aggregating` Finding, `RISKY`, and `corpus.total(repo) == 0`.
- [ ] Run `uv run pytest -q tests/e2e/test_layer_a_pipeline.py -k aggregating`; expect RED because current fallback revalidates invalid partial evidence.
- [ ] Add `_aggregation_failure_report()` that creates only a synthetic critical Claim/Finding pair and a direct `Verdict.RISKY` Report; call it only from the aggregation exception handler.
- [ ] Re-run `uv run pytest -q tests/e2e/test_layer_a_pipeline.py`; expect GREEN.
- [ ] Commit: `git commit -m "fix: terminate invalid aggregation as risky"`.

### Task 5: Reject lossy current values before comparison

**Files:**
- Modify: `tests/unit/test_probe_runner.py`
- Modify: `tests/integration/test_layer_a.py`
- Modify: `src/cross_examine/cross_examine/probe_runner.py`

**Consumes:** target annotations and returned Python values.
**Produces:** exact built-in JSON trees only; tuple, optional, named/subclass, and non-string-key paths are protocol-tagged abstentions.

- [ ] Write failing probe tests for a tuple annotation and an `int` subclass return, asserting `ok is False` and `probe_error is True`.
- [ ] Run `uv run pytest -q tests/unit/test_probe_runner.py tests/integration/test_layer_a.py`; expect RED because JSON erases the distinction.
- [ ] Add `_is_exact_json_value(value)` accepting only `None`, exact built-in bool/int/float/str, lists thereof, and string-keyed dicts thereof. Mark tuple and optional annotations unsupported. Reject non-exact return values before `json.dumps()` using the existing `UnserializableResult` envelope.
- [ ] Re-run the same command; expect GREEN with scalar/list paths retained.
- [ ] Commit: `git commit -m "fix: abstain on lossy probe values"`.

### Task 6: Verify and record P2 integrity-core evidence

**Files:**
- Modify: `docs/capability-status.md`
- Modify: `docs/research/autonomous-mission-ledger.md`

- [ ] Run focused gate:

```bash
uv run pytest -q tests/unit/test_schema.py tests/unit/test_validation.py tests/unit/test_codec.py tests/unit/test_probe_runner.py tests/integration/test_layer_a.py tests/integration/test_probe_plan_relations.py tests/integration/test_run_repository.py tests/e2e/test_layer_a_pipeline.py
```

Expected: all selected tests pass.

- [ ] Run `bash scripts/verify.sh`; expect Ruff, complete Python suite, frontend test/lint/build/static equality, Playwright, and fresh/repeat hero receipts to pass.
- [ ] Record exact output, closed local integrity gates, and remaining P2 strict artifact/replay/redaction/render-equality/G1 work. Do not mark P2 complete.
- [ ] Commit: `git commit -m "docs: record p2 integrity core evidence"`.

## Plan self-review

- Tasks 1-5 map one-to-one to the five P2 local integrity scenarios.
- Every implementation task has a focused RED command, minimal GREEN behavior, and a commit boundary.
- Synthetic IDs use existing Claim/Finding types; semantic validation derives critical IDs from Claims; probe rejection uses the existing protocol envelope.

