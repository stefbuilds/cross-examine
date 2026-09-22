# Demo script — 2:38

One continuous product story, spoken audio, no music. Public YouTube upload under three
minutes. The audio must explicitly cover how both Codex and GPT-5.6 were used.

## Before recording

Prove the hero twice in one newly allocated workspace, with credentials cleared and the
fixture forced:

```bash
demo_workspace=$(mktemp -d)
env -u OPENAI_API_KEY -u CROSS_EXAMINE_DB -u CROSS_EXAMINE_RUNS CROSS_EXAMINE_DEMO_CHARACTERIZER=fixture \
  uv run --isolated --no-editable cross-examine demo --no-open \
  --workspace "$demo_workspace"
env -u OPENAI_API_KEY -u CROSS_EXAMINE_DB -u CROSS_EXAMINE_RUNS CROSS_EXAMINE_DEMO_CHARACTERIZER=fixture \
  uv run --isolated --no-editable cross-examine demo --no-open \
  --workspace "$demo_workspace"
```

The first run must report `BROKEN`, `+2 this run`, total `2`; the repeat must report
`BROKEN`, `+0 this run`, total `2`. Never reuse an existing path to force the first-run
output, and never let ambient credentials or database/run-root variables turn this offline
scene into a model request.

Record the on-screen story from the product UI rather than the terminal. Serve from a
short path so the run history table fits and no home-directory path appears on camera:

```bash
rm -rf /tmp/ce-live && mkdir -p /tmp/ce-live
cd /tmp/ce-app && env -u OPENAI_API_KEY \
  CROSS_EXAMINE_DEMO_CHARACTERIZER=fixture \
  CROSS_EXAMINE_DB=/tmp/ce-live/cross-examine.db \
  CROSS_EXAMINE_RUNS=/tmp/ce-live/runs \
  UV_CACHE_DIR=/tmp/ce-uv \
  uv run cross-examine serve --port 8435
```

Reset `/tmp/ce-live` before every take, or the corpus line reads `+0` when the story needs
`+2`. Browser at 1440×900, light mode, bookmarks hidden, notifications off.

## Shot list and voiceover

**0:00–0:19 — the problem.** `/run` page, top.

> Codex can write more code than any team can review. And the tests pass — because they
> test the code it just wrote. Nothing checks whether the behavior that code *replaced*
> still holds. So the model fixes one bug, introduces another, and the suite stays green
> the whole time.

**0:19–0:34 — start the run.** Scroll to the bottom of the form, click **Run offline hero
demo**.

> Here's a pull request that looks like a clean optimization — skip the sort when there's
> nothing to normalize. Its existing test passes. This is Cross-Examine running against it.

**0:34–0:52 — the verdict.** Report loads; hold on `BROKEN` and the title.

> It captured how the base revision actually behaves, replayed those exact inputs against
> the new code, and this is the verdict. Broken. And it's not an opinion.

**0:52–1:16 — the receipt.** Expand the `REFUTED` / `behavioral_diff` finding. Hold on
the exact command, then base output versus head output.

> The empty list. Base returned an empty list. Head returned None. That's the exact
> command it ran, the captured output from both revisions, and the input that reproduces
> it. Every conclusion in this report opens to its receipt.

**1:16–1:41 — independence.** The architecture diagram in the README, panned slowly.

> That verdict is trustworthy because of what isn't allowed to produce it. The model
> proposes claims — schema-constrained, and never an outcome or a verdict. Everything that
> decides anything is model-free: real execution in detached Git worktrees, plus a bounded
> property search for edge cases. A pure function with no I/O turns those findings into
> safe, risky, or broken.

**1:41–1:53 — the repeat run.** Click **Run offline hero demo** again; point at
`+0 this run · 2 total`.

> Run it again and the receipt stays honest about itself — zero new rows this run, two
> total. It reports what it actually inserted, not a number that flatters the demo.

Do not present the Corpus page as proof of zero inserted growth; its latest-run value
counts rows touched by the latest run. If the page appears, call it "rows observed in the
latest run."

**1:53–2:22 — Codex and GPT-5.6.** Required narration. Scroll the README section.

> I used Codex to build this entire system — the Python pipeline, the schema and
> validation layer, execution controls, SQLite persistence, the FastAPI service, the React
> evidence explorer, and the cross-platform verification scripts. It also caught real
> defects I'd have shipped: child Python inheriting Windows cp1252 encoding, and a pytest
> cache failure in detached worktrees. I made the product decisions — independence,
> evidence before conclusions, abstain toward risk. GPT-5.6 has exactly one job at
> runtime: read the diff and propose which claims deserve testing. It never decides.

**2:22–2:38 — scope and close.** The scope section, then back to the report.

> And safe here means bounded — no refutation among the checks it actually ran. Not proof
> the pull request is correct. That honesty is the point. If agents are going to write
> most of our code, the verdict on that code has to come from execution — not from another
> model's opinion.

## Checklist

- Target 2:35–2:45 so encoding or edits cannot push the video over three minutes.
- Capture 1440×900 in light mode.
- Never show an API key, a home-directory path, or unredacted environment output.
- Rehearse the fresh-workspace hero and its repeat to capture `+2/2`, then `+0/2`.
- Confirm the final audio explicitly says how Codex and GPT-5.6 were used.
