# Cross-Examine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a local-first verification harness that independently executes Python PR behavior and renders a reproducible `SAFE`, `RISKY`, or `BROKEN` verdict.

**Architecture:** A Python package owns the five-stage verification pipeline, FastAPI serves persisted reports and progress events, and a React/Vite application renders runs from the shared `Report` contract. GPT-5.6 Sol may emit validated claims only; deterministic execution captures base behavior, replays it against head, and supplies all outcomes to the pure aggregate function.

**Tech Stack:** Python 3.12, uv, FastAPI, OpenAI Responses API, Pydantic, pytest, Hypothesis, SQLite, React 19, TypeScript, Vite, Tailwind CSS, 21st.dev components, Vitest, Testing Library, axe, Playwright.

## Global Constraints

- Preserve the five stages: Ingest → Characterize → Cross-examine → Aggregate → Render.
- Python target repositories only; no multi-language target support.
- Layer A must work end-to-end before any Layer-B implementation begins.
- `aggregate()` is pure and imports no IO, model, database, subprocess, network, or framework code.
- A `VERIFIED` or `REFUTED` finding must contain a non-empty exact command and captured output.
- Model output is limited to schema-constrained `Claim` objects; model prose is never an execution oracle.
- Unverifiable preserve-critical behavior produces `RISKY`, never `SAFE`.
- Use `# hackathon: trusted-input sandbox; prod needs real isolation` at the execution boundary.
- Use the approved 21st.dev sources as-is and record provenance for every visible component.
- Keep every commit runnable; fake data must be visibly labeled and replaced stage by stage.

---

## File map

| Path | Responsibility |
|---|---|
| `pyproject.toml` | Python package metadata, dependencies, CLI, and test configuration |
| `AGENTS.md` | Repository-wide doctrine, commands, and verification expectations |
| `src/cross_examine/schema.py` | All domain and stage contracts plus pure aggregation |
| `src/cross_examine/validation.py` | Grounding and report invariants |
| `src/cross_examine/codec.py` | Lossless Report JSON serialization |
| `src/cross_examine/execution.py` | Whitelisted subprocess execution, redaction, and limits |
| `src/cross_examine/ingest/service.py` | Git clone/ref/diff/test-surface discovery |
| `src/cross_examine/characterize/service.py` | GPT-5.6 structured Claim generation only |
| `src/cross_examine/characterize/edge_catalog.py` | Deterministic type-aware probe inputs |
| `src/cross_examine/cross_examine/probe_runner.py` | Target-worktree symbol description and invocation |
| `src/cross_examine/cross_examine/layer_a.py` | Base capture and head replay |
| `src/cross_examine/cross_examine/layer_b.py` | Differential Hypothesis search and shrinking |
| `src/cross_examine/corpus/repository.py` | SQLite corpus pin, dedupe, and replay selection |
| `src/cross_examine/persistence/database.py` | SQLite setup and run/report persistence |
| `src/cross_examine/pipeline.py` | Stage orchestration and progress publication |
| `src/cross_examine/api/app.py` | FastAPI routes, SSE, and static UI serving |
| `src/cross_examine/cli.py` | `serve`, `run`, and `demo` commands |
| `frontend/src/` | Approved 21st.dev shell, run flow, report, corpus, and tests |
| `tests/fixtures/hero_repo/` | Deterministic base/head regression repository |
| `docs/provenance.md` | 21st.dev source and adaptation record |

---

### Task 1: Contract, aggregation, and grounding boundary

**Files:**
- Create: `pyproject.toml`
- Create: `AGENTS.md`
- Create: `src/cross_examine/__init__.py`
- Create: `src/cross_examine/schema.py`
- Create: `src/cross_examine/validation.py`
- Test: `tests/unit/test_schema.py`
- Test: `tests/unit/test_validation.py`

**Interfaces:**
- Produces: `Outcome`, `Layer`, `Verdict`, `Claim`, `Finding`, `CorpusDelta`, `Report`, `RunSpec`, `CommandEvidence`, `BehaviorFixture`, `RunProgress`, `aggregate()`, `validate_report()`.
- Consumes: no application code.

- [ ] **Step 1: Add the failing aggregate decision table**

