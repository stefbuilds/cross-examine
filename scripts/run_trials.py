"""Optional networked compatibility matrix with explicitly non-model trial claims."""

from __future__ import annotations

import json
import time
from collections import Counter
from dataclasses import asdict
from pathlib import Path

from cross_examine.corpus.repository import CorpusRepository
from cross_examine.persistence.database import Database
from cross_examine.pipeline import Pipeline
from cross_examine.schema import Claim, RunProgress, RunSpec

TRIALS = [
    {
        "name": "python-slugify typing-only change",
        "repo": "https://github.com/un33k/python-slugify.git",
        "base": "45f9d33a3a0d7302120d2dde26fa2ac6131edb6b",
        "head": "1ef698fa7a265ec8971d0b641fb6e735dcd667dc",
        "target": "slugify.slugify:slugify",
        "claim": "preserves slug generation while tightening typing and tests",
        "setup": "text-unidecode required",
    },
    {
        "name": "humanize natural_list empty-list fix",
        "repo": "https://github.com/python-humanize/humanize.git",
        "base": "013969a1f7eef437f3c5e13dbd76b5466008fab8",
        "head": "0a06a3d4a12113cd5f3d0df0cfbb3e27d92499eb",
        "target": "humanize.lists:natural_list",
        "claim": "preserves natural-list behavior outside the intended empty-list fix",
        "setup": "none",
    },
    {
        "name": "validators mixed-separator MAC fix",
        "repo": "https://github.com/python-validators/validators.git",
        "base": "54404420a226c2a3c1603b81cb9958ef197b52a7",
        "head": "402b3517eb09be188df13e5c57ea4d1400b7cc20",
        "target": "validators.mac_address:mac_address",
        "claim": "preserves MAC validation except for mixed separators",
        "setup": "none",
    },
]


class TrialCharacterizer:
    """Manual trial input, intentionally not presented as GPT output."""

    def __init__(self, claim: Claim) -> None:
        self.claim = claim

    def characterize(
        self,
        _ingest: object,
        *,
        timeout: float | None = None,
    ) -> list[Claim]:
        del timeout
        return [self.claim]


def main() -> int:
    root = Path(".cross-examine/trials").resolve()
    root.mkdir(parents=True, exist_ok=True)
    database = Database(root / "trials.db")
    corpus = CorpusRepository(database)
    results: list[dict[str, object]] = []

    for trial_index, trial in enumerate(TRIALS):
        claim = Claim(
            id=f"manual-trial-{trial_index + 1}",
            text=trial["claim"],
            target_symbol=trial["target"],
            risk="high",
            proposed_check="[characterization source: manual unseen-repository trial]",
            preserve_critical=True,
        )
        for layer_b in (False, True):
            progress: list[RunProgress] = []
            pipeline = Pipeline(
                characterizer=TrialCharacterizer(claim),
                corpus=corpus,
                runs_root=root / "runs",
            )
            started = time.perf_counter()
            report = pipeline.run(
                RunSpec(
                    repo=trial["repo"],
                    base_ref=trial["base"],
                    head_ref=trial["head"],
                    layer_b=layer_b,
                ),
                progress.append,
                run_id=f"trial-{trial_index + 1}-{'ab' if layer_b else 'a'}-{time.time_ns()}",
            )
            result = {
                **trial,
                "layer_b": layer_b,
                "seconds": round(time.perf_counter() - started, 3),
                "verdict": report.verdict.value,
                "outcomes": dict(Counter(item.outcome.value for item in report.findings)),
                "stages": [event.stage for event in progress],
                "corpus": asdict(report.corpus) if report.corpus else None,
                "diagnostics": [
                    item.output[-500:]
                    for item in report.findings
                    if item.outcome.value == "unverifiable"
                ],
            }
            results.append(result)
            print(json.dumps(result, ensure_ascii=True), flush=True)

    (root / "results.json").write_text(
        json.dumps(results, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
