# OpenAI Build Week submission package

## Category

Developer Tools

## Project title

Cross-Examine

## Tagline

Codex writes the code. Cross-Examine puts it on the stand.

## Short description

Cross-Examine is an independent, execution-grounded verification harness for
Codex-authored Python changes. GPT-5.6 proposes schema-constrained Claims and optional
ProbePlans from bounded diff/source context; model-free bounded execution captures the
base revision and replays supported checks against the candidate. Deterministic code
assigns outcomes and the product verdict. Every newly pipeline-validated `VERIFIED` or
`REFUTED` finding retains its exact command and captured output; abstentions show
attempted evidence or a deterministic diagnostic. Legacy or otherwise unvalidated stored
reports are not revalidated on read, so a database written by an older build can render
without those guarantees.

## Inspiration

Coding agents can produce changes faster than people can deeply review them. Most AI review tools answer that problem with another model opinion, leaving the same system that helped write the code responsible for declaring it safe. We wanted an independent witness: a process that treats model output as a hypothesis, executes the code, and refuses to claim safety without evidence.

## What it does

Cross-Examine resolves two Git revisions into separate detached worktrees and catalogues
candidate definitions in changed Python files. GPT-5.6 may emit only untrusted
schema-constrained Claims and optional ProbePlans; it cannot emit findings, outcomes, or
verdicts. Layer A captures base behavior and replays the same inputs against head. Layer B
runs a bounded Hypothesis search with shrinking over preserve-critical claims. Existing
repository tests run against both revisions, so pre-existing setup failures are never
misreported as regressions.

Every decided finding includes an exact command and captured output. A pure
deterministic function aggregates those findings into `SAFE`, `RISKY`, or `BROKEN`.
Corpus v1 persists verified Layer-A fixtures and replays them by repository locator and
symbol. Critical abstentions resolve toward risk rather than safety.

> **`SAFE` means bounded, not proven.** It reports that nothing was refuted among the
> checks that actually ran — not that the pull request is correct.

The offline hero demonstrates a plausible optimization that returns `None` for an empty list while its existing happy-path test remains green. Cross-Examine reports BROKEN and produces `[]` as the minimal reproducing input.

## How we built it

The product is tested on Python 3.12 and packaged with metadata that currently permits
`>=3.12`. It uses FastAPI, SQLite, React, bounded host subprocess execution, Git
worktrees, Hypothesis, and the OpenAI Responses API with structured Pydantic output. The
frontend renders the verdict, findings, and command/output receipts.

GPT-5.6 Sol receives bounded diff and source context and proposes behavioral claims. Codex accelerated implementation across the pipeline, tests, CLI, process controls, persistence, UI integration, packaging, documentation, and cross-platform diagnosis. The human retained the core product decisions: the independent-process boundary, evidence-only verdicts, risk policy, Python-only Build Week scope, and final narrative.

## Challenges

The hardest boundary was preventing plausible model output from becoming an oracle.
Cross-Examine structurally validates proposals against catalogued candidates and assigns
outcomes through deterministic code. Historical real-repository shadow trials exposed platform
encoding differences, dependency-caused test failures, and worktree cache behavior;
those became regression tests rather than hidden demo caveats.

Executing a repository is also a security boundary. This Build Week harness is explicit
about trusted input, removes secret-shaped environment names, uses argument vectors
without a shell, constrains top-level harness executable basenames, caps output, and
enforces deadlines. Target code retains local filesystem/network and child-process
authority; cleanup is best effort. Production requires disposable, network-restricted
execution environments.

## Accomplishments

- A working five-stage development pipeline: Ingest, Characterize, Cross-examine,
  Aggregate, and Render.
- Command/output receipts on every pipeline-validated `VERIFIED` and `REFUTED` finding.
- Bounded Hypothesis search and shrinking for supported preserve-critical claims.
- A pure, model-free verdict function with conservative abstention semantics.
- A locator/symbol-scoped development corpus for eligible Layer-A fixtures.
- A credential-cleared offline fixture demo plus a schema-constrained GPT-5.6 adapter.
- CI running Python 3.12 and Node 20 on Windows, macOS, and Ubuntu.

## What we learned

Trustworthy agentic development needs separation of duties. Models are valuable at identifying what deserves scrutiny, but execution must own the evidence and deterministic policy must own the verdict. We also learned that an honest `UNVERIFIABLE` result is a product feature: setup failures and unsupported behavior should be visible rather than quietly converted into confidence.

## What's next

The next milestones are disposable, network-restricted target isolation so untrusted
repositories can be verified safely; a deterministic setup contract so dependency
installation is part of the evidence; corpus v2 with Git ancestry rather than locator
replay; and intended-change oracles so a claim about new behavior can be executed instead
of abstained on. Beyond Python is a longer horizon: the probe protocol and symbol
discovery are language-specific.

## Technology

Python, FastAPI, SQLite, OpenAI Responses API, GPT-5.6 Sol, Pydantic, Hypothesis, pytest, Git worktrees, React, TypeScript, Vite, Tailwind CSS, Playwright, and Codex.

## Testing access

- Public evidence explorer: `https://cross-examine-six.vercel.app`
- Real offline hero: use the credential-cleared, fixture-forced, fresh-workspace command
  in the [README](../README.md#judge-quickstart-see-the-catch-in-60-seconds)
- Product UI after local installation: `uv run cross-examine serve`

The public deployment serves a visibly labeled checked-in evidence fixture so the report
UI can be inspected without an install. Repository execution needs Git and a local
runtime, so it runs in the local runner by design.

## Final submission checklist

- [ ] Join the Developer Tools category.
- [ ] Add the public repository: `https://github.com/stefbuilds/cross-examine`.
- [x] Add the deployed judge-demo URL: `https://cross-examine-six.vercel.app`.
- [ ] Upload the final 2:45-or-shorter video publicly to YouTube and add its URL.
- [ ] Run `/feedback` in the Codex task containing the majority of the core implementation and add that session ID.
- [ ] Confirm the video audio explicitly explains both Codex collaboration and GPT-5.6 runtime use.
- [x] Confirm the repository contains the MIT license, quickstart, sample hero data, platform support, and testing instructions.
- [ ] Submit before July 21, 2026 at 5:00 PM Pacific Time.
- [ ] Keep the demo and repository available without charge through the end of judging on August 7, 2026.
