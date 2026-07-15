"""FastAPI application factory."""

from __future__ import annotations

import json
import os
import time
from collections.abc import AsyncIterator, Callable, Iterator
from concurrent.futures import ThreadPoolExecutor
from contextlib import asynccontextmanager
from dataclasses import asdict
from pathlib import Path
from typing import Protocol

from fastapi import FastAPI, HTTPException, Query
from fastapi.responses import FileResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles

from cross_examine.api.models import (
    CorpusSummaryResponse,
    FixtureResponse,
    HealthResponse,
    RunAcceptedResponse,
    RunCreateRequest,
    RunResponse,
    RunSummaryResponse,
)
from cross_examine.codec import report_to_json
from cross_examine.corpus.repository import CorpusRepository
from cross_examine.fixtures import broken_fixture_report
from cross_examine.hero import HeroCharacterizer, ensure_hero_repository
from cross_examine.pipeline import Pipeline
from cross_examine.persistence.database import Database
from cross_examine.persistence.runs import RunRepository
from cross_examine.progress import ProgressBroker
from cross_examine.schema import Report, RunProgress, RunSpec


class PipelineLike(Protocol):
    def run(
        self,
        spec: RunSpec,
        progress: Callable[[RunProgress], None],
        *,
        run_id: str,
    ) -> Report: ...


def create_app(
    database_path: str | Path,
    *,
    pipeline_factory: Callable[[], PipelineLike] | None = None,
    runs_root: str | Path | None = None,
) -> FastAPI:
    database = Database(database_path)
    run_repository = RunRepository(database)
    corpus = CorpusRepository(database)
    broker = ProgressBroker()
    executor = ThreadPoolExecutor(max_workers=1, thread_name_prefix="cross-examine")
    run_directory = Path(runs_root or Path(database_path).parent / "runs").resolve()

    if pipeline_factory is None:

        def pipeline_factory() -> Pipeline:
            from openai import OpenAI

            from cross_examine.characterize.service import Characterizer

            return Pipeline(
                characterizer=Characterizer(OpenAI()),
                corpus=corpus,
                runs_root=run_directory,
            )

    @asynccontextmanager
    async def lifespan(_app: FastAPI) -> AsyncIterator[None]:
        yield
        executor.shutdown(wait=True, cancel_futures=False)

    app = FastAPI(title="Cross-Examine", version="0.1.0", lifespan=lifespan)
    app.state.runs = run_repository
    app.state.corpus = corpus
    app.state.progress = broker

    @app.get("/api/health", response_model=HealthResponse)
    def health() -> HealthResponse:
        return HealthResponse(status="ok")

    @app.get("/api/fixtures/broken", response_model=FixtureResponse)
    def broken_fixture() -> FixtureResponse:
        report = json.loads(report_to_json(broken_fixture_report()))
        return FixtureResponse(fixture=True, report=report)

    @app.get("/api/corpus", response_model=list[CorpusSummaryResponse])
    def corpus_summaries() -> list[CorpusSummaryResponse]:
        return [CorpusSummaryResponse(**asdict(item)) for item in corpus.summaries()]

    @app.post("/api/hero-runs", response_model=RunAcceptedResponse, status_code=202)
    def create_hero_run() -> RunAcceptedResponse:
        hero = ensure_hero_repository(run_directory.parent / "hero")
        spec = RunSpec(
            repo=str(hero.path),
            base_ref=hero.base,
            head_ref=hero.head,
            layer_b=True,
        )
        run = run_repository.create(spec)

        def hero_pipeline_factory() -> Pipeline:
            return Pipeline(
                characterizer=HeroCharacterizer(),
                corpus=corpus,
                runs_root=run_directory,
            )

        executor.submit(
            _execute_run,
            run.id,
            spec,
            hero_pipeline_factory,
            run_repository,
            broker,
        )
        return RunAcceptedResponse(id=run.id, status=run.status)

    @app.get("/api/runs", response_model=list[RunSummaryResponse])
    def list_runs(limit: int = Query(default=50, ge=1, le=100)) -> list[RunSummaryResponse]:
        return [
            RunSummaryResponse(
                id=run.id,
                repo=run.repo,
                base_ref=run.base_ref,
                head_ref=run.head_ref,
                status=run.status,
                stage=run.stage,
                message=run.message,
                created_at=run.created_at,
                updated_at=run.updated_at,
                verdict=run.report.verdict.value if run.report is not None else None,
            )
            for run in run_repository.list(limit)
        ]

    @app.get("/api/runs/{run_id}", response_model=RunResponse)
    def get_run(run_id: str) -> RunResponse:
        run = run_repository.get(run_id)
        if run is None:
            raise HTTPException(status_code=404, detail="Run not found")
        report = json.loads(report_to_json(run.report)) if run.report is not None else None
        return RunResponse(
            id=run.id,
            status=run.status,
            stage=run.stage,
            message=run.message,
            report=report,
        )

    @app.post("/api/runs", response_model=RunAcceptedResponse, status_code=202)
    def create_run(request: RunCreateRequest) -> RunAcceptedResponse:
        spec = RunSpec(
            repo=request.repo,
            base_ref=request.base_ref,
            head_ref=request.head_ref,
            layer_b=request.layer_b,
            command_timeout_seconds=request.command_timeout_seconds,
            run_timeout_seconds=request.run_timeout_seconds,
        )
        run = run_repository.create(spec)
        executor.submit(_execute_run, run.id, spec, pipeline_factory, run_repository, broker)
        return RunAcceptedResponse(id=run.id, status=run.status)

    @app.get("/api/runs/{run_id}/events")
    def run_events(run_id: str) -> StreamingResponse:
        run = run_repository.get(run_id)
        if run is None:
            raise HTTPException(status_code=404, detail="Run not found")

        def stream() -> Iterator[str]:
            history = broker.history(run_id)
            if not history and run.status in {"complete", "failed"}:
                event = RunProgress(
                    run_id=run_id,
                    stage=run.status,
                    message=run.message,
                    elapsed_seconds=0.0,
                )
                yield _sse(event)
                return
            for event in broker.subscribe(run_id):
                yield _sse(event)

        return StreamingResponse(
            stream(),
            media_type="text/event-stream",
            headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
        )

    static_root = Path(__file__).resolve().parents[1] / "static"
    assets_root = static_root / "assets"
    if assets_root.is_dir():
        app.mount("/assets", StaticFiles(directory=assets_root), name="frontend-assets")

    @app.get("/{frontend_path:path}", include_in_schema=False)
    def frontend(frontend_path: str) -> FileResponse:
        if frontend_path == "api" or frontend_path.startswith("api/"):
            raise HTTPException(status_code=404, detail="Not found")
        candidate = (static_root / frontend_path).resolve()
        if candidate.is_relative_to(static_root) and candidate.is_file():
            return FileResponse(candidate)
        index = static_root / "index.html"
        if not index.is_file():
            raise HTTPException(status_code=404, detail="Frontend not built")
        return FileResponse(index)

    return app


