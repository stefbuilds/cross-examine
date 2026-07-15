"""Call structured output for claims while keeping verdict logic model-free."""

from __future__ import annotations

from typing import Any, Protocol

from cross_examine.characterize.models import CharacterizationPayload
from cross_examine.characterize.prompt import SYSTEM_PROMPT, build_context
from cross_examine.schema import Claim, ClaimKind, IngestResult


class ResponsesAPI(Protocol):
    def parse(self, **kwargs: Any) -> Any: ...


class ResponsesClient(Protocol):
    responses: ResponsesAPI


class CharacterizationError(ValueError):
    """Raised when structured model output cannot safely become claims."""


class Characterizer:
    def __init__(self, client: ResponsesClient, model: str = "gpt-5.6-sol") -> None:
        self.client = client
        self.model = model
        self.last_request_id: str | None = None

    def characterize(
        self,
        ingest: IngestResult,
        *,
        timeout: float | None = None,
    ) -> list[Claim]:
        response = self.client.responses.parse(
            model=self.model,
            input=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": build_context(ingest)},
            ],
            text_format=CharacterizationPayload,
            store=False,
            timeout=timeout,
        )
        self.last_request_id = getattr(response, "_request_id", None) or getattr(
            response, "id", None
        )
        payload = getattr(response, "output_parsed", None)
        if payload is None:
            raise CharacterizationError("Model response had no parsed output")
        if not isinstance(payload, CharacterizationPayload):
            raise CharacterizationError("Model response returned an unexpected parsed output type")
        if not payload.claims:
            raise CharacterizationError("Characterization must contain at least one claim")
        if len(payload.claims) > 20:
            raise CharacterizationError("Characterization may contain at most 20 claims")

        allowed_targets = {symbol.target_symbol for symbol in ingest.touched_symbols}
        identifiers: set[str] = set()
        claims: list[Claim] = []
        for item in payload.claims:
            identifier = item.id.strip()
            if identifier in identifiers:
                raise CharacterizationError(f"Duplicate claim ID: {identifier}")
            identifiers.add(identifier)
            if item.target_symbol not in allowed_targets:
                raise CharacterizationError(f"Unknown target symbol: {item.target_symbol}")
            proposed_check = item.proposed_check.strip()
            if not proposed_check:
                raise CharacterizationError(f"Claim {identifier} has an empty proposed check")
            if not identifier or not item.text.strip():
                raise CharacterizationError("Claim IDs and text must be non-empty")
            if item.kind == "intended_change" and item.preserve_critical:
                raise CharacterizationError(
                    f"Claim {identifier} is an intended-change claim, not preserve-critical"
                )
            claims.append(
                Claim(
                    id=identifier,
                    text=item.text.strip(),
                    target_symbol=item.target_symbol,
                    risk=item.risk,
                    proposed_check=proposed_check,
                    preserve_critical=item.preserve_critical,
                    kind=ClaimKind(item.kind),
                )
            )
        claim_by_id = {claim.id: claim for claim in claims}
        plan_ids: set[str] = set()
        for plan in payload.probe_plans:
            if plan.id in plan_ids:
                raise CharacterizationError(f"Duplicate ProbePlan ID: {plan.id}")
            plan_ids.add(plan.id)
            claim = claim_by_id.get(plan.claim_id)
            if claim is None or plan.target_symbol != claim.target_symbol:
                raise CharacterizationError("ProbePlan must target its characterized claim")
            # The plan's values and relation eligibility are revalidated against
            # the runtime-discovered signature immediately before execution.
            claim.probe_plans.append(plan.model_dump(mode="json"))
        return claims