```python
# tests/unit/test_schema.py
import pytest
from cross_examine.schema import Finding, Layer, Outcome, Verdict, aggregate

def finding(claim_id: str, outcome: Outcome) -> Finding:
    return Finding(claim_id, Layer.BEHAVIORAL_DIFF, outcome, "python -m check", "captured")

@pytest.mark.parametrize(
    ("findings", "critical", "expected"),
    [
        ([], set(), Verdict.SAFE),
        ([finding("c1", Outcome.VERIFIED)], {"c1"}, Verdict.SAFE),
        ([finding("c1", Outcome.REFUTED)], {"c1"}, Verdict.BROKEN),
        ([finding("c1", Outcome.REFUTED)], set(), Verdict.RISKY),
        ([finding("c1", Outcome.UNVERIFIABLE)], {"c1"}, Verdict.RISKY),
        ([finding("c1", Outcome.UNVERIFIABLE)], set(), Verdict.SAFE),
    ],
)
def test_aggregate_decision_table(findings, critical, expected):
    assert aggregate(findings, critical) is expected
```

- [ ] **Step 2: Run the test and confirm the contract does not exist**

Run: `uv run pytest tests/unit/test_schema.py -q`

Expected: collection fails with `ModuleNotFoundError: No module named 'cross_examine'`.

- [ ] **Step 3: Add package metadata and the exact domain contract**

```toml
# pyproject.toml
[project]
name = "cross-examine"
version = "0.1.0"
description = "Independent execution-grounded verification for Codex-authored Python PRs"
requires-python = ">=3.12"
dependencies = ["fastapi", "hypothesis", "openai", "pydantic>=2", "uvicorn[standard]"]

[project.optional-dependencies]
dev = ["httpx", "pytest", "pytest-asyncio", "pytest-cov", "ruff"]

[project.scripts]
cross-examine = "cross_examine.cli:main"

[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[tool.pytest.ini_options]
testpaths = ["tests"]
addopts = "-ra"
```

Implement `schema.py` from the user-supplied contract, add `preserve_critical: bool = False` to `Claim`, and add these exact stage shapes:

```python
@dataclass(frozen=True)
class RunSpec:
    repo: str
    base_ref: str
    head_ref: str
    layer_b: bool = True
    command_timeout_seconds: int = 120
    run_timeout_seconds: int = 600

@dataclass(frozen=True)
class CommandEvidence:
    command: str
    exit_code: int | None
    stdout: str
    stderr: str
    duration_seconds: float
    timed_out: bool = False

    @property
    def output(self) -> str:
        return "\n".join(part for part in (self.stdout, self.stderr) if part)

@dataclass(frozen=True)
class TouchedSymbol:
    module: str
    qualname: str
    target_symbol: str
    file_path: str

@dataclass(frozen=True)
class IngestResult:
    repo: str
    base_sha: str
    head_sha: str
    base_path: str
    head_path: str
    diff: str
    touched_symbols: list[TouchedSymbol]
    test_commands: list[list[str]]
    evidence: list[CommandEvidence]

@dataclass(frozen=True)
class BehaviorFixture:
    id: str
    claim_id: str
    target_symbol: str
    args_json: str
    kwargs_json: str
    expected_json: str
    command: str
    output: str

@dataclass(frozen=True)
class RunProgress:
    run_id: str
    stage: str
    message: str
    elapsed_seconds: float
```

- [ ] **Step 4: Add failing grounding tests**

```python
# tests/unit/test_validation.py
import pytest
from cross_examine.schema import Finding, Layer, Outcome, Report, Verdict
from cross_examine.validation import GroundingError, validate_report

@pytest.mark.parametrize("outcome", [Outcome.VERIFIED, Outcome.REFUTED])
def test_grounded_outcomes_require_command_and_output(outcome):
    report = Report("repo", "base..head", Verdict.RISKY, [Finding("c", Layer.ADVERSARIAL, outcome, "", "")])
    with pytest.raises(GroundingError):
        validate_report(report)

def test_unverifiable_may_have_no_execution_evidence():
    report = Report("repo", "base..head", Verdict.RISKY, [Finding("c", Layer.ADVERSARIAL, Outcome.UNVERIFIABLE, "", "")])
    assert validate_report(report) is report
```

- [ ] **Step 5: Implement the validation boundary and run tests**

```python
# src/cross_examine/validation.py
from cross_examine.schema import Outcome, Report

class GroundingError(ValueError):
    pass

def validate_report(report: Report) -> Report:
    for finding in report.findings:
        if finding.outcome in {Outcome.VERIFIED, Outcome.REFUTED}:
            if not finding.command.strip() or not finding.output.strip():
                raise GroundingError(f"{finding.claim_id} lacks execution grounding")
    return report
```

Run: `uv sync --extra dev && uv run pytest tests/unit/test_schema.py tests/unit/test_validation.py -q`

Expected: all tests pass.

- [ ] **Step 6: Add doctrine and commit**

