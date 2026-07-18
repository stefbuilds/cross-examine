# Autonomous Mission Phase 0 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish a reviewable, immutable Phase 0 audit baseline, mission ledger, and evidence-gated design on an isolated `codex/` branch.

**Architecture:** Phase 0 is documentation-only and does not change runtime behavior. It inventories the existing five-stage pipeline, preserves all pre-existing research and product-audit artifacts, records exact verification evidence, and creates the dependency/status ledger that every later phase updates.

**Tech Stack:** Git, Markdown, Python 3.12, uv, pytest, Ruff, React/Vite repository metadata.

## Global Constraints

- Preserve Ingest → Characterize → Cross-examine → Aggregate → Render.
- A verified or refuted finding must retain exact command, captured output, and validated provenance.
- Model output proposes schema-constrained claims only; deterministic code owns outcomes and verdicts.
- `aggregate()` remains pure and imports no IO, model, network, subprocess, database, or framework code.
- Unverifiable preserve-critical behavior resolves toward risk, never safety.
- Layer A works end to end before the matching Layer B extension.
- Build Week targets Python repositories only.
- Preserve existing user changes; do not reset, overwrite, or force-push.
- Run `uv run pytest` before every backend commit.

---

## File map

- Create `docs/research/autonomous-mission-ledger.md`: living phase/objective/dependency/evidence/decision/risk register.
- Create `docs/superpowers/specs/2026-07-18-autonomous-build-week-mission-design.md`: approved mission architecture and boundaries.
- Create `docs/superpowers/plans/2026-07-18-autonomous-mission-phase-0.md`: this executable Phase 0 plan.
- Preserve and add `docs/research/*-handoff.md`: source research for later phase contracts.
- Preserve and add `artifacts/product-audit-2026-07-18/`: screenshot-led UX evidence and its limitations.
- Preserve `docs/submission.md`: the user's completed repository-readiness checklist item.

### Task 1: Establish branch and immutable repository snapshot

**Files:**
- Inspect: `.git/`, `AGENTS.md`, tracked and untracked paths
- Create branch: `codex/autonomous-build-week`

**Interfaces:**
- Consumes: current `main` at `ea14e2f`, two commits ahead of `origin/main`, with one tracked documentation edit and related untracked research/audit artifacts.
- Produces: a named isolated branch that retains the exact working-tree state without rewriting `main` or existing branches.

- [ ] **Step 1: Reconfirm the snapshot**

Run:

```bash
git status --porcelain=v2 --branch
git rev-parse HEAD
git log --format='%h %s' -5
```

Expected: `main`, HEAD `ea14e2f...`, no staged changes, modified `docs/submission.md`, and untracked research/audit files.

- [ ] **Step 2: Create the mission branch**

Run:

```bash
git switch -c codex/autonomous-build-week
```

Expected: `Switched to a new branch 'codex/autonomous-build-week'`; existing working-tree changes remain intact.

- [ ] **Step 3: Verify isolation and preservation**

Run:

```bash
git branch --show-current
git status --short
```

Expected: branch `codex/autonomous-build-week`; the same pre-existing modification and untracked paths remain.

### Task 2: Write the living autonomous mission ledger

**Files:**
- Create: `docs/research/autonomous-mission-ledger.md`

**Interfaces:**
- Consumes: the attached phase brief, design spec, three independent Phase 0 audits, six research handoffs, baseline test result, and git snapshot.
- Produces: one append-only mission register with stable objective IDs `P0` through `P9` and `FINAL`, status values `pending|in_progress|complete|blocked`, exact commands, output summaries, decisions, rejected alternatives, limitations, and external gates.

- [ ] **Step 1: Add ledger doctrine and immutable baseline**

Write these sections with concrete values:

```markdown
# Autonomous mission ledger

## Ledger doctrine
## Immutable Phase 0 baseline
## Objective register
## Dependency graph
## Architecture decisions
## Rejected alternatives
## Verification evidence
## Risks and limitations
## External follow-ups
## Next experiments
```

The baseline records HEAD `ea14e2f4f7a16f15f0603b4e3b5355d258725a9c`, `origin/main` at `f6524ea`, the current dirty paths, Python-only scope, executor non-sandbox posture, and the temporary-environment reason for local verification.

- [ ] **Step 2: Add objective rows with acceptance criteria**

Use one row per objective with these columns:

```markdown
| ID | Objective | Owners/reviewers | Dependencies | Status | Acceptance criteria | Evidence |
```

Set `P0` to `in_progress`; `P1` through `P9` and `FINAL` to `pending`. Name the three Phase 0 review domains: architecture/API/persistence, research reconciliation, and quality/release.

- [ ] **Step 3: Record decisions and rejected alternatives**

Record the selected evidence-gated vertical-slice approach, separate contract-version namespaces, the real-model trial as a parallel operational lane, benchmark scoring outside `aggregate()`, and explicit blocked states for unavailable signing/approval/isolation authority. Reject parallel conflicting migrations, demo-first integrity deferral, model-authored authority, and setup-as-sandbox claims.

- [ ] **Step 4: Record baseline verification exactly**

Record both attempts:

```text
uv run pytest -q
Result: interrupted before collection; the checkout .venv contained macOS hidden,compressed,dataless Hypothesis source and bytecode files.

UV_PROJECT_ENVIRONMENT=/private/tmp/cross-examine-mission.Y52f1Y/venv uv run pytest -q
Result: 115 passed in 252.06s (0:04:12).
```

State that `/private/tmp/cross-examine-mission.Y52f1Y/venv` is an ephemeral local verification environment and not a repository artifact.

- [ ] **Step 5: Commit the initial ledger**

Run:

```bash
git add docs/research/autonomous-mission-ledger.md
git diff --cached --check
git commit -m "docs: initialize autonomous mission ledger"
```

Expected: one documentation-only commit containing the initial objective, dependency, decision, evidence, and risk register.

### Task 3: Reconcile audit evidence into the Phase 0 handoff

**Files:**
- Modify: `docs/research/autonomous-mission-ledger.md`
- Verify: `docs/superpowers/specs/2026-07-18-autonomous-build-week-mission-design.md`
- Preserve: `docs/research/real-gpt56-run-handoff.md`
- Preserve: `docs/research/setup-hook-handoff.md`
- Preserve: `docs/research/benchmark-handoff.md`
- Preserve: `docs/research/intended-oracle-handoff.md`
- Preserve: `docs/research/corpus-lifecycle-handoff.md`
- Preserve: `docs/research/value-support-handoff.md`
- Preserve: `artifacts/product-audit-2026-07-18/audit.md`

**Interfaces:**
- Consumes: concrete audit findings with file/symbol evidence.
- Produces: prioritized P0/P1/P2 risks and objective acceptance tests that later phase plans can reference without reinterpreting the original research.

- [ ] **Step 1: Add the architecture and contract map**

Record the current owners:

```text
Ingest             src/cross_examine/ingest/service.py
Characterize       src/cross_examine/characterize/{models,service}.py
Cross-examine      src/cross_examine/cross_examine/{layer_a,layer_b,probe_*}.py
Aggregate          src/cross_examine/schema.py::aggregate
Render             validation.py -> codec.py -> persistence -> API -> React
Execution boundary src/cross_examine/execution.py
Corpus feedback    corpus/repository.py -> Pipeline._applicable_corpus/_pin_verified
```

- [ ] **Step 2: Add prioritized risks with acceptance tests**

The P0 list must include non-critical preservation mismatches producing `SAFE`, incomplete touched-symbol coverage, locator-only corpus authority, semantic/report read validation gaps, recursive aggregation failure, non-atomic run/corpus writes, and unsafe non-loopback local serving. Each risk includes the concrete failing scenario and later target phase.

The P1 list includes context-free receipts, Layer-B tuple/list drift, ProbePlan budget/minimization overclaim, setup absence, timeout-contract mismatch, incomplete run recovery, corpus-growth misreporting, and unrendered provenance.

- [ ] **Step 3: Reconcile stale research claims**

Record that receipt v1 is implemented but not context-bound, validation now precedes pinning, the real-model handoff pins a pre-receipt commit, corpus/value migrations conflict if implemented literally, setup isolation is not benchmark isolation, and intended-oracle Layer B has no approved contract.

- [ ] **Step 4: Complete the Phase 0 ledger row**

Change `P0` to `complete` only after the design, plan, audits, research handoffs, product audit, baseline result, and branch evidence are all present. Link the eventual commit hash after commit creation in the next task.

- [ ] **Step 5: Commit the reviewed audit package**

Run:

```bash
git add docs/research docs/superpowers/specs/2026-07-18-autonomous-build-week-mission-design.md docs/superpowers/plans/2026-07-18-autonomous-mission-phase-0.md artifacts/product-audit-2026-07-18
git diff --cached --check
git commit -m "docs: record autonomous mission audit"
```

Expected: one documentation/artifact commit preserving the six source handoffs, product audit, approved design, executable plan, and reconciled ledger.

### Task 4: Verify, commit, push, and update immutable evidence

**Files:**
- Stage only the Phase 0 paths listed in the file map.
- Do not stage runtime caches, `.venv`, `.cross-examine`, or unrelated branches/worktrees.

**Interfaces:**
- Consumes: complete Phase 0 artifacts.
- Produces: one coherent Phase 0 commit on the mission branch and a matching remote branch.

- [ ] **Step 1: Self-review documentation**

Run:

```bash
rg -n 'T[B]D|T[O]DO|PLACEHOLD[E]R|fill [i]n' docs/research/autonomous-mission-ledger.md docs/superpowers/specs/2026-07-18-autonomous-build-week-mission-design.md docs/superpowers/plans/2026-07-18-autonomous-mission-phase-0.md
git status --short
```

Expected: the placeholder scan prints nothing; status contains only intentional Phase 0 paths.

- [ ] **Step 2: Run documentation and repository checks**

Run:

```bash
uv run ruff check .
uv run pytest
```

Expected: Ruff exits 0; pytest reports all tests passed. If the checkout virtualenv is dataless, use the fresh temporary uv environment and record the exact environment-prefixed command/output in the ledger.

- [ ] **Step 3: Stage the coherent Phase 0 unit**

Run:

```bash
git add docs/submission.md docs/research docs/superpowers/specs/2026-07-18-autonomous-build-week-mission-design.md docs/superpowers/plans/2026-07-18-autonomous-mission-phase-0.md artifacts/product-audit-2026-07-18
git diff --cached --check
git diff --cached --stat
```

Expected: no whitespace errors; the staged set contains the six handoffs, product audit, design, plan, ledger, and preserved submission checklist edit.

- [ ] **Step 4: Commit Phase 0**

Run:

```bash
git commit -m "docs: establish autonomous mission ledger"
```

Expected: one final Phase 0 commit containing only the remaining reviewed Phase 0 artifact updates.

- [ ] **Step 5: Add the immutable commit link without rewriting history**

Append the Phase 0 commit hash to the ledger in the first Phase 1 documentation commit. Do not amend the Phase 0 commit; the commit itself is the immutable link target.

- [ ] **Step 6: Push the mission branch**

Run through the GitHub delivery workflow:

```bash
git push -u origin codex/autonomous-build-week
```

Expected: remote branch created without force and configured as upstream.
