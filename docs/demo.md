# Three-minute demo script

## The 30-second catch

**0:00–0:06** — Show the hero PR. Read the plausible comment: “Avoid sorting when there is nothing to normalize.” The existing non-empty test is green.

**0:06–0:12** — Click **Run offline hero demo**. Keep the live stage timeline visible long enough to establish that the checked-in characterization is labeled and the real code is executing.

**0:12–0:20** — Let the report flip to **BROKEN**. Click “preserves empty-list normalization.”

**0:20–0:30** — Hold on the receipt: exact Python probe command, base returned `[]`, head returned `None`, reproducing input `[]`.

Voiceover: “The PR reads like an optimization. The old happy-path test still passes. Cross-Examine executed the boundary the PR forgot and produced the receipt.”

## Independence and technical spine

**0:30–0:48** — Show the five stages in the UI, then the small architecture diagram.

Say verbatim:

> “Codex authors the change; Cross-Examine independently characterizes the prior behavior, executes the new code against it, and hunts adversarial edge cases — grounding every verdict in a reproducible counterexample.”

**0:48–1:08** — Explain that GPT-5.6 Sol may emit only strict claims; execution emits findings; pure `aggregate()` emits the verdict. Show the aggregate unit test matrix briefly.

**1:08–1:28** — Explain Layer A base capture/head replay, Layer B Hypothesis generation and shrinking, and the separately grounded repository-test finding. Point to the command and output fields, not prose.

## State moat

**1:28–1:50** — Run the hero a second time. Open Corpus and show that passing neighboring behaviors are replayed but deduplicated. Say: “Run N is safer because it carries the verified behavior from runs 1 through N−1.”

## Live repository and impact

**1:50–2:25** — Submit the selected unseen public Python change with Layer B off. Show a renderable Layer-A report first; then enable Layer B if the trial is compatible.

**2:25–2:42** — State the safety boundary: trusted repositories execute locally today; production moves the same contract into disposable isolated VMs.

**2:42–3:00** — Return to the hero receipt. Close with: “Agents can write more code than humans can review. Cross-Examine turns trust from an opinion into an executed artifact.”

## Recording checklist

- Capture 1440×1000 light mode for the form and progress timeline.
- Capture both light and dark evidence expansion.
- Keep the terminal visible for `cross-examine demo --no-open` and its `BROKEN` line.
- Never show an API key, home-directory path, or unredacted environment output.
- Record the hero and unseen-repository runs before editing the voiceover.
