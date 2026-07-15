from dataclasses import replace
from pathlib import Path

from cross_examine.corpus.repository import CorpusRepository
from cross_examine.persistence.database import Database
from cross_examine.schema import BehaviorFixture, Finding, Layer, Outcome


def fixture(expected_json: str = '{"ok":true,"value":[]}') -> BehaviorFixture:
    return BehaviorFixture(
        id="fixture-empty",
        claim_id="preserve-empty",
        target_symbol="sample.normalize:normalize",
        args_json="[[]]",
        kwargs_json="{}",
        expected_json=expected_json,
        command="python -m cross_examine.cross_examine.probe_runner call sample.normalize:normalize request.json",
        output='{"cross_examine_probe":1,"ok":true,"value":[]}',
    )


def finding(outcome: Outcome = Outcome.VERIFIED, layer: Layer = Layer.BEHAVIORAL_DIFF) -> Finding:
    return Finding(
        claim_id="preserve-empty",
        layer=layer,
        outcome=outcome,
        command="python -m cross_examine.cross_examine.probe_runner call sample.normalize:normalize request.json",
        output='{"cross_examine_probe":1,"ok":true,"value":[]}',
        repro_input="[]",
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
