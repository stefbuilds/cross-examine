from __future__ import annotations

import shlex
from pathlib import Path

import pytest

from cross_examine_legal import (
    Arithmetic,
    CheckOutcome,
    Chronology,
    NumberOperand,
    QuoteAt,
    TimeOperand,
    extract_text_v1,
    run_typed,
)
from cross_examine_legal.cli import main as cli_main

LOG = ("At 06:52 the night supervisor logged a coolant leak.\f"
       "Ms. Okafor slipped at 07:11 while carrying a crate.")
BILL = "Ambulance invoice: 1,250.00 USD. Hospital invoice: 8,400.00 USD. Total billed: 9,650.00 USD."


class Res:
    def __init__(self, *svs):
        self.s = {v.sha256: v for v in svs}

    def source(self, sha):
        return self.s.get(sha)

    def manifest(self, sha):
        return None


@pytest.fixture
def docs():
    return (extract_text_v1("LOG", 1, LOG.encode(), "text/plain"),
            extract_text_v1("BILL", 1, BILL.encode(), "text/plain"))


def t(sv, label, literal, quote, page, value):
    return TimeOperand(label, literal, QuoteAt(sv.sha256, quote, page), value)


def n(sv, label, literal, quote, value, unit="USD"):
    return NumberOperand(label, literal, QuoteAt(sv.sha256, quote, 0), value, unit)


def test_chronology_follows_from_confirmed_times(docs) -> None:
    log, _ = docs
    a = t(log, "leak", "06:52", "At 06:52 the night supervisor logged a coolant leak.", 0,
          "2026-03-14T06:52")
    b = t(log, "fall", "07:11", "Ms. Okafor slipped at 07:11 while carrying a crate.", 1,
          "2026-03-14T07:11")
    ok = run_typed(Chronology(a, b, "before", max_gap_minutes=30), Res(log))
    assert ok.outcome is CheckOutcome.VERIFIED and ok.detail["gap_minutes"] == 19
    assert "does not establish that those times are accurate" in ok.output
    wrong = run_typed(Chronology(a, b, "after"), Res(log))
    assert wrong.outcome is CheckOutcome.REFUTED
    tight = run_typed(Chronology(a, b, "before", max_gap_minutes=10), Res(log))
    assert tight.outcome is CheckOutcome.REFUTED


def test_chronology_with_unconfirmed_operand_is_incomplete(docs) -> None:
    log, _ = docs
    a = t(log, "leak", "06:45", "At 06:52 the night supervisor logged a coolant leak.", 0,
          "2026-03-14T06:45")  # literal not in quote
    b = t(log, "fall", "07:11", "Ms. Okafor slipped at 07:11 while carrying a crate.", 1,
          "2026-03-14T07:11")
    r = run_typed(Chronology(a, b, "before"), Res(log))
    assert r.outcome is CheckOutcome.INCOMPLETE and "does NOT occur" in r.output
    paraphrase = t(log, "leak", "06:52", "At 06:52 a leak was logged.", 0, "2026-03-14T06:52")
    assert run_typed(Chronology(paraphrase, b, "before"), Res(log)).outcome is \
        CheckOutcome.INCOMPLETE


def test_arithmetic_sum_and_units(docs) -> None:
    _, bill = docs
    amb = n(bill, "ambulance", "1,250.00", "Ambulance invoice: 1,250.00 USD.", "1250.00")
    hosp = n(bill, "hospital", "8,400.00", "Hospital invoice: 8,400.00 USD.", "8400.00")
    ok = run_typed(Arithmetic("sum", (amb, hosp), "9650.00", "USD"), Res(bill))
    assert ok.outcome is CheckOutcome.VERIFIED
    assert "not establish that any amount was incurred" in ok.output
    bad = run_typed(Arithmetic("sum", (amb, hosp), "9750.00", "USD"), Res(bill))
    assert bad.outcome is CheckOutcome.REFUTED and "computed 9650.00" in bad.output
    eur = n(bill, "hospital", "8,400.00", "Hospital invoice: 8,400.00 USD.", "8400.00", "EUR")
    assert run_typed(Arithmetic("sum", (amb, eur), "9650", "USD"), Res(bill)).outcome is \
        CheckOutcome.INCOMPLETE
    assert run_typed(Arithmetic("ratio", (amb, hosp, amb), "1", ""), Res(bill)).outcome is \
        CheckOutcome.INCOMPLETE


def test_no_code_evaluation_is_possible(docs) -> None:
    _, bill = docs
    amb = n(bill, "x", "1,250.00", "Ambulance invoice: 1,250.00 USD.", "__import__('os')")
    hosp = n(bill, "y", "8,400.00", "Hospital invoice: 8,400.00 USD.", "8400")
    r = run_typed(Arithmetic("sum", (amb, hosp), "1", "USD"), Res(bill))
    assert r.outcome is CheckOutcome.INCOMPLETE and r.detail["reason"] == "bad_value"


def test_typed_checks_replay_byte_for_byte(docs, tmp_path: Path, capsys) -> None:
    log, bill = docs
    (tmp_path / "sha256").mkdir()
    (tmp_path / "sha256" / log.sha256).write_bytes(LOG.encode())
    (tmp_path / "sha256" / bill.sha256).write_bytes(BILL.encode())
    a = t(log, "leak", "06:52", "At 06:52 the night supervisor logged a coolant leak.", 0,
          "2026-03-14T06:52")
    b = t(log, "fall", "07:11", "Ms. Okafor slipped at 07:11 while carrying a crate.", 1,
          "2026-03-14T07:11")
    amb = n(bill, "ambulance", "1,250.00", "Ambulance invoice: 1,250.00 USD.", "1250.00")
    hosp = n(bill, "hospital", "8,400.00", "Hospital invoice: 8,400.00 USD.", "8400.00")
    for req in (Chronology(a, b, "before"), Arithmetic("sum", (amb, hosp), "9650.00", "USD"),
                Arithmetic("sum", (amb, hosp), "1.00", "USD")):
        stored = run_typed(req, Res(log, bill))
        status = cli_main(shlex.split(stored.command)[1:] + ["--blobs", str(tmp_path)])
        assert capsys.readouterr().out == stored.output and status == stored.exit_status
        assert stored.receipt.is_intact()