`AGENTS.md` must restate the five stages, grounding rule, pure aggregate boundary, abstain-toward-risk rule, Python-only target scope, and required verification command `uv run pytest`.

```bash
git add pyproject.toml AGENTS.md src tests/unit
git commit -m "feat: establish grounded verdict contract"
```

### Task 2: Report codec and SQLite run persistence

**Files:**
- Create: `src/cross_examine/codec.py`
- Create: `src/cross_examine/persistence/database.py`
- Create: `src/cross_examine/persistence/runs.py`
- Test: `tests/unit/test_codec.py`
- Test: `tests/integration/test_run_repository.py`

**Interfaces:**
- Consumes: `Report`, `Claim`, `Finding`, `CorpusDelta`.
- Produces: `report_to_json(report) -> str`, `report_from_json(raw) -> Report`, `RunRepository.create()`, `.set_progress()`, `.complete()`, `.get()`, `.list()`.

- [ ] **Step 1: Write a lossless report round-trip test**

```python
def test_report_round_trip_preserves_enums_and_optional_evidence():
    report = Report(
        repo="owner/repo",
        pr_ref="abc..def",
        verdict=Verdict.BROKEN,
        claims=[Claim("c1", "preserves empty input", "pkg.fn", "high", "call with []", True)],
        findings=[Finding("c1", Layer.BEHAVIORAL_DIFF, Outcome.REFUTED, "python probe.py", "AssertionError", "[]", "[]", "None")],
        corpus=CorpusDelta(1, 7),
    )
    assert report_from_json(report_to_json(report)) == report
```

- [ ] **Step 2: Implement explicit enum-aware codec functions**

Use `dataclasses.asdict()` for encoding and explicit constructors for decoding. Do not use pickle. Reject missing required keys with `ValueError`.

- [ ] **Step 3: Write repository persistence tests using a temporary SQLite path**

The test must create a run, update `stage="layer_a"`, complete it with a serialized report, reopen the database, and assert the report is still lossless.

- [ ] **Step 4: Implement the database schema**

```sql
CREATE TABLE IF NOT EXISTS runs (
  id TEXT PRIMARY KEY,
  repo TEXT NOT NULL,
  base_ref TEXT NOT NULL,
  head_ref TEXT NOT NULL,
  status TEXT NOT NULL,
  stage TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  report_json TEXT
);
```

Open connections with `sqlite3.connect(path)`, `row_factory=sqlite3.Row`, WAL mode, and foreign keys enabled. Keep SQL behind `RunRepository`.

- [ ] **Step 5: Run and commit**

Run: `uv run pytest tests/unit/test_codec.py tests/integration/test_run_repository.py -q`

Expected: all tests pass after closing and reopening the database.

```bash
git add src/cross_examine/codec.py src/cross_examine/persistence tests
git commit -m "feat: persist report contracts"
```

### Task 3: Fake-report API and approved 21st.dev render skeleton

**Files:**
- Create: `src/cross_examine/api/app.py`
- Create: `src/cross_examine/api/models.py`
- Create: `src/cross_examine/fixtures.py`
- Create: `frontend/` through Vite and shadcn initialization
- Create: `frontend/src/app/App.tsx`
- Create: `frontend/src/app/api.ts`
- Create: `frontend/src/features/runs/NewRunPage.tsx`
- Create: `frontend/src/features/runs/RunPage.tsx`
- Create: `frontend/src/features/report/ReportPage.tsx`
- Create: `frontend/src/features/corpus/CorpusPage.tsx`
- Create: `docs/provenance.md`
- Test: `tests/integration/test_api_fixture.py`
- Test: `frontend/src/features/report/ReportPage.test.tsx`

**Interfaces:**
- Consumes: serialized `Report` and `RunRepository`.
- Produces: `create_app(database_path) -> FastAPI`, `GET /api/runs/{id}`, React report rendering.

- [ ] **Step 1: Write an API test for a visibly labeled fixture report**

```python
def test_fixture_report_is_renderable(tmp_path):
    client = TestClient(create_app(tmp_path / "app.db"))
    response = client.get("/api/fixtures/broken")
    assert response.status_code == 200
    assert response.json()["fixture"] is True
    assert response.json()["report"]["verdict"] == "broken"
    assert response.json()["report"]["findings"][0]["command"]
    assert response.json()["report"]["findings"][0]["output"]
```

- [ ] **Step 2: Implement a fixed grounded `BROKEN` fixture and API**

