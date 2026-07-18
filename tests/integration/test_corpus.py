from dataclasses import replace
from pathlib import Path

from cross_examine.corpus.repository import CorpusRepository
from cross_examine.persistence.database import Database
from cross_examine.schema import (
    BehaviorFixture,
    EvidenceReceipt,
    Finding,
    Layer,
    Outcome,
    evidence_hash,
)


def fixture(expected_json: str = '{"ok":true,"value":[]}') -> BehaviorFixture:
    command = "python -m cross_examine.cross_examine.probe_runner call sample.normalize:normalize request.json"
    output = '{"cross_examine_probe":1,"ok":true,"value":[]}'
    return BehaviorFixture(
        id="fixture-empty",
        claim_id="preserve-empty",
        target_symbol="sample.normalize:normalize",
        args_json="[[]]",
        kwargs_json="{}",
        expected_json=expected_json,
        command=command,
        output=output,
        receipt=EvidenceReceipt(command, output, evidence_hash(command, output)),
    )


def finding(outcome: Outcome = Outcome.VERIFIED, layer: Layer = Layer.BEHAVIORAL_DIFF) -> Finding:
    captured = fixture()
    return Finding(
        claim_id="preserve-empty",
        layer=layer,
        outcome=outcome,
        command=captured.command,
        output=captured.output,
        repro_input="[]",
        receipts=[captured.receipt] if captured.receipt is not None else [],
    )


def test_corpus_dedupes_verified_behavior_and_tracks_changed_expectations(
    tmp_path: Path,
) -> None:
    corpus = CorpusRepository(Database(tmp_path / "app.db"))

    assert corpus.pin("sample", "run-1", fixture(), finding()) is True
    assert corpus.pin("sample", "run-2", fixture(), finding()) is False
    assert corpus.total("sample") == 1

    changed = replace(fixture(), expected_json='{"ok":true,"value":null}')
    assert corpus.pin("sample", "run-3", changed, finding()) is True
    assert corpus.total("sample") == 2
    assert len(corpus.applicable("sample", "sample.normalize:normalize")) == 2


def test_corpus_never_pins_refuted_or_adversarial_findings(tmp_path: Path) -> None:
    corpus = CorpusRepository(Database(tmp_path / "app.db"))

    assert corpus.pin("sample", "run-refuted", fixture(), finding(Outcome.REFUTED)) is False
    assert (
        corpus.pin(
            "sample",
            "run-adversarial",
            fixture(),
            finding(Outcome.VERIFIED, Layer.ADVERSARIAL),
        )
        is False
    )
    assert corpus.total("sample") == 0


def test_corpus_never_pins_verified_behavior_without_exact_fixture_receipt(
    tmp_path: Path,
) -> None:
    corpus = CorpusRepository(Database(tmp_path / "app.db"))
    ungrounded = replace(fixture(), receipt=None)
    tampered = replace(
        fixture(),
        receipt=EvidenceReceipt(fixture().command, fixture().output, "0" * 64),
    )

    assert corpus.pin("sample", "run-missing", ungrounded, finding()) is False
    assert corpus.pin("sample", "run-tampered", tampered, finding()) is False
    assert corpus.total("sample") == 0


def test_legacy_corpus_rows_remain_stored_but_are_not_replayed_as_evidence(
    tmp_path: Path,
) -> None:
    database = Database(tmp_path / "app.db")
    corpus = CorpusRepository(database)
    with database.connect() as connection:
        connection.execute(
            """
            INSERT INTO corpus_checks (
              id, repo, target_symbol, input_json, expected_json, command, output,
              evidence_hash, first_run_id, last_run_id, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, '', ?, ?, ?, ?)
            """,
            (
                "legacy-check",
                "sample",
                "sample.normalize:normalize",
                '{"args":[[]],"kwargs":{}}',
                '{"ok":true,"value":[]}',
                "python legacy-probe.py",
                "legacy output",
                "legacy-run",
                "legacy-run",
                "2026-07-18T00:00:00+00:00",
                "2026-07-18T00:00:00+00:00",
            ),
        )

    assert corpus.total("sample") == 1
    assert corpus.applicable("sample", "sample.normalize:normalize") == []


def test_corpus_summaries_report_latest_run_growth(tmp_path: Path) -> None:
    corpus = CorpusRepository(Database(tmp_path / "app.db"))
    assert corpus.pin("sample", "run-1", fixture(), finding()) is True
    changed = replace(fixture(), expected_json='{"ok":true,"value":null}')
    assert corpus.pin("sample", "run-2", changed, finding()) is True

    summaries = corpus.summaries()

    assert len(summaries) == 1
    assert summaries[0].repo == "sample"
    assert summaries[0].corpus_total == 2
    assert summaries[0].latest_growth == 1
    assert summaries[0].last_run_id == "run-2"
