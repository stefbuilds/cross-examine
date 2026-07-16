# Build Week demo script — 2:45 maximum

Record one continuous product story with spoken audio and no music. Keep the final upload publicly visible on YouTube and below three minutes.

## 0:00–0:35 — the catch

**0:00–0:08** — Show the candidate change inside Cross-Examine. Read the plausible comment: “Avoid sorting when there is nothing to normalize.” State that its existing non-empty test is green.

Voiceover: “Codex can now produce more code than a team can manually review. Cross-Examine is an independent verification harness for the changes it writes.”

**0:08–0:20** — Click **Run offline hero demo**. Keep the live timeline visible through Ingest, Characterize, Cross-examine, and Aggregate.

**0:20–0:35** — Let the report flip to **BROKEN**. Expand “preserves empty-list normalization” and hold on the receipt: base returned `[]`, head returned `None`, reproducing input `[]`.

Voiceover: “The PR reads like an optimization. The old happy-path test still passes. Cross-Examine executed the boundary the PR forgot and produced the receipt.”

## 0:35–1:25 — why the verdict is trustworthy

**0:35–0:52** — Show the five stages in the UI and the architecture diagram.

Voiceover: “GPT-5.6 reads the bounded diff and source context, then proposes strict behavioral claims. It cannot emit findings or verdicts. Cross-Examine captures the base behavior, replays identical inputs against the head, and uses bounded Hypothesis generation to shrink failures.”

**0:52–1:08** — Point to the exact command, captured output, expected value, actual value, and reproducing input.

Voiceover: “Only executed evidence can be verified or refuted. A pure deterministic function aggregates those findings into SAFE, RISKY, or BROKEN. If a critical behavior cannot be verified, the result moves toward risk—never toward safety.”

**1:08–1:25** — Briefly show the pure aggregation test matrix and the model-output schema boundary.

## 1:25–1:50 — evidence that compounds

Run the hero a second time. Open Corpus and show verified neighboring behavior being replayed without duplicate growth.

Voiceover: “Verified behavior is pinned into a persistent corpus. Run N carries the evidence learned in runs one through N minus one, so the safety net compounds as agents keep working.”

## 1:50–2:18 — real GPT-5.6 run

Use the rehearsed `python-slugify` change with GPT-5.6 characterization enabled:

```powershell
$env:OPENAI_API_KEY = "..."
uv pip install -e . text-unidecode
uv run --no-sync cross-examine run https://github.com/un33k/python-slugify.git --base 45f9d33 --head 1ef698f --no-layer-b
```

After the run completes, open the persisted report in the local product with `uv run --no-sync cross-examine serve`, then select the newest run in Runs. Show its schema-constrained claims, progress, and grounded report. Record a fresh successful run before filming; do not expose the API key or local filesystem path.

Voiceover: “This is GPT-5.6 proposing what deserves scrutiny on a change it has not seen before. The verdict still belongs to execution.”

## 2:18–2:45 — Codex collaboration and close

Show the Runs view, then return to the hero receipt.

Voiceover: “I used Codex to build and test the pipeline, UI, bounded host-process controls, persistence, and cross-platform release path. I made the product decisions: independence, evidence-only verdicts, and abstaining toward risk. Today the trusted-input runner is local; production moves execution into disposable network-restricted VMs. Cross-Examine turns trust in agent-written code from an opinion into an executed artifact.”

## Recording checklist

- Target 2:35–2:45 so YouTube processing or edits cannot push the video over three minutes.
- Capture 1440×1000 light mode for the form and progress timeline.
- Capture both light and dark evidence expansion.
- Include the terminal receipt only if it strengthens the story without exposing a local path.
- Never show an API key, home-directory path, or unredacted environment output.
- Record and rehearse the hero and real GPT-5.6 runs before editing the voiceover.
- Confirm the final audio explicitly says how Codex and GPT-5.6 were used.