The fixture uses claim `preserve-empty`, command `python -m pytest -q tests/test_normalize.py -k empty`, output containing a failing assertion, `repro_input="[]"`, `expected="[]"`, and `actual="None"`. Pass it through `validate_report()` before returning it.

- [ ] **Step 3: Scaffold the frontend and install exact 21st sources**

Run from the repository root:

```bash
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install
npx shadcn@latest init
npx @21st-dev/cli add arunjdass/dashboard-sidebar
npx @21st-dev/cli add nyxbui/timeline
npx shadcn@latest add https://21st.dev/r/uniquesonu/status-badge-beautiful-accessible-status-indicators
npx shadcn@latest add https://21st.dev/r/ravikatiyar162/project-data-table
npx shadcn@latest add https://21st.dev/r/vercel/code-block
npm install react-router-dom
npm install -D @testing-library/jest-dom @testing-library/react @testing-library/user-event @playwright/test vitest jsdom axe-core
npx playwright install chromium
```

If a registry slug has changed, use the linked 21st source page to obtain its current install command, record the exact replacement in `docs/provenance.md`, and do not substitute a custom component.

- [ ] **Step 4: Wire the sourced shell without redesigning it**

`App.tsx` uses the imported dashboard sidebar and preserves its collapse, workspace frame, light/dark palettes, keyboard behavior, and responsive states. Replace navigation content only with Runs, Corpus, and About. Routes are `/`, `/runs/:runId`, `/fixtures/broken`, and `/corpus`.

- [ ] **Step 5: Write the report interaction test**

```tsx
it("reveals grounded evidence for a refuted finding", async () => {
  render(<ReportPage report={brokenFixture.report} fixture />)
  expect(screen.getByText("BROKEN")).toBeInTheDocument()
  await userEvent.click(screen.getByRole("button", { name: /preserves empty input/i }))
  expect(screen.getByText(/python -m pytest/)).toBeInTheDocument()
  expect(screen.getByText(/AssertionError/)).toBeInTheDocument()
  expect(screen.getByText("Fixture data")).toBeInTheDocument()
})
```

- [ ] **Step 6: Build, test, capture provenance, and commit**

Run: `uv run pytest tests/integration/test_api_fixture.py -q`

Run: `npm test -- --run && npm run build` from `frontend/`.

`docs/provenance.md` records each source identifier, installation command, installed dependencies, preserved behavior, route/data adaptations, semantic token changes, and the test that exercises it.

```bash
git add src/cross_examine/api src/cross_examine/fixtures.py frontend docs/provenance.md tests
git commit -m "feat: render grounded fixture verdict"
```

### Task 4: Whitelisted execution and real Ingest

**Files:**
- Create: `src/cross_examine/settings.py`
- Create: `src/cross_examine/execution.py`
- Create: `src/cross_examine/ingest/service.py`
- Create: `src/cross_examine/ingest/symbols.py`
- Test: `tests/unit/test_execution.py`
- Test: `tests/integration/test_ingest.py`

**Interfaces:**
- Consumes: `RunSpec`.
- Produces: `run_command(argv, cwd, timeout, env) -> CommandEvidence`, `IngestService.ingest(spec, run_dir) -> IngestResult`.

- [ ] **Step 1: Test command allowlisting, exact command rendering, timeout, output cap, and secret redaction**

Tests must prove that `cmd.exe`/`sh` are rejected, `python -c "print('ok')"` is captured, a sleeping Python process times out, output beyond 2 MB is terminated, and `OPENAI_API_KEY` is replaced with `[REDACTED]`.

- [ ] **Step 2: Implement the execution boundary**

Use `subprocess.Popen` with argv lists, `shell=False`, `text=True`, bounded reader threads, and process-tree termination on timeout. Allowed executable basenames are `git`, `python`, and the resolved current interpreter name. Render commands with `subprocess.list2cmdline(argv)` on Windows and `shlex.join(argv)` elsewhere.

Add the exact comment:

```python
# hackathon: trusted-input sandbox; prod needs real isolation
```

- [ ] **Step 3: Create a temporary Git repository integration fixture**

The test repository has a base commit containing `src/sample/math.py` and a head commit changing `clamp()`. Assert Ingest resolves both SHAs, creates two worktrees, captures the diff, discovers `sample.math:clamp`, and records every Git command.

- [ ] **Step 4: Implement deterministic Ingest**

Run these operations through `run_command()`:

```text
git clone --no-checkout <repo> <run_dir>/repo
git -C <repo> rev-parse <base_ref>^{commit}
git -C <repo> rev-parse <head_ref>^{commit}
git -C <repo> worktree add --detach <run_dir>/base <base_sha>
git -C <repo> worktree add --detach <run_dir>/head <head_sha>
git -C <repo> diff --unified=80 <base_sha>..<head_sha> -- *.py
```

