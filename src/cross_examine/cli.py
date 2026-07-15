"""Command-line entry points for running and presenting Cross-Examine."""

from __future__ import annotations

import argparse
import os
import webbrowser
from pathlib import Path
from threading import Timer
from typing import Sequence

from cross_examine.corpus.repository import CorpusRepository
from cross_examine.hero import HeroCharacterizer, ensure_hero_repository
from cross_examine.persistence.database import Database
from cross_examine.persistence.runs import RunRepository
from cross_examine.pipeline import CharacterizerLike, Pipeline
from cross_examine.schema import Outcome, Report, RunProgress, RunSpec

DEFAULT_URL = "http://127.0.0.1:8765"


def parser() -> argparse.ArgumentParser:
    root = argparse.ArgumentParser(
        prog="cross-examine",
        description="Independent execution-grounded verification for Python PRs.",
    )
    commands = root.add_subparsers(dest="command", required=True)

    serve = commands.add_parser("serve", help="serve the local product UI and API")
    serve.add_argument("--host", default="127.0.0.1")
    serve.add_argument("--port", default=8765, type=int)
    serve.add_argument("--no-open", action="store_true")
    serve.set_defaults(handler=_serve)

    run = commands.add_parser("run", help="cross-examine a real Python repository")
    run.add_argument("repo")
    run.add_argument("--base", required=True)
    run.add_argument("--head", required=True)
    run.add_argument("--no-layer-b", action="store_true")
    run.add_argument("--workspace", type=Path, default=Path(".cross-examine"))
    run.set_defaults(handler=_run)

    demo = commands.add_parser("demo", help="execute the deterministic hero catch")
    demo.add_argument("--no-open", action="store_true")
    demo.add_argument("--workspace", type=Path, default=Path(".cross-examine"))
    demo.set_defaults(handler=_demo)
    return root


def main(argv: Sequence[str] | None = None) -> int:
    arguments = parser().parse_args(argv)
    return int(arguments.handler(arguments))


def _serve(arguments: argparse.Namespace) -> int:
    import uvicorn

    url = f"http://{arguments.host}:{arguments.port}"
    if not arguments.no_open:
        Timer(0.8, lambda: webbrowser.open(url)).start()
    uvicorn.run(
        "cross_examine.api.app:create_dev_app",
        factory=True,
        host=arguments.host,
        port=arguments.port,
    )
    return 0


def _run(arguments: argparse.Namespace) -> int:
    if not os.environ.get("OPENAI_API_KEY"):
        raise SystemExit("OPENAI_API_KEY is required for real-repository characterization")
    from openai import OpenAI

    from cross_examine.characterize.service import Characterizer

    report, run_id = _execute(
        RunSpec(
            repo=arguments.repo,
            base_ref=arguments.base,
            head_ref=arguments.head,
            layer_b=not arguments.no_layer_b,
        ),
        Characterizer(OpenAI()),
        arguments.workspace,
    )
    _print_receipt(report, run_id, "GPT-5.6 Sol")
    return 0


def _demo(arguments: argparse.Namespace) -> int:
    workspace = arguments.workspace.resolve()
    workspace.mkdir(parents=True, exist_ok=True)
    hero = ensure_hero_repository(workspace / "hero")

    characterizer: CharacterizerLike
    source: str
    force_fixture = os.environ.get("CROSS_EXAMINE_DEMO_CHARACTERIZER") == "fixture"
    if os.environ.get("OPENAI_API_KEY") and not force_fixture:
        from openai import OpenAI

        from cross_examine.characterize.service import Characterizer

        characterizer = Characterizer(OpenAI())
        source = "GPT-5.6 Sol"
    else:
        characterizer = HeroCharacterizer()
        source = HeroCharacterizer.source

    report, run_id = _execute(
        RunSpec(repo=str(hero.path), base_ref=hero.base, head_ref=hero.head, layer_b=True),
        characterizer,
        workspace,
    )
    _print_receipt(report, run_id, source)
    if not arguments.no_open:
        webbrowser.open(f"{DEFAULT_URL}/runs/{run_id}")
    return 0 if report.verdict.value == "broken" else 1


def _execute(
    spec: RunSpec,
    characterizer: CharacterizerLike,
    workspace: Path,
) -> tuple[Report, str]:
    workspace.mkdir(parents=True, exist_ok=True)
    database_path = Path(os.environ.get("CROSS_EXAMINE_DB", workspace / "cross-examine.db"))
    runs_root = Path(os.environ.get("CROSS_EXAMINE_RUNS", workspace / "runs"))
    database = Database(database_path)
    runs = RunRepository(database)
    record = runs.create(spec)
    pipeline = Pipeline(
        characterizer=characterizer,
        corpus=CorpusRepository(database),
        runs_root=runs_root,
    )

    def progress(event: RunProgress) -> None:
        if event.stage != "complete":
            runs.set_progress(record.id, event.stage, event.message)

    report = pipeline.run(spec, progress, run_id=record.id)
    runs.complete(record.id, report)
    return report, record.id


def _print_receipt(report: Report, run_id: str, source: str) -> None:
    print(f"Run: {DEFAULT_URL}/runs/{run_id}")
    print(f"Characterization: {source}")
    print(f"Verdict: {report.verdict.value.upper()}")
    if report.corpus is not None:
        print(
            f"Corpus: +{report.corpus.pinned_this_run} this run · "
            f"{report.corpus.corpus_total} total"
        )
    for finding in report.findings:
        if finding.outcome is not Outcome.REFUTED:
            continue
        print(f"Refuted claim: {finding.claim_id}")
        print(f"Exact command: {finding.command}")
        print(f"Reproducing input: {finding.repro_input}")
        break


if __name__ == "__main__":
    raise SystemExit(main())
