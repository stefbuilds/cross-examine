from __future__ import annotations

import time
from pathlib import Path
from typing import Callable

import pytest
from fastapi.testclient import TestClient

from cross_examine.api.app import create_app
from cross_examine.fixtures import broken_fixture_report
from cross_examine.schema import Report, RunProgress, RunSpec


class FakePipeline:
    def run(
        self,
        _spec: RunSpec,
        progress: Callable[[RunProgress], None],
        *,
        run_id: str,
    ) -> Report:
        progress(RunProgress(run_id, "ingesting", "Cloning", 0.01))
        progress(RunProgress(run_id, "complete", "Report ready", 0.02))
        return broken_fixture_report()


def test_post_run_executes_on_worker_and_streams_terminal_progress(tmp_path: Path) -> None:
    app = create_app(
        tmp_path / "app.db",
        pipeline_factory=FakePipeline,
        runs_root=tmp_path / "runs",
    )

    with TestClient(app) as client:
        response = client.post(
            "/api/runs",
            json={
                "repo": ".",
                "base_ref": "base",
                "head_ref": "head",
                "layer_b": False,
            },
        )
        assert response.status_code == 202
        run_id = response.json()["id"]

        payload = None
        for _ in range(100):
            payload = client.get(f"/api/runs/{run_id}").json()
            if payload["status"] == "complete":
                break
            time.sleep(0.01)

        assert payload is not None
        assert payload["status"] == "complete"
        assert payload["report"]["verdict"] == "broken"

        events = client.get(f"/api/runs/{run_id}/events")
        assert events.status_code == 200
        assert events.headers["content-type"].startswith("text/event-stream")
        assert '"stage": "ingesting"' in events.text
        assert '"stage": "complete"' in events.text


def test_offline_hero_endpoint_uses_the_labeled_fixture_characterizer(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)
    app = create_app(tmp_path / "app.db", runs_root=tmp_path / "runs")

    with TestClient(app) as client:
        response = client.post("/api/hero-runs")
        assert response.status_code == 202
        run_id = response.json()["id"]

        payload = None
        for _ in range(600):
            payload = client.get(f"/api/runs/{run_id}").json()
            if payload["status"] == "complete":
                break
            time.sleep(0.02)

    assert payload is not None
    assert payload["status"] == "complete"
    assert payload["report"]["verdict"] == "broken"
    assert "deterministic hero fixture" in payload["report"]["claims"][0]["proposed_check"]


def test_hosted_mode_completes_hero_inline_and_rejects_arbitrary_repositories(
    tmp_path: Path,
) -> None:
    app = create_app(
        tmp_path / "app.db",
        runs_root=tmp_path / "runs",
        hosted_mode=True,
    )

    with TestClient(app) as client:
        health = client.get("/api/health")
        assert health.status_code == 200
        assert health.json()["hosted"] is True

        rejected = client.post(
            "/api/runs",
            json={
                "repo": "https://github.com/example/project.git",
                "base_ref": "main",
                "head_ref": "candidate",
                "layer_b": True,
            },
        )
        hero = client.post("/api/hero-runs")

        assert rejected.status_code == 403
        assert "local runner" in rejected.json()["detail"]
        assert hero.status_code == 202
        assert hero.json()["status"] == "complete"

        report = client.get(f"/api/runs/{hero.json()['id']}").json()["report"]
        assert report["verdict"] == "broken"
        assert "hosted evidence fixture" in report["repo"].lower()
        assert any(finding["repro_input"] == "[]" for finding in report["findings"])
