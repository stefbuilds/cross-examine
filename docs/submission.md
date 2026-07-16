# OpenAI Build Week submission package

## Category

Developer Tools

## Project title

Cross-Examine

## Tagline

Codex writes the code. Cross-Examine puts it on the stand.

## Short description

Cross-Examine is an independent, execution-grounded verification harness for Codex-authored Python changes. GPT-5.6 proposes strict behavioral claims from the diff and source context; deterministic code captures the base revision, replays identical inputs against the candidate, hunts adversarial boundaries, and renders the exact command and output behind every SAFE, RISKY, or BROKEN verdict.

## Inspiration

Coding agents can produce changes faster than people can deeply review them. Most AI review tools answer that problem with another model opinion, leaving the same system that helped write the code responsible for declaring it safe. We wanted an independent witness: a process that treats model output as a hypothesis, executes the code, and refuses to claim safety without evidence.

## What it does

Cross-Examine resolves two Git revisions into separate detached worktrees and discovers the changed Python symbols. GPT-5.6 may emit only validated `Claim` objects; it cannot emit findings or verdicts. Layer A captures the base behavior and replays the same inputs against the head. Layer B uses bounded Hypothesis generation and shrinking to search for minimal counterexamples. Existing repository tests run against both revisions so pre-existing setup failures are not misreported as regressions.

Every verified or refuted finding includes an exact command and captured output. A pure deterministic function aggregates findings into SAFE, RISKY, or BROKEN, and verified behavior is pinned into a persistent corpus for later runs. If preserve-critical behavior cannot be executed, Cross-Examine resolves toward risk rather than safety.

The offline hero demonstrates a plausible optimization that returns `None` for an empty list while its existing happy-path test remains green. Cross-Examine reports BROKEN and produces `[]` as the minimal reproducing input.

## How we built it

The product is a Python 3.12 package with a FastAPI API, SQLite persistence, a React interface, bounded subprocess execution, Git worktrees, Hypothesis-powered differential testing, and the OpenAI Responses API with structured Pydantic output. The frontend renders the persisted report contract and never invents model prose around a verdict.

GPT-5.6 Sol receives bounded diff and source context and proposes behavioral claims. Codex accelerated implementation across the pipeline, tests, CLI, process controls, persistence, UI integration, packaging, documentation, and cross-platform diagnosis. The human retained the core product decisions: the independent-process boundary, evidence-only verdicts, risk policy, Python-only Build Week scope, and final narrative.

## Challenges

The hardest boundary was preventing plausible model output from becoming an oracle. Cross-Examine validates every claim against discovered symbols and assigns all outcomes through execution. Real-repository trials also exposed platform encoding differences, dependency-caused test failures, and worktree cache behavior; those became regression tests rather than hidden demo caveats.

Executing a repository is also a security boundary. This Build Week release is explicit about trusted input, removes secrets from child environments, uses argument vectors without a shell, restricts executables, caps output, enforces deadlines, and terminates process trees. Production requires disposable, network-restricted execution environments.

## Accomplishments

- A complete five-stage pipeline: Ingest, Characterize, Cross-examine, Aggregate, and Render.
- Evidence receipts for every verified or refuted claim.
- Minimal adversarial counterexamples through Hypothesis shrinking.
- A pure, model-free verdict function with conservative abstention semantics.
- A persistent, deduplicated behavior corpus that compounds across runs.
- A deterministic offline demo plus a real-repository path using GPT-5.6.
- Cross-platform release checks for Windows, macOS, and Ubuntu.

## What we learned

Trustworthy agentic development needs separation of duties. Models are valuable at identifying what deserves scrutiny, but execution must own the evidence and deterministic policy must own the verdict. We also learned that an honest `UNVERIFIABLE` result is a product feature: setup failures and unsupported behavior should be visible rather than quietly converted into confidence.

## What's next

Production requires disposable VMs with network denial and resource quotas, plus explicit executable oracles for intended behavior changes. Those controls preserve the same report contract and evidence receipts.

## Technology

Python, FastAPI, SQLite, OpenAI Responses API, GPT-5.6 Sol, Pydantic, Hypothesis, pytest, Git worktrees, React, TypeScript, Vite, Tailwind CSS, Playwright, and Codex.

## Testing access

- Public evidence explorer: `https://cross-examine-six.vercel.app`
- Real offline hero: `uv run --isolated --no-editable cross-examine demo --no-open`
- Product UI after local installation: `uv run cross-examine serve`

The public deployment intentionally serves a visibly labeled checked-in evidence fixture. Arbitrary repositories execute only in the trusted-input local runner because the hosted serverless environment is not a repository sandbox.

## Final submission checklist

- [ ] Join the Developer Tools category.
- [ ] Add the public repository: `https://github.com/stefbuilds/cross-examine`.
- [x] Add the deployed judge-demo URL: `https://cross-examine-six.vercel.app`.
- [ ] Upload the final 2:45-or-shorter video publicly to YouTube and add its URL.
- [ ] Run `/feedback` in the Codex task containing the majority of the core implementation and add that session ID.
- [ ] Confirm the video audio explicitly explains both Codex collaboration and GPT-5.6 runtime use.
- [ ] Confirm the repository contains the MIT license, quickstart, sample hero data, platform support, and testing instructions.
- [ ] Rehearse a real GPT-5.6 run on the chosen unfamiliar Python change before recording.
- [ ] Submit before July 21, 2026 at 5:00 PM Pacific Time.
- [ ] Keep the demo and repository available without charge through the end of judging on August 7, 2026.
