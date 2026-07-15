# Cross-Examine Product Design

**Date:** 2026-07-15
**Status:** Approved
**Deadline:** 2026-07-21 at 5:00 PM PT
**Track:** Developer Tools

## Product statement

Cross-Examine is an independent verification harness for Codex-authored Python pull requests. Codex writes the change; Cross-Examine independently characterizes the behavior that should be preserved, executes the proposed code against captured prior behavior, hunts adversarial edge cases, and produces a verdict grounded in reproducible evidence.

The product is not a repository summarizer and is not another prompt for the authoring agent. Its legitimacy comes from a separate execution path in which the model proposes claims and checks while deterministic code captures behavior, compares results, and decides the verdict.

## Goals

- Accept an existing Python repository plus base and head Git refs.
- Produce a `SAFE`, `RISKY`, or `BROKEN` verdict through the pure `aggregate()` function.
- Ground every `VERIFIED` and `REFUTED` finding in the exact executed command and complete captured output.
- Show at least one minimal reproducing input for a refuted adversarial finding.
- Persist passing behavioral checks into a repository-specific corpus that grows across runs.
- Provide a coherent local browser experience suitable for both a scripted demonstration and an unseen public repository.
- Finish a complete Layer-A product before adding Layer B.

## Non-goals

- Support for non-Python target repositories.
- Hosted multi-tenant execution, accounts, authentication, billing, or collaboration.
- Production-grade isolation for untrusted repositories.
- General-purpose code review, repository summarization, style linting, or model-authored verdicts.
- A broad plugin ecosystem or generalized workflow engine.

## Selected approach

Cross-Examine is a local-first application with a Python verification engine, a FastAPI server, and a React/TypeScript browser interface. The production frontend is built into static assets served by the Python package. SQLite stores run history and the behavioral corpus.

This approach was selected over an all-Python rendered interface because the judging criteria reward a complete product experience, and over a hosted service because remote sandboxing and deployment would consume the time reserved for verification correctness.

## Technology choices

- Python 3.12
- `uv` for environment and command management
- FastAPI and Uvicorn for the local API and static application server
- OpenAI Responses API with `gpt-5.6-sol` for schema-constrained characterization
- Pydantic for API and structured model schemas; dataclasses remain the domain contract
- Git CLI for clone, checkout, diff, and worktree operations
- Pytest and Hypothesis for repository checks and Cross-Examine's own tests
- SQLite through the Python standard library for runs and corpus persistence
- React 19, TypeScript, Vite, Tailwind CSS, and sourced 21st.dev components
- Vitest, React Testing Library, axe, and Playwright for frontend verification

## Repository structure

```text
cross-examine/
├── pyproject.toml
├── README.md
├── AGENTS.md
├── src/cross_examine/
│   ├── schema.py
│   ├── validation.py
│   ├── pipeline.py
│   ├── settings.py
│   ├── cli.py
│   ├── ingest/
│   ├── characterize/
│   ├── cross_examine/
│   ├── aggregate/
│   ├── corpus/
│   ├── persistence/
│   ├── api/
│   └── static/
├── frontend/
│   ├── src/
│   └── tests/
├── tests/
│   ├── unit/
│   ├── integration/
│   ├── e2e/
│   └── fixtures/hero_repo/
└── docs/
    ├── architecture.md
    ├── demo.md
    ├── provenance.md
    └── superpowers/
```

Modules are split by responsibility. Stage implementations consume and return explicit domain contracts; the API and UI never reach into stage internals.

## Domain contract

The supplied `Outcome`, `Layer`, `Verdict`, `Claim`, `Finding`, `CorpusDelta`, `Report`, and `aggregate()` definitions form the initial contract in `schema.py`.

`Claim` gains one contract-first field:

```python
preserve_critical: bool = False
```

This is required because `aggregate()` accepts `critical_claim_ids`, and deriving criticality from prose or risk labels would make the verdict depend on an unreliable heuristic. The structured model response must set this boolean explicitly. `critical_claim_ids` is computed in code from validated claims.

Additional internal stage contracts also live in `schema.py`:

- `RunSpec`: repository URL, base ref, head ref, Layer-B toggle, and command limits.
- `CommandEvidence`: exact argv rendered as a command, exit code, stdout, stderr, duration, and timeout flag.
- `IngestResult`: worktree paths, resolved SHAs, normalized diff, touched symbols, and discovered test commands.
- `BehaviorFixture`: claim ID, target symbol, serialized args/kwargs, and captured base result or exception.
- `RunProgress`: run ID, current stage, message, and elapsed time.

API payloads serialize these contracts without creating a second source of truth.

## Five-stage architecture

### 1. Ingest `[code]`

Ingest validates the repository URL and refs, clones into a run-specific temporary directory, resolves immutable base and head SHAs, creates separate worktrees, captures the diff, discovers Python package metadata, and identifies touched importable symbols through AST analysis.

