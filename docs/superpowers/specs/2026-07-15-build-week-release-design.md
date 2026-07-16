# Build Week Release Design

> **Historical design record.** Written 2026-07-15/16 during the build. It describes intent at the time, not current behavior, and contains claims now superseded by the implementation. For current architecture see [docs/architecture.md](../../architecture.md). Retained for provenance.

## Objective

Make Cross-Examine reliably installable, judge-testable, and submission-ready for the OpenAI Build Week Developer Tools track without changing its five-stage product contract or visual design.

## Release architecture

The Python package remains the source of truth for the verification pipeline and ships the built React application as package data. A clean installation must expose the `cross-examine` command and must allow its isolated probe subprocesses to import every `cross_examine` subpackage. The offline hero run is the release smoke test because it exercises ingestion, characterization fixture labeling, both verification layers, aggregation, persistence, and the judge-visible receipt without credentials.

The hosted judge experience is a deliberately bounded evidence explorer. It serves a visibly labeled checked-in fixture; arbitrary repositories and the executable hero remain local-only because Vercel Functions provide neither Git nor the durable, isolated execution environment required for repository analysis. The UI and README must state that boundary plainly.

## Deliverables

1. A packaging regression test that builds a wheel, installs it into an isolated environment, and proves the CLI and hero demo work from outside the source tree.
2. Correct wheel contents and package data, with no installed namespace-package collision.
3. CI on Ubuntu, macOS, and Windows for Python 3.12 plus a Node 20 frontend job.
4. An MIT license and public-repository licensing metadata.
5. A judge-first README covering the 60-second demo path, supported platforms, Codex/GPT-5.6 collaboration, testing, and the local/hosted safety boundary.
6. Submission assets: final Devpost copy, a sub-three-minute shot list and voiceover, and a checklist for the `/feedback` session ID and public YouTube URL.
7. A deployment configuration that serves the packaged UI and labeled evidence fixture, followed by a preview deployment only if the existing Vercel account is authenticated and the runtime smoke test passes.

## Error handling and safety

Clean-install failures must fail CI before the hero demo begins. Hosted arbitrary-repository submissions must be rejected with an explicit local-only explanation; they must never silently queue work that the serverless platform cannot execute safely. The hosted fixture must identify its source in the report. Missing API credentials continue to permit the real, visibly labeled offline hero characterization locally.

## Verification

The release gate is: clean wheel install, complete backend suite, Ruff, frontend unit/accessibility tests, production frontend build, packaged browser receipt test where Chrome is available, and the offline hero receipt showing `BROKEN` with `[]` as the reproducing input. Deployment is considered usable only after its health endpoint, root UI, labeled fixture endpoint, and arbitrary-run rejection are exercised anonymously over the deployed URL.