Parse touched functions/classes with `ast`, mapping `src/pkg/mod.py` or `pkg/mod.py` plus qualified name to `pkg.mod:symbol`. Discover test commands from `pyproject.toml`, `pytest.ini`, or a `tests/` directory; default to `python -m pytest -q`.

- [ ] **Step 5: Verify and commit**

Run: `uv run pytest tests/unit/test_execution.py tests/integration/test_ingest.py -q`

```bash
git add src/cross_examine/settings.py src/cross_examine/execution.py src/cross_examine/ingest tests
git commit -m "feat: ingest Python PR states"
```

### Task 5: GPT-5.6 claim characterization

**Files:**
- Create: `src/cross_examine/characterize/models.py`
- Create: `src/cross_examine/characterize/prompt.py`
- Create: `src/cross_examine/characterize/service.py`
- Test: `tests/unit/test_characterize.py`

**Interfaces:**
- Consumes: normalized diff and touched source excerpts from `IngestResult`.
- Produces: `Characterizer.characterize(ingest) -> list[Claim]`.

- [ ] **Step 1: Write a fake-client test that returns claims and attempts no verdict**

The fake client exposes `responses.parse()` and records arguments. Assert `model == "gpt-5.6-sol"`, `text_format is CharacterizationPayload`, all target symbols belong to the Ingest allowlist, and the returned value is `list[Claim]`.

- [ ] **Step 2: Define the strict Pydantic response shape**

```python
class ClaimPayload(BaseModel):
    model_config = ConfigDict(extra="forbid")
    id: str
    text: str
    target_symbol: str
    risk: Literal["high", "med", "low"]
    proposed_check: str
    preserve_critical: bool

class CharacterizationPayload(BaseModel):
    model_config = ConfigDict(extra="forbid")
    claims: list[ClaimPayload]
```

- [ ] **Step 3: Implement the Responses API call**

```python
response = self.client.responses.parse(
    model=self.model,
    input=[
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": build_context(ingest)},
    ],
    text_format=CharacterizationPayload,
)
payload = response.output_parsed
```