Only whitelisted executables are permitted: `git`, the configured Python interpreter, and Pytest through `python -m pytest`. Every command uses argv arrays without a shell, a bounded working directory, and a timeout.

The output is `IngestResult`. Failure creates an `UNVERIFIABLE` finding for a synthetic preserve-critical claim such as `system:ingest`, with the failed Git command and captured output.

### 2. Characterize `[model + exec]`

The model receives the normalized diff, touched source excerpts, and the structured `Claim` schema. It may return only validated `Claim` objects. It never returns a verdict, finding outcome, or observed runtime behavior.

Deterministic code inspects the target callable's signature and type hints, selects inputs from a fixed edge catalog, and executes the inputs against the base worktree. The catalog covers booleans, integers around zero and common boundaries, floats, empty and singleton strings, Unicode, `None` where allowed, empty and singleton containers, and small nested combinations.

Base results are stored as `BehaviorFixture` objects. JSON-compatible values and normalized exceptions are supported in the first version. Unsupported imports, side-effect-heavy callables, unserializable values, or exhausted time limits become explicit `UNVERIFIABLE` findings.

### 3. Cross-examine `[exec]`

Layer A always runs first. It replays each base fixture against the head worktree and compares normalized values or exception identities. A preserve-critical difference is `REFUTED`; equality is `VERIFIED`. Existing focused tests and previously pinned corpus checks run alongside the generated fixtures.

Claims describing intended changes are not falsely marked verified merely because behavior changed. Layer A can verify preserved surrounding behavior; intended-change correctness requires a passing executable check or remains `UNVERIFIABLE` until Layer B.

Layer B is additive. It maps supported signatures to bounded Hypothesis strategies and prioritizes high-risk preservation claims. For every generated input, it executes base and head and uses the captured base result as the differential oracle. Hypothesis shrinks any unexplained mismatch to a minimal input. An intended-change claim runs only when an existing executable test or a supported deterministic invariant supplies its oracle; model prose is never treated as the expected result. Claims without an executable oracle become `UNVERIFIABLE` rather than guessed. Failures produce `REFUTED` findings containing the minimal `repro_input`, expected result, actual result, exact command, and captured output.

### 4. Aggregate `[code]`

`aggregate(findings, critical_claim_ids)` remains pure and unchanged in meaning:

- A refuted preserve-critical claim produces `BROKEN`.
- Another refutation or an unverifiable preserve-critical claim produces `RISKY`.
- All other finding sets produce `SAFE`.

The aggregate package imports no model, network, filesystem, subprocess, database, or web framework modules. Tests enforce this boundary as well as the decision table.

### 5. Render `[code]`

The render layer consumes a completed `Report`. A validation boundary rejects any `VERIFIED` or `REFUTED` finding with an empty command or output before persistence or rendering.

The report leads with the verdict, then presents finding counts, corpus growth, and a filterable findings table. Selecting a finding exposes its claim, layer, outcome, exact command, complete captured output, reproducing input, expected value, actual value, and confidence. Claim prose is never presented as independent truth; it is visually attached to executed evidence.

## Corpus persistence

Only `VERIFIED` Layer-A behavioral fixtures are pinned. A corpus record is uniquely identified by a hash of repository identity, target symbol, serialized input, and normalized expected result. Re-running the same check updates provenance without increasing the total.

At the start of a run, applicable pinned checks are loaded and replayed against head. At completion, `CorpusDelta` records both the number newly pinned and the repository total. SQLite migrations are intentionally minimal and versioned in code.

## Run lifecycle

The persisted state machine is:

```text
queued → ingesting → characterizing → capturing → layer_a
       → layer_b → aggregating → complete
```

Layer B may be disabled, in which case the run moves directly from Layer A to Aggregate. Terminal infrastructure failures still create a renderable `RISKY` report through a synthetic preserve-critical system claim.

The server runs one verification job at a time in a background worker. Progress is published to the browser with server-sent events. This deliberately avoids a task queue or distributed worker system during the hackathon.

## Execution and safety boundary

Repositories execute only inside run-specific temporary directories. Commands receive a minimal environment, bounded working directory, per-command timeout, and total 10-minute run budget. Common secret patterns and the OpenAI API key are redacted before output is persisted.

Output is captured completely up to 2 MB per command. Exceeding the limit terminates the command and records `UNVERIFIABLE`; partial output cannot ground `VERIFIED` or `REFUTED`.

The implementation carries this explicit marker:

```python
# hackathon: trusted-input sandbox; prod needs real isolation
```

Judges are instructed to use public repositories they trust. Container orchestration and production-grade isolation are outside this build.

## API design

