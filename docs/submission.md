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
assigns outcomes and the product verdict. Every `VERIFIED` or `REFUTED` finding retains
its exact command and captured output; abstentions show attempted evidence or a
deterministic diagnostic.

## Inspiration

Coding agents can produce changes faster than people can deeply review them. Most AI review tools answer that problem with another model opinion, leaving the same system that helped write the code responsible for declaring it safe. We wanted an independent witness: a process that treats model output as a hypothesis, executes the code, and refuses to claim safety without evidence.

## What it does

Cross-Examine resolves two Git revisions into separate detached worktrees and catalogues
candidate definitions in changed Python files. That file-level discovery is broader than
execution eligibility: classes, async functions, generators, unsupported signatures, and
unsupported or ambiguous values are not currently probed. GPT-5.6 may emit only untrusted
schema-constrained Claims and optional ProbePlans; it cannot emit findings, outcomes, or
verdicts, and complete candidate coverage is not yet enforced. Layer A captures supported
base behavior and replays the same inputs against head. Layer B uses a bounded Hypothesis
search and shrinking for supported preserve-critical claims without plans; exhaustion is
not proof. Existing repository tests run against both revisions so recognized pre-existing
setup failures are not misreported as regressions.

Every decided finding includes an exact command and captured output. A pure deterministic
function aggregates the represented findings into `SAFE`, `RISKY`, or `BROKEN`. Corpus v1
persists eligible verified Layer-A fixtures for literal repository-locator and symbol
replay; it has no Git-identity/ancestry authority or inherited-base revalidation.
Represented critical abstentions resolve toward risk rather than safety.

> **Bounded-`SAFE` warning:** `SAFE` means no critical refutation or critical abstention
> among characterized, represented, supported findings. It is not proof of PR correctness.
> Current blockers include a model-controlled non-critical preservation mismatch, omitted
> candidate coverage, incomplete semantic report/read validation, mutable locator-only
> corpus authority and non-atomic completion, plus an unenforced loopback-only posture
> that makes unauthenticated non-loopback serving unsafe.

The offline hero demonstrates a plausible optimization that returns `None` for an empty list while its existing happy-path test remains green. Cross-Examine reports BROKEN and produces `[]` as the minimal reproducing input.

## How we built it

The product is tested on Python 3.12 and packaged with metadata that currently permits
`>=3.12`. It uses FastAPI, SQLite, React, bounded host subprocess execution, Git
worktrees, Hypothesis, and the OpenAI Responses API with structured Pydantic output. The
frontend renders the current verdict/finding and command/output/receipt subset; generic
finding provenance and execution manifests are not yet persisted and rendered end to end.

GPT-5.6 Sol receives bounded diff and source context and proposes behavioral claims. Codex accelerated implementation across the pipeline, tests, CLI, process controls, persistence, UI integration, packaging, documentation, and cross-platform diagnosis. The human retained the core product decisions: the independent-process boundary, evidence-only verdicts, risk policy, Python-only Build Week scope, and final narrative.

## Challenges

The hardest boundary was preventing plausible model output from becoming an oracle.
Cross-Examine structurally validates proposals against catalogued candidates and assigns
outcomes through deterministic code, but one-claim-per-candidate coverage remains an
explicit integrity gate. Historical real-repository shadow trials exposed platform
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
- Command/output receipts for every `VERIFIED` or `REFUTED` finding.
- Bounded Hypothesis search and shrinking for supported preserve-critical claims.
- A pure, model-free verdict function with conservative abstention semantics.
- A locator/symbol-scoped development corpus for eligible Layer-A fixtures.
- A credential-cleared offline fixture demo plus a GPT adapter whose current-pin paid
  evidence remains conditional on P2 gates.
- CI configured for Python 3.12 and Node 20 on Windows, macOS, and Ubuntu; an immutable
  green matrix run is not yet cited.

## What we learned

Trustworthy agentic development needs separation of duties. Models are valuable at identifying what deserves scrutiny, but execution must own the evidence and deterministic policy must own the verdict. We also learned that an honest `UNVERIFIABLE` result is a product feature: setup failures and unsupported behavior should be visible rather than quietly converted into confidence.

## What's next

The executable roadmap first closes known false-`SAFE`, complete-coverage, semantic
validation/read validation, aggregation-recursion, and lossy-value integrity paths.
P3 then aligns non-loopback and timeout policy before adding deterministic setup; P4 adds
corpus v2, P5 intended oracles, P6 a development benchmark, and P7 new value families
only after P4 and P6. P8 repeats a broader adversarial sweep before P9 release work.
Disposable target isolation, evaluator truth, lifecycle signing, intended approval,
paid-model spend, publication, and final human approval remain separate external gates.
See the [executable roadmap](2026-07-18-ordered-implementation-roadmap.md).

## Technology

Python, FastAPI, SQLite, OpenAI Responses API, GPT-5.6 Sol, Pydantic, Hypothesis, pytest, Git worktrees, React, TypeScript, Vite, Tailwind CSS, Playwright, and Codex.

## Testing access

- Public evidence explorer: `https://cross-examine-six.vercel.app`
- Real offline hero: use the credential-cleared, fixture-forced, fresh-workspace command
  in the [README](../README.md#judge-quickstart-see-the-catch-in-60-seconds)
- Product UI after local installation: `uv run cross-examine serve`

The public deployment intentionally serves a visibly labeled checked-in evidence fixture.
Its generator test checks semantic fields, not byte identity. Arbitrary repositories
execute only in the trusted-input local runner because the hosted serverless environment
is not a repository sandbox.

Current release evidence is deliberately scoped: wheel install/hero smoke exists but
sdist smoke does not; frontend verification includes focused component tests, one axe
smoke with contrast disabled, and two Chromium flows rather than accessibility or
cross-browser compliance.

## Final submission checklist

- [ ] Join the Developer Tools category.
- [ ] Add the public repository: `https://github.com/stefbuilds/cross-examine`.
- [x] Add the deployed judge-demo URL: `https://cross-examine-six.vercel.app`.
- [ ] Upload the final 2:45-or-shorter video publicly to YouTube and add its URL.
- [ ] Run `/feedback` in the Codex task containing the majority of the core implementation and add that session ID.
- [ ] Confirm the video audio explicitly explains both Codex collaboration and GPT-5.6 runtime use.
- [x] Confirm the repository contains the MIT license, quickstart, sample hero data, platform support, and testing instructions.
- [ ] Include a current-pin GPT-5.6 segment only if P2 offline tooling, independent
  review, API-key/spend authority, and the explicit one-request gate all pass; otherwise
  keep the video on deterministic evidence and state the block.
- [ ] Submit before July 21, 2026 at 5:00 PM Pacific Time.
- [ ] Keep the demo and repository available without charge through the end of judging on August 7, 2026.
