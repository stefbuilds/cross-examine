# Build Week Release Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Cross-Examine clean-installable, cross-platform verified, judge-testable, and ready for the OpenAI Build Week submission.

**Architecture:** Preserve the Python pipeline and packaged React UI. Prove the distributed wheel from outside the checkout, use the deterministic hero as the release smoke test, and keep hosted execution bounded to that trusted fixture while arbitrary repositories remain local-only.

**Tech Stack:** Python 3.12, Hatchling, uv, pytest, FastAPI, React, Node 20, GitHub Actions, Vercel Functions

## Global Constraints

- Preserve Ingest, Characterize, Cross-examine, Aggregate, and Render.
- Verified or refuted findings require exact command and captured output.
- `aggregate()` remains pure.
- Python repositories only during Build Week.
- Hosted mode serves only the visibly labeled checked-in evidence fixture.
- Do not modify visual design files while the user is working on design.

---

### Task 1: Clean wheel installation

**Files:**
- Create: `tests/release/test_wheel_install.py`
- Modify: `pyproject.toml`

**Interfaces:**
- Consumes: the `cross-examine` console script and packaged hero source.
- Produces: a wheel that imports `cross_examine.cli` and all probe-worker modules.

- [x] Write release tests for the editable judge quickstart and an isolated wheel installation that imports the worker modules and runs the offline hero.
- [x] Run the editable test and confirm the current installation fails outside the checkout.
- [x] Correct the Hatchling package-data configuration without changing runtime behavior.
- [x] Run the release tests and focused Layer A/Layer B/API tests until they pass.

### Task 2: Cross-platform CI and licensing

**Files:**
- Create: `.github/workflows/verify.yml`
- Create: `LICENSE`
- Modify: `pyproject.toml`

**Interfaces:**
- Consumes: existing backend/frontend verification commands.
- Produces: Python 3.12 checks on Ubuntu, macOS, and Windows and frontend checks on Node 20.

- [x] Add MIT project metadata and the complete MIT license text.
- [x] Add backend matrix jobs that run Ruff, pytest, the clean-wheel test, and the offline hero.
- [x] Add a Node 20 frontend job that runs clean install, tests, lint, production build, and Playwright.
- [x] Validate the workflow syntax and run every locally available command.

### Task 3: Judge-first documentation and submission package

**Files:**
- Modify: `README.md`
- Create: `docs/submission.md`
- Modify: `docs/demo.md`

**Interfaces:**
- Consumes: the real product behavior and official Build Week requirements.
- Produces: setup/testing instructions, supported platforms, collaboration evidence, Devpost copy, and a timed video script.

- [x] Put a 60-second offline judge path and platform support before architectural detail.
- [x] Explain how Codex and GPT-5.6 were used and distinguish human decisions from Codex implementation.
- [x] Add exact local real-repository instructions and the trusted-input boundary.
- [x] Write final Devpost description copy and a submission checklist; leave only YouTube and `/feedback` values for the user.
- [x] Tighten the video script to 2:45 with explicit Codex and GPT-5.6 narration.

### Task 4: Bounded hosted demo and deployment

**Files:**
- Modify: `api/index.py`
- Modify: `src/cross_examine/api/app.py`
- Create or modify: `vercel.json`
- Test: `tests/integration/test_api_jobs.py`

**Interfaces:**
- Consumes: `POST /api/hero-runs` and the packaged frontend.
- Produces: a serverless-safe evidence explorer and explicit rejection of arbitrary hosted repository runs.

- [x] Write an API test for hosted mode that serves a visibly labeled evidence fixture and rejects arbitrary repository execution with a local-only explanation.
- [x] Run it and confirm the hosted-mode behavior is absent.
- [x] Add the smallest hosted-mode configuration and rejection boundary.
- [x] Run focused API tests.
- [x] Create a preview deployment; smoke-test health, root UI, labeled fixture, and rejection; promote it; and repeat the anonymous production smoke test.

### Task 5: Full release verification

**Files:**
- Modify only files required to fix failures discovered by the release gate.

**Interfaces:**
- Consumes: all earlier deliverables.
- Produces: fresh evidence for the judge-facing release status.

- [x] Run Ruff and the entire backend suite.
- [x] Run the offline hero and confirm `BROKEN`, `preserve-empty`, and `[]`.
- [x] Run frontend unit tests, lint, and production build under Node 20.19.
- [x] Run the packaged Playwright flow with bundled Chromium.
- [x] Review `git diff`, scan documentation for stale claims, and report any external submission values still required from the user.