- `POST /api/runs` validates a `RunSpec`, creates the run, and returns its ID.
- `GET /api/runs` lists recent runs.
- `GET /api/runs/{run_id}` returns progress or the completed report.
- `GET /api/runs/{run_id}/events` streams progress events.
- `GET /api/corpus` returns repository corpus totals and recent additions.
- `GET /api/health` verifies the local service and database.

Mutating endpoints are local-only and do not require authentication. Errors use structured codes and safe messages; detailed execution evidence remains on the relevant finding.

## User experience and visual provenance

The application has three primary destinations: Runs, Corpus, and About.

### New Run

The initial screen asks for repository URL, base ref, and head ref, with one primary action: **Cross-examine PR**. An included hero case can be loaded without typing repository details.

### Live Run

The active run shows the five-stage timeline, elapsed time, current command, and concise stage messages. It does not display speculative verdicts while checks are running.

### Report

The report displays a dominant `SAFE`, `RISKY`, or `BROKEN` status followed by verified, refuted, and unverifiable counts; corpus growth; and the findings table. Evidence opens within the report rather than navigating away, keeping the verdict and receipt visible together.

### Sourced 21st.dev composition

All visible product assets are sourced from 21st.dev and installed with their required dependencies and behavior:

- `arunjdass/dashboard-sidebar`: responsive shell, navigation, workspace frames, Charcoal Ink dark palette, and Alabaster light palette.
- `nyxbui/timeline`: pipeline-stage status and progression.
- `uniquesonu/status-badge-beautiful-accessible-status-indicators`: accessible outcome and run-state badges.
- `ravikatiyar/project-data-table`: findings and run-history tables.
- `vercel/code-block`: exact commands, outputs, and reproducing inputs.

Adaptations are limited to application content, routes, data wiring, import paths, and semantic color tokens. The sourced layout, hierarchy, interactions, responsive behavior, motion, and accessibility states are retained. `docs/provenance.md` records source identifiers, install commands, dependencies, transferred behavior, token changes, and verification evidence.

## Error handling

- Invalid URLs or refs are rejected before a run is queued.
- Clone, checkout, test discovery, import, model API, probe, timeout, and persistence failures are surfaced; none are swallowed.
- Missing `OPENAI_API_KEY` prevents real characterization but does not prevent the clearly labeled included fixture demo.
- Infrastructure failures use synthetic `system:*` preserve-critical claims so they cannot yield `SAFE`.
- User-facing output never includes API keys, authorization headers, or matching secret values.
- The application restarts cleanly and renders previously completed reports from SQLite.

## Demo assets

The repository includes a small hero Python package with two Git histories: a plausible head change introduces a subtle boundary or empty-input regression while preserving normal behavior. The deterministic demo runs the actual pipeline against these refs and ends on a `BROKEN` verdict with a minimal counterexample.

`cross-examine demo --no-open` runs the fixture without opening a browser. `cross-examine serve` starts the application and opens the local UI by default. Sample reports used during early UI development are visibly labeled fixture data and never presented as executed live results.

## Verification strategy

Development follows test-driven implementation. Required coverage includes:

- Decision-table and property tests for `aggregate()`.
- Contract tests for enum serialization, report serialization, refuted filtering, and `preserve_critical` extraction.
- Grounding-invariant tests rejecting blank evidence for verified/refuted findings.
- Temporary-Git-repository integration tests for ingest and ref resolution.
- Mocked Responses API tests proving Characterize emits only validated claims.
- Deterministic probe-selection and base-capture tests.
- Base/head Layer-A replay tests with equal, changed, exception, timeout, and unserializable behavior.
- Hypothesis Layer-B differential tests demonstrating a base-derived oracle and shrinking to a minimal counterexample.
- Corpus pinning, deduplication, and replay tests.
- API validation, report, health, and server-sent-event tests.
- React interaction, keyboard, responsive, and axe accessibility tests.
- Playwright coverage of new run → progress → broken verdict → evidence reveal.
- A judge-facing smoke command that builds the frontend, runs all tests, and executes the hero demo.

## Delivery order

1. Contract, aggregate logic, validation boundary, fake reports, and render skeleton.
2. Ingest with real Git evidence.
3. Characterize with structured claims and real base execution.
4. Layer A end-to-end, including corpus pinning; this is the complete fallback product.
5. Layer B Hypothesis generation and evidence panel.
6. Hero case, unseen-repository trials, hardening, provenance, README, and video assets.

Every delivery step leaves a runnable report path. Layer B never blocks the Layer-A checkpoint.

## Success criteria

The build is complete when a judge can point Cross-Examine at an unseen public Python repository and real base/head refs, then see a verdict whose findings expose exact executed commands and captured output. The scripted hero run must reliably produce at least one refuted finding with a minimal reproducing input. Passing Layer-A checks must visibly grow the repository's pinned corpus.
