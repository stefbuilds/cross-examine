# Build Week demo script — 2:45 maximum

Status: recording plan. Public video URL, platform submission, and final human approval
remain externally blocked.

Record one continuous product story with spoken audio and no music only after its
conditional gates are satisfied. Keep any final upload publicly visible on YouTube and
below three minutes.

Before recording on macOS/Linux, prove the hero twice in one newly allocated workspace:

```bash
demo_workspace=$(mktemp -d)
env -u OPENAI_API_KEY -u CROSS_EXAMINE_DB -u CROSS_EXAMINE_RUNS CROSS_EXAMINE_DEMO_CHARACTERIZER=fixture \
  uv run --isolated --no-editable cross-examine demo --no-open \
  --workspace "$demo_workspace"
env -u OPENAI_API_KEY -u CROSS_EXAMINE_DB -u CROSS_EXAMINE_RUNS CROSS_EXAMINE_DEMO_CHARACTERIZER=fixture \
  uv run --isolated --no-editable cross-examine demo --no-open \
  --workspace "$demo_workspace"
```

The first command must report `BROKEN`, `+2 this run`, total `2`; the repeat must report
`BROKEN`, `+0 this run`, total `2`. Never reuse an existing path merely to force the
first-run output. Never let ambient credentials or database/run-root variables turn
this offline scene into a model request or redirect its supposedly fresh state.

## 0:00–0:35 — the catch

**0:00–0:08** — Show the candidate change inside Cross-Examine. Read the plausible comment: “Avoid sorting when there is nothing to normalize.” State that its existing non-empty test is green.

Voiceover: “Codex can now produce more code than a team can manually review. Cross-Examine is an independent verification harness for the changes it writes.”

**0:08–0:20** — Click **Run offline hero demo**. Keep the live timeline visible through
Ingest, Characterize, Cross-examine, and Aggregate. Say that this offline path uses a
labeled checked-in Claim fixture instead of a model request; its findings still come from
local base/head execution.

**0:20–0:35** — Let the report flip to **BROKEN**. Expand “preserves empty-list normalization” and hold on the receipt: base returned `[]`, head returned `None`, reproducing input `[]`.

Voiceover: “The PR reads like an optimization. The old happy-path test still passes. Cross-Examine executed the boundary the PR forgot and produced the receipt.”

## 0:35–1:25 — why the verdict is trustworthy

**0:35–0:52** — Show the five stages in the UI and the architecture diagram.

Voiceover: “On the live path, GPT-5.6 can read bounded diff and source context, then
propose schema-constrained Claims and optional ProbePlans. They are untrusted and cannot
emit outcomes or verdicts. In this offline hero, the checked-in Claim replaces that one
model call. Cross-Examine captures supported base behavior, replays it against head, and
uses bounded Hypothesis generation on eligible claims.”

**0:52–1:08** — Point to the exact command, captured output, expected value, actual value, and reproducing input.

Voiceover: “Only executed evidence can be verified or refuted. Each newly
pipeline-validated decided finding has an exact command and captured output; an
abstention may show a deterministic diagnostic. A pure function aggregates the
represented findings into SAFE, RISKY, or BROKEN.”

On screen, disclose that legacy or otherwise unvalidated stored reports are not
revalidated on read before the current DB/API/React path; validation-on-read is a P2
integrity gate.

On screen, keep this limitation visible: “SAFE is bounded to characterized, represented,
supported checks—not proof of PR correctness.” Do not say all critical behavior is
covered. Current false-safety, omitted-candidate coverage, semantic validation/read,
corpus-authority, and non-loopback risks remain open.

**1:08–1:25** — Briefly show the pure aggregation test matrix and the model-output schema boundary.

## 1:25–1:50 — repeat evidence without an invented growth claim

Run the hero a second time in the same workspace. Keep the repeated run receipt visible
and show `Corpus: +0 this run · 2 total`.

Voiceover: “The run receipt truthfully separates inserted rows from the stable total. In
development corpus v1, eligible verified Layer-A fixtures replay only by literal
repository locator and symbol.”

Do not use the Corpus page as proof of zero inserted growth. Until P4 fixes the metric,
its latest-run value counts rows touched by the latest run. If the page is shown, call it
“rows observed in the latest run,” not new growth or an ancestry-safe compounding moat.

## 1:50–2:18 — conditional current-pin GPT-5.6 segment

This segment is not currently recordable evidence. Include it only after P2 provides:

- a current product/target pin and fresh independent review;
- passing strict artifact, malformed-claim, replay, render-equality, and redaction gates;
- explicit API-key/spend authority and authorization for at most one Responses request;
- a completed report with the target claim, nonzero usage, valid decided receipts, and no
  system-stage failure; and
- a publishable package that contains no secret or operator filesystem path.

Do not use the historical `python-slugify` manual trial as if it were a current model run,
and never claim that a model has not seen a public change. If any gate is unavailable,
omit this segment and spend the time on the deterministic receipt, bounded-`SAFE` warning,
and explicit blocked status. Do not improvise or retry a paid request.

Conditional voiceover after all gates pass: “GPT-5.6 proposed what deserved scrutiny in
this one authorized current-pin run. Deterministic code still owns outcomes and the
verdict.”

## 2:18–2:45 — Codex collaboration and close

Show the Runs view, then return to the hero receipt.

Voiceover: “I used Codex to build and test the pipeline, UI, bounded host-process
controls, persistence, and configured cross-platform verification path. I made the
product decisions: independence, evidence-grounded decided findings, and abstaining
toward risk. Today the trusted-input runner is local; production needs disposable
network-restricted VMs. Cross-Examine turns a model proposal into inspectable executed
evidence without pretending the current bounded verdict is a universal safety proof.”

## Recording checklist

- Target 2:35–2:45 so YouTube processing or edits cannot push the video over three minutes.
- Capture 1440×1000 light mode for the form and progress timeline.
- Capture both light and dark evidence expansion.
- Include the terminal receipt only if it strengthens the story without exposing a local path.
- Never show an API key, home-directory path, or unredacted environment output.
- Rehearse the credential-cleared, fixture-forced hero in one fresh workspace and repeat
  it in the same workspace to capture `+2/2`, then `+0/2`.
- Record a real GPT-5.6 segment only if every P2 gate above passes; otherwise omit it and
  disclose the block.
- Confirm the final audio explicitly says how Codex and GPT-5.6 were used.
