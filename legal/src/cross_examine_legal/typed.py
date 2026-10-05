"""Typed chronology and arithmetic predicates (Layer A).

Both work only over *confirmed* operands: an operand is confirmed when its quotation
is verified by `quote_at` AND the literal text of the operand (e.g. "07:11" or
"$2.4 million") occurs inside that verified quotation. Nothing is parsed out of free
text, nothing is evaluated as code: the operations are a fixed, typed set.

What they establish:
* chronology — whether the stated order/gap follows from the confirmed times. Not
  whether those times are accurate.
* arithmetic — whether the stated result follows from the confirmed operands and
  units. Not that an amount was incurred, nor that it is legally recoverable.
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from decimal import Decimal, InvalidOperation

from cross_examine_legal.predicates import PredicateOutput, quote_at
from cross_examine_legal.schema import CheckOutcome, QuoteAt, SourceVersion

CHRONOLOGY_ESTABLISHES = (
    "Establishes only whether the stated order or interval follows from the times "
    "confirmed in the cited quotations. It does not establish that those times are accurate."
)
ARITHMETIC_ESTABLISHES = (
    "Establishes only whether the stated result follows from the confirmed operands and "
    "units. It does not establish that any amount was incurred or is legally recoverable."
)

RELATIONS = ("before", "after", "same")
OPERATIONS = ("sum", "difference", "product", "ratio")


@dataclass(frozen=True)
class Operand:
    """A value asserted to appear in a quotation at a source location."""

    label: str
    literal: str  # exact text that must occur in the verified quotation, e.g. "07:11"
    quote: QuoteAt


@dataclass(frozen=True)
class TimeOperand(Operand):
    value: str = ""  # ISO-8601 datetime or date, as typed by the proposer


@dataclass(frozen=True)
class NumberOperand(Operand):
    value: str = ""  # decimal string, e.g. "2400000"
    unit: str = ""  # e.g. "USD", "minutes"


@dataclass(frozen=True)
class Chronology:
    a: TimeOperand
    b: TimeOperand
    relation: str  # "before" | "after" | "same"
    max_gap_minutes: int | None = None  # optional: |b - a| must not exceed this


@dataclass(frozen=True)
class Arithmetic:
    operation: str  # "sum" | "difference" | "product" | "ratio"
    operands: tuple[NumberOperand, ...]
    claimed: str  # decimal string
    unit: str  # unit of the claimed result


def _incomplete(lines: list[str], message: str, reason: str) -> PredicateOutput:
    return PredicateOutput(CheckOutcome.INCOMPLETE, [*lines, message, "result INCOMPLETE"],
                           {"reason": reason})


def _confirm(op: Operand, sources: dict[str, SourceVersion]) -> tuple[bool | None, list[str]]:
    """True = confirmed, False = refuted (quote refuted or literal absent), None = incomplete."""

    out = quote_at(sources.get(op.quote.source_sha256), op.quote)
    lines = [f"operand {op.label}: literal {op.literal!r}", *("  " + x for x in out.lines)]
    if out.outcome is CheckOutcome.INCOMPLETE:
        return None, lines
    if out.outcome is CheckOutcome.REFUTED:
        return False, lines
    if op.literal and op.literal in op.quote.quote:
        lines.append(f"  literal {op.literal!r} occurs in the verified quotation")
        return True, lines
    lines.append(f"  literal {op.literal!r} does NOT occur in the verified quotation")
    return False, lines


def _parse_time(v: str) -> datetime | None:
    try:
        return datetime.fromisoformat(v)
    except ValueError:
        return None


def chronology(req: Chronology, sources: dict[str, SourceVersion]) -> PredicateOutput:
    lines = [f"predicate chronology v1: a {req.relation} b"
             + (f", gap <= {req.max_gap_minutes} min" if req.max_gap_minutes is not None else "")]
    if req.relation not in RELATIONS:
        return _incomplete(lines, f"unknown relation {req.relation!r}", "bad_request")
    states = []
    for op in (req.a, req.b):
        ok, op_lines = _confirm(op, sources)
        states.append(ok)
        lines += op_lines
    ta, tb = _parse_time(req.a.value), _parse_time(req.b.value)
    if ta is None or tb is None:
        return _incomplete(lines, "a time value is not ISO-8601", "bad_value")
    if (ta.tzinfo is None) != (tb.tzinfo is None):
        return _incomplete(lines, "mixed timezone-aware and naive times", "bad_value")
    if None in states:
        return _incomplete(lines, "an operand could not be confirmed", "unconfirmed")
    if False in states:
        msg = "an operand is not confirmed by its quotation; the chronology cannot be decided"
        return _incomplete(lines, msg, "operand_refuted")
    gap = (tb - ta).total_seconds() / 60
    holds = {"before": ta < tb, "after": ta > tb, "same": ta == tb}[req.relation]
    if req.max_gap_minutes is not None:
        holds = holds and abs(gap) <= req.max_gap_minutes
    lines.append(f"confirmed a={ta.isoformat()} b={tb.isoformat()} gap={gap:g} min")
    outcome = CheckOutcome.VERIFIED if holds else CheckOutcome.REFUTED
    return PredicateOutput(outcome, [*lines, f"result {outcome.name}"], {"gap_minutes": gap})


def _dec(v: str) -> Decimal | None:
    try:
        d = Decimal(v)
    except (InvalidOperation, ValueError):
        return None
    return d if d.is_finite() else None


def arithmetic(req: Arithmetic, sources: dict[str, SourceVersion]) -> PredicateOutput:
    head = f"predicate arithmetic v1: {req.operation} of {len(req.operands)} operands"
    lines = [f"{head} = {req.claimed} {req.unit}"]
    if req.operation not in OPERATIONS or len(req.operands) < 2:
        return _incomplete(lines, "unsupported operation or too few operands", "bad_request")
    if req.operation in ("difference", "ratio") and len(req.operands) != 2:
        return _incomplete(lines, f"{req.operation} takes exactly two operands", "bad_request")
    values = [_dec(o.value) for o in req.operands]
    claimed = _dec(req.claimed)
    if None in values or claimed is None:
        return _incomplete(lines, "a value is not a decimal number", "bad_value")
    units = {o.unit for o in req.operands}
    if req.operation in ("sum", "difference") and (len(units) != 1 or req.unit not in units):
        return _incomplete(lines, f"incompatible units {sorted(units)} -> {req.unit}", "units")
    states = []
    for op in req.operands:
        ok, op_lines = _confirm(op, sources)
        states.append(ok)
        lines += op_lines
    if None in states or False in states:
        msg = "an operand is not confirmed; the calculation cannot be decided"
        return _incomplete(lines, msg, "unconfirmed")
    vals = [v for v in values if v is not None]
    if req.operation == "sum":
        result = sum(vals, Decimal(0))
    elif req.operation == "difference":
        result = vals[0] - vals[1]
    elif req.operation == "product":
        result = Decimal(1)
        for v in vals:
            result *= v
    else:
        if vals[1] == 0:
            return _incomplete(lines, "division by zero", "bad_value")
        result = vals[0] / vals[1]
    lines.append(f"computed {result} {req.unit}; claimed {claimed} {req.unit}")
    outcome = CheckOutcome.VERIFIED if result == claimed else CheckOutcome.REFUTED
    return PredicateOutput(outcome, [*lines, f"result {outcome.name}"], {"computed": str(result)})