Reject absent parsed output, duplicate claim IDs, unknown target symbols, empty proposed checks, and more than 20 claims. Store the OpenAI request ID for diagnostics, never the API key. Official capability evidence: [`gpt-5.6-sol`](https://developers.openai.com/api/docs/models/gpt-5.6-sol) supports the Responses API and structured outputs.

- [ ] **Step 4: Verify model/code separation and commit**

Add a test that `schema.py` and the aggregate package do not import `openai`. Run: `uv run pytest tests/unit/test_characterize.py tests/unit/test_schema.py -q`.

```bash
git add src/cross_examine/characterize tests/unit
git commit -m "feat: characterize PR claims with GPT-5.6"
```

### Task 6: Deterministic probe capture and Layer A replay

**Files:**
- Create: `src/cross_examine/characterize/edge_catalog.py`
- Create: `src/cross_examine/cross_examine/probe_protocol.py`
- Create: `src/cross_examine/cross_examine/probe_runner.py`
- Create: `src/cross_examine/cross_examine/layer_a.py`
- Test: `tests/unit/test_edge_catalog.py`
- Test: `tests/integration/test_layer_a.py`

**Interfaces:**
- Consumes: `Claim[]`, base/head worktrees, touched symbols, and command limits.
- Produces: `capture_base(...) -> list[BehaviorFixture]`, `run_layer_a(...) -> list[Finding]`.

- [ ] **Step 1: Write edge-catalog tests**

For `int`, assert `[-1, 0, 1, 2, 10]`; for `str`, assert `['', 'a', 'é', '🙂']`; for `list[int]`, assert `[[], [0], [1, -1]]`; for optional annotations include `None`. Cap Cartesian products at 32 inputs per claim with stable ordering.

- [ ] **Step 2: Implement the fixed catalog as pure data transformations**

The catalog accepts a JSON signature description and returns JSON-compatible `(args, kwargs)` pairs. Unsupported required parameters return an empty list plus a reason; they never invent placeholder values.

- [ ] **Step 3: Write the hero Layer-A integration test**

Base `normalize([])` returns `[]`; head returns `None`; normal non-empty inputs match. Assert Layer A emits a `REFUTED` finding for the preserve-critical claim with `repro_input="[]"`, `expected="[]"`, `actual="null"`, and non-empty command/output.

- [ ] **Step 4: Implement the probe protocol and runner**

Invoke it as:

```text
python -m cross_examine.cross_examine.probe_runner describe <module:symbol>
python -m cross_examine.cross_examine.probe_runner call <module:symbol> <request.json>
```

The final stdout line is a tagged JSON envelope:

```json
{"cross_examine_probe":1,"ok":true,"value":[],"exception":null}
```

The runner adds the worktree and its `src/` directory to `sys.path`, resolves attributes without `eval`, refuses async/generator callables in v1, captures normalized exceptions as `{type, message}`, and never imports target code in the server process.

- [ ] **Step 5: Implement capture and replay**

Base capture stores one `BehaviorFixture` per runnable input. Head replay compares the normalized envelope. Equal envelopes produce `VERIFIED`; different envelopes produce `REFUTED` only for preservation claims. Missing signatures, unsupported values, import failures, timeouts, and malformed envelopes produce `UNVERIFIABLE`.

- [ ] **Step 6: Verify and commit the Layer-A core**

Run: `uv run pytest tests/unit/test_edge_catalog.py tests/integration/test_layer_a.py -q`.

Expected: the subtle empty-input regression is reproducibly refuted.

```bash
git add src/cross_examine/characterize/edge_catalog.py src/cross_examine/cross_examine tests
git commit -m "feat: cross-examine captured behavior"
```

### Task 7: Corpus moat and complete Layer-A pipeline

**Files:**
- Create: `src/cross_examine/corpus/repository.py`
- Create: `src/cross_examine/progress.py`
- Create: `src/cross_examine/pipeline.py`
- Modify: `src/cross_examine/api/app.py`
- Test: `tests/integration/test_corpus.py`
- Test: `tests/e2e/test_layer_a_pipeline.py`

**Interfaces:**
- Consumes: all completed stage services.
- Produces: `CorpusRepository.pin()`, `.applicable()`, `Pipeline.run(spec, progress) -> Report`, `POST /api/runs`, SSE events.

- [ ] **Step 1: Test corpus dedupe and replay selection**

Pin the same verified fixture twice and assert `pinned_this_run` is `1` then `0`, while `corpus_total` stays `1`. A changed expected result must have a different identity. A refuted or adversarial finding must never pin.

- [ ] **Step 2: Add the corpus schema and repository**

```sql
CREATE TABLE IF NOT EXISTS corpus_checks (
  id TEXT PRIMARY KEY,
  repo TEXT NOT NULL,
  target_symbol TEXT NOT NULL,
  input_json TEXT NOT NULL,
  expected_json TEXT NOT NULL,
  command TEXT NOT NULL,
  output TEXT NOT NULL,
  first_run_id TEXT NOT NULL,
  last_run_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS corpus_repo_idx ON corpus_checks(repo);
```

Identity is SHA-256 over canonical JSON containing repo, target symbol, args, kwargs, and expected result.

- [ ] **Step 3: Write the Layer-A end-to-end pipeline test**

Use fake Characterizer claims plus the real temporary Git hero repository. Assert progress stage order, `BROKEN` verdict, exact refuted evidence, and `CorpusDelta` growth for passing neighbor inputs.

- [ ] **Step 4: Implement orchestration with failure-to-finding conversion**

`Pipeline.run()` emits `ingesting`, `characterizing`, `capturing`, `layer_a`, `aggregating`, and `complete`. Each stage exception becomes a synthetic `system:<stage>` preserve-critical claim and `UNVERIFIABLE` finding, then aggregates to `RISKY`. Never catch `KeyboardInterrupt` or `SystemExit`.

- [ ] **Step 5: Add API job execution and SSE**

`POST /api/runs` creates a run and queues it on a single background worker. `GET /api/runs/{id}/events` emits JSON SSE messages from an in-memory broadcaster and always finishes with `complete` or `failed`. Persisted state remains the recovery source after restart.

- [ ] **Step 6: Verify the Day-3 checkpoint and commit**

Run: `uv run pytest tests/e2e/test_layer_a_pipeline.py tests/integration/test_corpus.py -q`.

Run the server against the hero repo with Layer B disabled and confirm a complete report renders.

```bash
git add src/cross_examine/corpus src/cross_examine/progress.py src/cross_examine/pipeline.py src/cross_examine/api tests
git commit -m "feat: deliver complete Layer-A verdict pipeline"
```

### Task 8: Additive differential Layer B

**Files:**
- Create: `src/cross_examine/cross_examine/layer_b.py`
- Create: `src/cross_examine/cross_examine/hypothesis_worker.py`
- Modify: `src/cross_examine/pipeline.py`
- Test: `tests/integration/test_layer_b.py`

**Interfaces:**
- Consumes: preservation claims, signature descriptions, base/head worktrees.
- Produces: `run_layer_b(...) -> list[Finding]` with shrunk counterexamples.

- [ ] **Step 1: Write a shrinking test**

Use a base function correct for lists of length `0..5` and a head regression only when length is zero. Assert Hypothesis returns `[]`, not a larger generated list, and the finding is `Layer.ADVERSARIAL` with base-derived expected output.

- [ ] **Step 2: Implement bounded strategy construction**

Support `bool`, `int`, `float` without NaN/inf, `str`, `list[T]`, `tuple[T, ...]`, `dict[str, T]`, and optional values. Set `max_examples=60`, `deadline=None`, `derandomize=True`, and suppress only `HealthCheck.too_slow`. Unsupported annotations yield `UNVERIFIABLE`.

- [ ] **Step 3: Run Hypothesis in a separate worker process**

The worker compares base and head envelopes for every generated input. On mismatch it raises a purpose-built assertion containing canonical JSON; Hypothesis shrinks it. The parent captures the final counterexample, exact command, full Pytest/Hypothesis output, expected, and actual.

- [ ] **Step 4: Preserve stage ordering and commit**

Add a test proving `layer_b` is never entered before a completed `layer_a` stage. Run: `uv run pytest tests/integration/test_layer_b.py tests/e2e/test_layer_a_pipeline.py -q`.

```bash
git add src/cross_examine/cross_examine src/cross_examine/pipeline.py tests
git commit -m "feat: hunt adversarial differential cases"
```

### Task 9: Live UI, report evidence, and corpus experience

**Files:**
- Modify: `frontend/src/features/runs/NewRunPage.tsx`
- Modify: `frontend/src/features/runs/RunPage.tsx`
- Modify: `frontend/src/features/report/ReportPage.tsx`
- Modify: `frontend/src/features/corpus/CorpusPage.tsx`
- Create: `frontend/src/features/report/FindingEvidence.tsx`
- Create: `frontend/src/features/report/report-model.ts`
- Create: `frontend/src/features/runs/useRunEvents.ts`
- Test: `frontend/src/features/runs/RunPage.test.tsx`
- Test: `frontend/src/features/report/FindingEvidence.test.tsx`
- Test: `frontend/e2e/broken-verdict.spec.ts`

**Interfaces:**
- Consumes: REST/SSE API and serialized Report.
- Produces: complete responsive judge-facing workflow.

- [ ] **Step 1: Write interaction and accessibility tests first**

Tests cover form validation, stage timeline updates, no speculative verdict during execution, keyboard-selectable finding rows, evidence reveal, exact command/output visibility, corpus delta, mobile stacking, and zero serious axe violations.

- [ ] **Step 2: Wire the New Run form**

Fields are repository URL, base ref, head ref, and Layer-B toggle. The primary action reads `Cross-examine PR`. A secondary `Load hero case` action fills the included local fixture refs. Both client and server validate non-empty refs and supported URL/path forms.

- [ ] **Step 3: Wire live progress through the sourced timeline**

`useRunEvents(runId)` reconnects once after transient disconnect, then falls back to polling `GET /api/runs/{id}` every two seconds. The sourced timeline maps stages to pending/current/done/error without changing its interaction or motion model.

- [ ] **Step 4: Render verdict and evidence with sourced components**

Map `safe → success`, `risky → warning`, and `broken → error` on the sourced status badge. The sourced table lists claim, layer, outcome, and confidence. Row selection reveals the sourced Vercel code blocks for command, output, repro input, expected, and actual. Empty evidence is impossible because the API validates reports before returning them.

- [ ] **Step 5: Render corpus state**

The Corpus page lists repository, total pinned checks, latest growth, and last run. Report pages show `+N this run · M total` next to the verdict.

- [ ] **Step 6: Run frontend and browser verification**

Run: `npm test -- --run`.

Run: `npm run build`.

Run Playwright against the local FastAPI server and assert new run → progress → `BROKEN` → evidence reveal.

- [ ] **Step 7: Update provenance and commit**

Record all exercised component variants, dark/light states, responsive states, dependencies, semantic token mapping, and verification commands in `docs/provenance.md`.

```bash
git add frontend docs/provenance.md
git commit -m "feat: reveal every verdict receipt"
```

### Task 10: Hero repository, CLI, packaging, and judge documentation

**Files:**
- Create: `src/cross_examine/cli.py`
- Create: `tests/fixtures/hero_repo/source/`
- Create: `scripts/build_hero_repo.py`
- Create: `scripts/verify.ps1`
- Create: `README.md`
- Create: `docs/architecture.md`
- Create: `docs/demo.md`
- Test: `tests/e2e/test_cli_demo.py`

**Interfaces:**
- Produces: `cross-examine serve`, `cross-examine run`, `cross-examine demo`, deterministic hero refs, one judge-facing verification command.

- [ ] **Step 1: Write CLI tests**

Assert `cross-examine --help` lists all three commands, `demo --no-open` exits zero and prints a run URL plus final `BROKEN`, and `serve --no-open` starts on a requested free port.

- [ ] **Step 2: Build the hero repository deterministically**

`scripts/build_hero_repo.py` creates a temporary Git repository from checked-in source snapshots, commits the base, commits the plausible regression, and prints base/head SHAs as JSON. The bug must look correct on normal inputs but return `None` for an empty list where base returns `[]`.

- [ ] **Step 3: Implement CLI commands**

Use `argparse` from stdlib. `serve` accepts `--host`, `--port`, and `--no-open`, starts Uvicorn, and opens the browser unless disabled. `run` accepts `repo`, `--base`, `--head`, and `--no-layer-b`. `demo` accepts `--no-open`, builds the hero repository, runs the real pipeline using a checked-in deterministic Characterizer fixture when no API key exists, and labels that characterization source in the report.

- [ ] **Step 4: Package the frontend into Python static assets**

Configure Vite output to `src/cross_examine/static`. Include that directory in the Python wheel. FastAPI serves `index.html` for unknown non-API routes so direct report URLs work.

- [ ] **Step 5: Write judge-facing documentation**

README sections: hook, why this is not a Codex skill, architecture, requirements, five-minute setup, hero demo, real repository run, supported platforms, safety limitation, GPT-5.6/Codex usage, Codex-authored versus human decisions, tests, and three-minute video outline.

`docs/demo.md` starts with the 30-second catch and includes the required voiceover sentence verbatim from the approved build plan.

- [ ] **Step 6: Add the verification script**

```powershell
$ErrorActionPreference = 'Stop'
uv sync --extra dev
uv run ruff check .
uv run pytest -q
Push-Location frontend
npm ci
npm test -- --run
npm run build
Pop-Location
uv run cross-examine demo --no-open
```

- [ ] **Step 7: Verify and commit**

Run: `powershell -ExecutionPolicy Bypass -File scripts/verify.ps1`.

Expected: lint passes, all backend/frontend/browser tests pass, frontend builds, and the demo prints `BROKEN` with a run URL.

```bash
git add src/cross_examine/cli.py src/cross_examine/static tests/fixtures scripts README.md docs
git commit -m "feat: ship judge-ready Cross-Examine demo"
```

### Task 11: Unseen-repository trial and final hardening

**Files:**
- Modify only files implicated by trial failures
- Create: `docs/trials.md`

**Interfaces:**
- Consumes: two or three public Python repositories with real base/head refs.
- Produces: recorded compatibility results and a frozen feature set.

- [ ] **Step 1: Select small trusted Python repositories**

Choose repositories with fast tests, simple setup, and recent function-level changes. Record repository, refs, setup duration, run duration, verdict, and limitations in `docs/trials.md`.

- [ ] **Step 2: Run Layer A before Layer B on every trial**

For each repository, first run `cross-examine run ... --no-layer-b`. Only after a renderable report exists, rerun with Layer B. Record exact commands and whether findings were verified, refuted, or unverifiable.

- [ ] **Step 3: Fix only demonstrated blockers**

Use the systematic-debugging workflow for each failure. Do not add non-Python support, new sandbox infrastructure, collaboration, or unrelated analysis features.

- [ ] **Step 4: Run the complete verification suite**

Run: `powershell -ExecutionPolicy Bypass -File scripts/verify.ps1`.

Expected: zero failing checks and a deterministic hero `BROKEN` verdict.

- [ ] **Step 5: Freeze and commit**

```bash
git add docs/trials.md src tests frontend README.md
git commit -m "fix: harden unseen-repository verification"
```

---

## Completion evidence

Before claiming completion, capture and report:

1. The final `scripts/verify.ps1` exit code and test totals.
2. The hero run ID, final verdict, refuted claim, exact command, and minimal input.
3. The corpus delta from two consecutive hero runs, proving deduplication.
4. The frontend production-build result.
5. The Playwright end-to-end result.
6. The current Git status and commit list.
