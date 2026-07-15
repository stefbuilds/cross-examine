from pathlib import Path

from fastapi.testclient import TestClient

from cross_examine.api.app import create_app
from cross_examine.fixtures import broken_fixture_report
from cross_examine.schema import BehaviorFixture, Finding, Layer, Outcome, RunSpec


def test_fixture_report_is_renderable(tmp_path: Path) -> None:
    client = TestClient(create_app(tmp_path / "app.db"))

    response = client.get("/api/fixtures/broken")

    assert response.status_code == 200
    payload = response.json()
    assert payload["fixture"] is True
    assert payload["report"]["verdict"] == "broken"
    assert payload["report"]["findings"][0]["command"]
    assert payload["report"]["findings"][0]["output"]


def test_health_endpoint_reports_ready_database(tmp_path: Path) -> None:
    client = TestClient(create_app(tmp_path / "app.db"))

    response = client.get("/api/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_completed_run_is_available_by_id(tmp_path: Path) -> None:
    app = create_app(tmp_path / "app.db")
    run = app.state.runs.create(
        RunSpec(repo=".", base_ref="base", head_ref="head"),
        run_id="run-grounded",
    )
    app.state.runs.complete(run.id, broken_fixture_report())

    response = TestClient(app).get("/api/runs/run-grounded")

    assert response.status_code == 200
    payload = response.json()
    assert payload["id"] == "run-grounded"
    assert payload["status"] == "complete"
    assert payload["report"]["findings"][0]["command"]
    assert payload["report"]["findings"][0]["output"]


def test_missing_run_is_a_clear_404(tmp_path: Path) -> None:
    response = TestClient(create_app(tmp_path / "app.db")).get("/api/runs/not-here")

    assert response.status_code == 404
    assert response.json() == {"detail": "Run not found"}


def test_run_history_lists_persisted_runs_newest_first_with_a_bound(tmp_path: Path) -> None:
    app = create_app(tmp_path / "app.db")
    older = app.state.runs.create(
        RunSpec(repo="older", base_ref="base", head_ref="head"),
        run_id="run-older",
    )
    app.state.runs.complete(older.id, broken_fixture_report())
    newer = app.state.runs.create(
        RunSpec(repo="newer", base_ref="main", head_ref="candidate"),
        run_id="run-newer",
    )

    response = TestClient(app).get("/api/runs?limit=1")

    assert response.status_code == 200
    assert response.json() == [
        {
            "id": newer.id,
            "repo": "newer",
            "base_ref": "main",
            "head_ref": "candidate",
            "status": "queued",
            "stage": "queued",
            "message": "Waiting to start",
            "created_at": newer.created_at,
            "updated_at": newer.updated_at,
            "verdict": None,
        }
    ]


def test_corpus_endpoint_exposes_grounded_growth(tmp_path: Path) -> None:
    app = create_app(tmp_path / "app.db")
    fixture = BehaviorFixture(
        id="fixture-empty",
        claim_id="preserve-empty",
        target_symbol="sample.normalize:normalize",
        args_json="[[]]",
        kwargs_json="{}",
        expected_json='{"ok":true,"value":[]}',
        command="python -m probe call request.json",
        output='{"ok":true,"value":[]}',
    )
    finding = Finding(
        claim_id="preserve-empty",
        layer=Layer.BEHAVIORAL_DIFF,
        outcome=Outcome.VERIFIED,
        command=fixture.command,
        output=fixture.output,
        repro_input="[]",
    )
    assert app.state.corpus.pin("sample", "run-1", fixture, finding) is True

    response = TestClient(app).get("/api/corpus")

    assert response.status_code == 200
    assert response.json()[0]["repo"] == "sample"
    assert response.json()[0]["corpus_total"] == 1


def test_run_request_rejects_option_like_repository(tmp_path: Path) -> None:
    response = TestClient(create_app(tmp_path / "app.db")).post(
        "/api/runs",
        json={"repo": "--upload-pack=bad", "base_ref": "main", "head_ref": "head"},
    )

    assert response.status_code == 422


def test_packaged_frontend_serves_root_and_direct_run_routes(tmp_path: Path) -> None:
    client = TestClient(create_app(tmp_path / "app.db"))

    root = client.get("/")
    direct_route = client.get("/runs/example-report")
    missing_api = client.get("/api/not-a-route")

    assert root.status_code == 200
    assert '<div id="root"></div>' in root.text
    assert direct_route.status_code == 200
    assert '<div id="root"></div>' in direct_route.text
    assert missing_api.status_code == 404