def create_dev_app() -> FastAPI:
    """Uvicorn factory for local development and browser verification."""

    database_path = Path(os.environ.get("CROSS_EXAMINE_DB", ".cross-examine/cross-examine.db"))
    runs_root = Path(os.environ.get("CROSS_EXAMINE_RUNS", ".cross-examine/runs"))
    return create_app(database_path, runs_root=runs_root)


def _execute_run(
    run_id: str,
    spec: RunSpec,
    pipeline_factory: Callable[[], PipelineLike],
    runs: RunRepository,
    broker: ProgressBroker,
) -> None:
    terminal: list[RunProgress] = []

    def progress(event: RunProgress) -> None:
        if event.stage == "complete":
            terminal[:] = [event]
            return
        runs.set_progress(run_id, event.stage, event.message)
        broker.publish(event)

    started = time.monotonic()
    try:
        report = pipeline_factory().run(spec, progress, run_id=run_id)
        runs.complete(run_id, report)
        event = (
            terminal[0]
            if terminal
            else RunProgress(
                run_id=run_id,
                stage="complete",
                message="Report ready",
                elapsed_seconds=time.monotonic() - started,
            )
        )
        broker.publish(event)
    except Exception as exc:  # noqa: BLE001 - worker failures are persisted and streamed
        message = f"{type(exc).__name__}: {exc}"
        runs.fail(run_id, message)
        broker.publish(
            RunProgress(
                run_id=run_id,
                stage="failed",
                message=message,
                elapsed_seconds=time.monotonic() - started,
            )
        )


def _sse(event: RunProgress) -> str:
    return f"data: {json.dumps(asdict(event), ensure_ascii=False)}\n\n"
