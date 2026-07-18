# Real-repository GPT-5.6 Sol trial handoff

## Chosen trial

Run Cross-Examine at immutable commit `f6524eac4270cf566d3acbf1f3a77ebb24ed904f`
against the `jquast/wcwidth` ASCII fast-path change:

- repository: `https://github.com/jquast/wcwidth.git`
- base: `4738d7993c7911ce2f58cd9569a0251d1de7e9a6`
- head: `9c3356e30a0744919c80c0b69a88d4efa237c983`
- intended target: `wcwidth.wcwidth:width`
- upstream change: [commit](https://github.com/jquast/wcwidth/commit/9c3356e30a0744919c80c0b69a88d4efa237c983), [immutable patch](https://github.com/jquast/wcwidth/commit/9c3356e30a0744919c80c0b69a88d4efa237c983.patch), [base tree](https://github.com/jquast/wcwidth/tree/4738d7993c7911ce2f58cd9569a0251d1de7e9a6), [head tree](https://github.com/jquast/wcwidth/tree/9c3356e30a0744919c80c0b69a88d4efa237c983)

This is the best one-shot trial because the entire product change is a four-line fast
path in one Python file, the public function has a supported required input and JSON
output (`str -> int`), normal results are deterministic, and the change is meant to
preserve behavior while improving the ASCII case. It is unfamiliar to the existing
recorded trials and has no runtime dependency. Its *test* environment is not light:
upstream pytest configuration requires coverage and codspeed plugins and installed
distribution metadata. The paid run is therefore forbidden unless the exact overlay
and both full test suites pass offline first.

The expected behavior is equality across base and head, including `width("") == 0`,
`width("a") == 1`, `width("é") == 1`, and `width("🙂") == 2`. This expectation is a
preflight fact, not a prescribed verdict. The later run succeeds as evidence whether
the deterministic aggregate says `SAFE`, `RISKY`, or `BROKEN`, provided all acceptance
criteria below are met. Never retry merely to obtain a preferred verdict.

**Status of this document:** research and command design only. No OpenAI request, paid
run, target execution, database write, or production-code change was performed while
preparing it.

## What this proves—and what it does not

The operator will execute the unchanged `Characterizer` and unchanged stock `_execute()`
pipeline with `RunSpec(layer_b=False)`. This is equivalent to the public CLI's
`--no-layer-b` execution path after argument parsing, while adding a temporary observer
around the API client. It is not literally an invocation of the public
`cross-examine run` entry point, because that entry point constructs an uninstrumented
`OpenAI()` client and does not persist the returned model, API request ID, response ID,
or usage. The observer is evidence tooling outside production code; it neither creates
claims nor decides findings or the verdict.

All five architectural stages remain present: Ingest; real GPT-5.6 Sol Characterize;
Cross-examine through Layer A; pure Aggregate; and persisted/API Render. Layer B is
deliberately disabled for this proof: it would add up to 60 generated examples per
claim and is unnecessary to establish the missing real Characterize evidence. Layer A
must and will complete first.

Model text is not reproducible byte-for-byte. “Reproducible” here means immutable source
objects, pinned Cross-Examine code and dependency lock, a captured operator/runtime
environment, an exact one-generation command, durable model-call metadata, exact
commands and outputs for every decided finding, and a report whose deterministic parts
can be re-inspected later.

Cross-Examine's executor is a trusted-input host adapter, not a sandbox. Run this only
under a disposable, low-privilege OS account or disposable VM/container with no SSH
agent, cloud credentials, browser profile, unrelated repositories, or writable host
mounts. The API key may exist only in the paid parent process; Cross-Examine strips
secret-shaped environment variables from target subprocesses, but target code still
retains local host and network authority.

## Candidate comparison

| Rank | Immutable public change | Import/setup | Diff | Function fit | Determinism | Demo value | Decision |
|---|---|---|---:|---|---|---|---|
| 1 | [`wcwidth.width()` ASCII fast path](https://github.com/jquast/wcwidth/compare/4738d7993c7911ce2f58cd9569a0251d1de7e9a6...9c3356e30a0744919c80c0b69a88d4efa237c983) | Direct source import; heavy but pinned test overlay | `+4/-0`, one Python file | Excellent: public `str -> int` | Excellent | Clear preservation/performance story | **Primary** |
| 2 | [`wcwidth.center()` parity fix](https://github.com/jquast/wcwidth/compare/a1b9a8382ca4848bd2728b71e324d98e9d85747a...030b4b53a604e28553a677dcffd64d3f3cb6d64d) | Same package/test overlay | `+29/-18`, one Python file | Good: public `str, int -> str` | Excellent | Best visible behavior change | Rejected for one-shot: correct intended-change claims can legitimately abstain and yield `RISKY` |
| 3 | [`python-slugify` typing preservation](https://github.com/un33k/python-slugify/compare/45f9d33a3a0d7302120d2dde26fa2ac6131edb6b...1ef698fa7a265ec8971d0b641fb6e735dcd667dc) | Needs `text-unidecode==1.3` | `+134/-35`, eight files | Good: public `str -> str` | Excellent | Operationally safe but already familiar | **Fallback before any paid request only** |

The center change's [immutable commit](https://github.com/jquast/wcwidth/commit/030b4b53a604e28553a677dcffd64d3f3cb6d64d)
is the clearest bug demo, but it is inferior for proving a dependable one-shot
Characterize stage. The fallback's [immutable commit](https://github.com/un33k/python-slugify/commit/1ef698fa7a265ec8971d0b641fb6e735dcd667dc)
uses the same pair already exercised with manual claims in `docs/trials.md`, so it is
less compelling as “unfamiliar” evidence.

Other researched changes were rejected before ranking: `urllib3` centered on methods,
properties, or private helpers; `idna` exposed required union inputs outside the Layer A
catalog; `humanize` depended on build-generated version data; and `validators` returned
failure objects that are not JSON-serializable.

## Immutable trial inputs

Record these values verbatim in the evidence package:

```text
CROSS_EXAMINE_REPO=https://github.com/stefbuilds/cross-examine.git
CROSS_EXAMINE_SHA=f6524eac4270cf566d3acbf1f3a77ebb24ed904f
TARGET_REPO=https://github.com/jquast/wcwidth.git
TARGET_BASE=4738d7993c7911ce2f58cd9569a0251d1de7e9a6
TARGET_HEAD=9c3356e30a0744919c80c0b69a88d4efa237c983
REQUESTED_MODEL=gpt-5.6-sol
LAYER_B=false
COMMAND_TIMEOUT_SECONDS=120
RUN_TIMEOUT_SECONDS=600
```

The Cross-Examine pin is the public repository state, not the preparer's dirty working
tree. Its [characterizer hard-codes `gpt-5.6-sol`, structured parsing, and `store=False`](https://github.com/stefbuilds/cross-examine/blob/f6524eac4270cf566d3acbf1f3a77ebb24ed904f/src/cross_examine/characterize/service.py),
and its [pipeline converts every stage exception into a preserve-critical
`UNVERIFIABLE` finding](https://github.com/stefbuilds/cross-examine/blob/f6524eac4270cf566d3acbf1f3a77ebb24ed904f/src/cross_examine/pipeline.py).
The public pin validates nonempty exact command and output for every `VERIFIED` or
`REFUTED` finding, but it does not hash those fields; the external evidence manifest
below closes that preservation gap without changing production.

## Gate A — offline preflight on macOS/Linux

Requirements: Bash, Git, `uv`, Python 3.12 available to `uv`, network access only for
this dependency/source-fetch phase, and a fresh disposable account or environment.
Do not set `OPENAI_API_KEY` yet. Use a new numeric suffix if `trial-001` already exists;
never delete an earlier trial directory.

Copy-paste this whole block. Before starting, preserve a byte-for-byte copy of this
handoff as `evidence-original/operator-handoff.md` (after the block creates that
directory) and record its SHA-256; it is the command ledger. The log records command
output separately. Do not add `set -x`, because tracing risks secret exposure in later
gates.

```bash
set -euo pipefail
TRIAL_ROOT="${TMPDIR:-/tmp}/cross-examine-gpt56-sol-trial-001"
CE="$TRIAL_ROOT/cross-examine"
TARGET="$TRIAL_ROOT/target-mirror"
BASE_WT="$TRIAL_ROOT/target-base"
HEAD_WT="$TRIAL_ROOT/target-head"
EVID="$TRIAL_ROOT/evidence-original"
CE_SHA="f6524eac4270cf566d3acbf1f3a77ebb24ed904f"
BASE="4738d7993c7911ce2f58cd9569a0251d1de7e9a6"
HEAD="9c3356e30a0744919c80c0b69a88d4efa237c983"

test ! -e "$TRIAL_ROOT" || { echo "STOP: trial root already exists" >&2; exit 2; }
mkdir -p "$EVID"
umask 077
exec 3>&1 4>&2
exec > >(tee -a "$EVID/preflight.log") 2>&1

printf '%s\n' \
  'Cross-Examine real GPT-5.6 Sol trial preflight' \
  "UTC=$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
  "OS=$(uname -a)" \
  "ARCH=$(uname -m)"
git --version
uv --version

test -z "${OPENAI_API_KEY:-}" || { echo "STOP: unset OPENAI_API_KEY for offline preflight" >&2; exit 2; }
git clone https://github.com/stefbuilds/cross-examine.git "$CE"
git -C "$CE" checkout --detach "$CE_SHA"
test "$(git -C "$CE" rev-parse HEAD)" = "$CE_SHA"
test -z "$(git -C "$CE" status --porcelain)"

git clone --no-checkout https://github.com/jquast/wcwidth.git "$TARGET"
test "$(git -C "$TARGET" rev-parse "$HEAD^")" = "$BASE"
test "$(git -C "$TARGET" rev-parse "$BASE^{commit}")" = "$BASE"
test "$(git -C "$TARGET" rev-parse "$HEAD^{commit}")" = "$HEAD"
git -C "$TARGET" worktree add --detach "$BASE_WT" "$BASE"
git -C "$TARGET" worktree add --detach "$HEAD_WT" "$HEAD"
test -z "$(git -C "$BASE_WT" status --porcelain)"
test -z "$(git -C "$HEAD_WT" status --porcelain)"

git -C "$TARGET" diff --stat "$BASE..$HEAD"
git -C "$TARGET" diff --numstat "$BASE..$HEAD"
git -C "$TARGET" diff --no-ext-diff --no-color "$BASE..$HEAD" -- wcwidth/wcwidth.py \
  > "$EVID/target.diff"
git -C "$TARGET" cat-file commit "$BASE" > "$EVID/target-base.commit"
git -C "$TARGET" cat-file commit "$HEAD" > "$EVID/target-head.commit"

cd "$CE"
uv lock --check
uv sync --locked --exact --extra dev
uv run --locked --extra dev python --version
uv run --locked --extra dev pytest -q

OVERLAY=(
  uv run --project "$CE" --locked --extra dev
  --with "$HEAD_WT"
  --with-requirements "$HEAD_WT/requirements-tests39.txt"
)

cd "$BASE_WT"
TEST_STARTED=$SECONDS
PYTHONPATH="$BASE_WT/src:$BASE_WT" "${OVERLAY[@]}" python -m pytest -q -p no:cacheprovider
TEST_ELAPSED=$((SECONDS - TEST_STARTED))
printf 'BASE_TEST_SECONDS=%s\n' "$TEST_ELAPSED"
test "$TEST_ELAPSED" -le 120
cd "$HEAD_WT"
TEST_STARTED=$SECONDS
PYTHONPATH="$HEAD_WT/src:$HEAD_WT" "${OVERLAY[@]}" python -m pytest -q -p no:cacheprovider
TEST_ELAPSED=$((SECONDS - TEST_STARTED))
printf 'HEAD_TEST_SECONDS=%s\n' "$TEST_ELAPSED"
test "$TEST_ELAPSED" -le 120

for ITEM in "base:$BASE_WT" "head:$HEAD_WT"; do
  LABEL="${ITEM%%:*}"
  WT="${ITEM#*:}"
  cd "$WT"
  LABEL="$LABEL" PYTHONPATH="$WT/src:$WT" "${OVERLAY[@]}" python - <<'PY'
import inspect
import json
import os
from wcwidth.wcwidth import width

print(json.dumps({"label": os.environ["LABEL"], "signature": str(inspect.signature(width)),
                  "module_file": inspect.getfile(width)}, sort_keys=True))
for value in ["", "a", "é", "🙂"]:
    first = width(value)
    second = width(value)
    print(json.dumps({"input": value, "first": first, "second": second},
                     ensure_ascii=True, sort_keys=True))
    assert first == second
assert [width(value) for value in ["", "a", "é", "🙂"]] == [0, 1, 1, 2]
PY
done

cd "$CE"
"${OVERLAY[@]}" python - <<'PY' > "$EVID/overlay-packages.txt"
from importlib.metadata import distributions
rows = sorted({(d.metadata["Name"].lower(), d.version) for d in distributions()})
for name, version in rows:
    print(f"{name}=={version}")
PY

printf '%s\n' 'Generated files after upstream tests (expected: coverage/htmlcov may appear):'
git -C "$BASE_WT" status --short
git -C "$HEAD_WT" status --short

"${OVERLAY[@]}" --offline python - <<'PY'
import openai
import pytest
import wcwidth
print("offline_overlay_ready=true")
print(f"openai={openai.__version__}")
print(f"pytest={pytest.__version__}")
print(f"wcwidth={wcwidth.__version__}")
PY

printf '%s\n' 'PREFLIGHT_ACCEPTED=true'
exec 1>&3 2>&4
exec 3>&- 4>&-
```

Accept Gate A only if every command exits zero, the Cross-Examine tests pass, both full
upstream suites pass in less than 120 seconds each, the probe emits `[0, 1, 1, 2]` at
both refs, and the final `--offline` overlay command succeeds. Coverage files created
after the clean-ref checks are expected and must be recorded, not treated as source
mutation. If the paid run is expected to approach the 600-second total budget during
this rehearsal, reject the primary and evaluate the fallback before setting a key.

## Gate A — offline preflight on Windows

Use 64-bit PowerShell 7.3 or later, Git, `uv`, and a disposable Windows account/VM.
PowerShell 7 is required for predictable native-command and UTF-8 behavior. Copy-paste
this block into one PowerShell session:

```powershell
$ErrorActionPreference = 'Stop'
$PSNativeCommandUseErrorActionPreference = $true
$TrialRoot = Join-Path ([IO.Path]::GetTempPath()) 'cross-examine-gpt56-sol-trial-001'
$CE = Join-Path $TrialRoot 'cross-examine'
$Target = Join-Path $TrialRoot 'target-mirror'
$BaseWT = Join-Path $TrialRoot 'target-base'
$HeadWT = Join-Path $TrialRoot 'target-head'
$Evid = Join-Path $TrialRoot 'evidence-original'
$CESha = 'f6524eac4270cf566d3acbf1f3a77ebb24ed904f'
$Base = '4738d7993c7911ce2f58cd9569a0251d1de7e9a6'
$Head = '9c3356e30a0744919c80c0b69a88d4efa237c983'

if (Test-Path $TrialRoot) { throw 'STOP: trial root already exists' }
New-Item -ItemType Directory -Path $Evid | Out-Null
if ($env:OPENAI_API_KEY) { throw 'STOP: unset OPENAI_API_KEY for offline preflight' }

Start-Transcript -Path (Join-Path $Evid 'preflight.log') -NoClobber
Write-Output "UTC=$([DateTime]::UtcNow.ToString('o'))"
Get-ComputerInfo | Select-Object OsName, OsVersion, OsArchitecture
git --version
uv --version

git clone https://github.com/stefbuilds/cross-examine.git $CE
git -C $CE checkout --detach $CESha
if ((git -C $CE rev-parse HEAD) -ne $CESha) { throw 'Cross-Examine SHA mismatch' }
if (git -C $CE status --porcelain) { throw 'Cross-Examine checkout is dirty' }

git clone --no-checkout https://github.com/jquast/wcwidth.git $Target
if ((git -C $Target rev-parse "$Head^") -ne $Base) { throw 'Parent mismatch' }
if ((git -C $Target rev-parse "$Base^{commit}") -ne $Base) { throw 'Base mismatch' }
if ((git -C $Target rev-parse "$Head^{commit}") -ne $Head) { throw 'Head mismatch' }
git -C $Target worktree add --detach $BaseWT $Base
git -C $Target worktree add --detach $HeadWT $Head
if (git -C $BaseWT status --porcelain) { throw 'Base worktree is dirty before tests' }
if (git -C $HeadWT status --porcelain) { throw 'Head worktree is dirty before tests' }

git -C $Target diff --stat "$Base..$Head"
git -C $Target diff --numstat "$Base..$Head"
git -C $Target diff --no-ext-diff --no-color "$Base..$Head" -- wcwidth/wcwidth.py |
  Set-Content -Encoding utf8 (Join-Path $Evid 'target.diff')
git -C $Target cat-file commit $Base | Set-Content -Encoding utf8 (Join-Path $Evid 'target-base.commit')
git -C $Target cat-file commit $Head | Set-Content -Encoding utf8 (Join-Path $Evid 'target-head.commit')

Push-Location $CE
uv lock --check
uv sync --locked --exact --extra dev
uv run --locked --extra dev python --version
uv run --locked --extra dev pytest -q
Pop-Location

$Overlay = @(
  'run', '--project', $CE, '--locked', '--extra', 'dev',
  '--with', $HeadWT,
  '--with-requirements', (Join-Path $HeadWT 'requirements-tests39.txt')
)

Push-Location $BaseWT
$env:PYTHONPATH = "$BaseWT;$BaseWT\src"
$Timer = [Diagnostics.Stopwatch]::StartNew()
uv @Overlay python -m pytest -q -p no:cacheprovider
$Timer.Stop()
Write-Output "BASE_TEST_SECONDS=$($Timer.Elapsed.TotalSeconds)"
if ($Timer.Elapsed.TotalSeconds -gt 120) { throw 'Base tests exceed product timeout' }
Pop-Location
Push-Location $HeadWT
$env:PYTHONPATH = "$HeadWT;$HeadWT\src"
$Timer = [Diagnostics.Stopwatch]::StartNew()
uv @Overlay python -m pytest -q -p no:cacheprovider
$Timer.Stop()
Write-Output "HEAD_TEST_SECONDS=$($Timer.Elapsed.TotalSeconds)"
if ($Timer.Elapsed.TotalSeconds -gt 120) { throw 'Head tests exceed product timeout' }
Pop-Location

$Probe = @'
import inspect, json, os
from wcwidth.wcwidth import width
print(json.dumps({"label": os.environ["TRIAL_LABEL"], "signature": str(inspect.signature(width)), "module_file": inspect.getfile(width)}, sort_keys=True))
for value in ["", "a", "é", "🙂"]:
    first, second = width(value), width(value)
    print(json.dumps({"input": value, "first": first, "second": second}, ensure_ascii=True, sort_keys=True))
    assert first == second
assert [width(value) for value in ["", "a", "é", "🙂"]] == [0, 1, 1, 2]
'@
foreach ($Pair in @(@('base', $BaseWT), @('head', $HeadWT))) {
  $env:TRIAL_LABEL = $Pair[0]
  $env:PYTHONPATH = "$($Pair[1]);$($Pair[1])\src"
  Push-Location $Pair[1]
  $Probe | uv @Overlay python -
  Pop-Location
}

Remove-Item Env:PYTHONPATH -ErrorAction SilentlyContinue
Push-Location $CE
uv @Overlay python -c "from importlib.metadata import distributions; print('\n'.join(f'{n}=={v}' for n,v in sorted({(d.metadata['Name'].lower(),d.version) for d in distributions()})))" |
  Set-Content -Encoding utf8 (Join-Path $Evid 'overlay-packages.txt')
Write-Output 'Generated files after upstream tests (expected: coverage/htmlcov may appear):'
git -C $BaseWT status --short
git -C $HeadWT status --short
uv @Overlay --offline python -c "import openai,pytest,wcwidth; print('offline_overlay_ready=true'); print(f'openai={openai.__version__}'); print(f'pytest={pytest.__version__}'); print(f'wcwidth={wcwidth.__version__}')"
Pop-Location
Write-Output 'PREFLIGHT_ACCEPTED=true'
Stop-Transcript
```

Apply the same Gate A acceptance conditions as on macOS/Linux. If PowerShell stops on a
native pipeline, record `$LASTEXITCODE` immediately; do not continue to the paid gate.

## Gate B — install the temporary observer

Create `$TRIAL_ROOT/run-once.py` (Windows) or `$TRIAL_ROOT/run-once.py`
(macOS/Linux) with the exact content below. This is not production code and must never
be copied into the Cross-Examine checkout. Its request hook counts only
`POST /v1/responses`, refuses a second such request before transmission, never records
headers or request bodies, and persists evidence at each transition. The SHA-256
manifest later binds this exact observer.

```python
from __future__ import annotations

import argparse
import hashlib
import json
import os
import platform
import sys
from importlib.metadata import version
from pathlib import Path
from typing import Any

import httpx
from openai import OpenAI

from cross_examine.characterize.service import Characterizer
from cross_examine.cli import _execute
from cross_examine.codec import report_to_json
from cross_examine.persistence.database import Database
from cross_examine.persistence.runs import RunRepository
from cross_examine.schema import Outcome, RunSpec
from cross_examine.validation import validate_report


def canonical(value: Any) -> bytes:
    return json.dumps(value, ensure_ascii=False, separators=(",", ":"),
                      sort_keys=True).encode("utf-8")


def serializable(value: Any) -> Any:
    if value is None:
        return None
    if hasattr(value, "model_dump"):
        return value.model_dump(mode="json")
    if isinstance(value, (str, int, float, bool, list, dict)):
        return value
    return str(value)


class Journal:
    def __init__(self, path: Path, initial: dict[str, Any]) -> None:
        self.path = path
        self.data = initial
        self.flush()

    def update(self, **values: Any) -> None:
        self.data.update(values)
        self.flush()

    def flush(self) -> None:
        temporary = self.path.with_suffix(".tmp")
        temporary.write_bytes(canonical(self.data) + b"\n")
        temporary.replace(self.path)


class RecordingResponses:
    def __init__(self, delegate: Any, journal: Journal) -> None:
        self.delegate = delegate
        self.journal = journal
        self.calls = 0

    def parse(self, **kwargs: Any) -> Any:
        self.calls += 1
        prompt_hash = hashlib.sha256(canonical(kwargs.get("input"))).hexdigest()
        text_format = kwargs.get("text_format")
        self.journal.update(
            sdk_parse_calls=self.calls,
            parse_intent={
                "input_sha256": prompt_hash,
                "model": kwargs.get("model"),
                "store": kwargs.get("store"),
                "timeout": kwargs.get("timeout"),
                "text_format": getattr(text_format, "__name__", str(text_format)),
            },
        )
        response = self.delegate.parse(**kwargs)
        self.journal.update(
            response={
                "id": getattr(response, "id", None),
                "model": getattr(response, "model", None),
                "request_id": getattr(response, "_request_id", None),
                "usage": serializable(getattr(response, "usage", None)),
            }
        )
        return response


class RecordingClient:
    def __init__(self, client: OpenAI, journal: Journal) -> None:
        self.responses = RecordingResponses(client.responses, journal)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--repo", required=True)
    parser.add_argument("--base", required=True)
    parser.add_argument("--head", required=True)
    parser.add_argument("--workspace", required=True, type=Path)
    parser.add_argument("--evidence", required=True, type=Path)
    parser.add_argument("--cross-examine-sha", required=True)
    parser.add_argument("--target-symbol", required=True)
    args = parser.parse_args()

    if not os.environ.get("OPENAI_API_KEY"):
        raise SystemExit("OPENAI_API_KEY is absent")
    if os.environ.get("OPENAI_BASE_URL"):
        raise SystemExit("OPENAI_BASE_URL must be unset")
    if args.workspace.exists():
        raise SystemExit("workspace must not already exist")
    args.evidence.mkdir(parents=True, exist_ok=True)

    journal = Journal(args.evidence / "model-proof.json", {
        "status": "initializing",
        "requested_model": "gpt-5.6-sol",
        "cross_examine_sha": args.cross_examine_sha,
        "target": {"repo": args.repo, "base": args.base, "head": args.head,
                   "symbol": args.target_symbol},
        "runtime": {
            "python": sys.version,
            "platform": platform.platform(),
            "openai": version("openai"),
            "httpx": version("httpx"),
        },
        "responses_http_attempts": 0,
        "sdk_parse_calls": 0,
    })

    http_state: dict[str, Any] = {"attempts": 0}

    def is_responses(request: httpx.Request) -> bool:
        return request.method == "POST" and request.url.path.rstrip("/") == "/v1/responses"

    def on_request(request: httpx.Request) -> None:
        if not is_responses(request):
            return
        http_state["attempts"] += 1
        if http_state["attempts"] > 1:
            raise RuntimeError("refusing a second POST /v1/responses attempt")
        journal.update(
            status="request-sent",
            responses_http_attempts=http_state["attempts"],
            http_request={"method": request.method, "path": request.url.path},
        )

    def on_response(response: httpx.Response) -> None:
        if not is_responses(response.request):
            return
        journal.update(
            status="response-headers",
            http_response={
                "status_code": response.status_code,
                "request_id": response.headers.get("x-request-id"),
            },
        )

    try:
        with httpx.Client(event_hooks={"request": [on_request], "response": [on_response]}) as http:
            client = OpenAI(max_retries=0, http_client=http)
            recording = RecordingClient(client, journal)
            characterizer = Characterizer(recording, model="gpt-5.6-sol")
            report, run_id = _execute(
                RunSpec(
                    repo=args.repo,
                    base_ref=args.base,
                    head_ref=args.head,
                    layer_b=False,
                    command_timeout_seconds=120,
                    run_timeout_seconds=600,
                ),
                characterizer,
                args.workspace,
            )

        validate_report(report)
        report_json = report_to_json(report)
        (args.evidence / "report.json").write_text(report_json + "\n", encoding="utf-8")
        persisted = RunRepository(Database(args.workspace / "cross-examine.db")).get(run_id)
        persisted_equal = bool(
            persisted is not None
            and persisted.report is not None
            and report_to_json(persisted.report) == report_json
        )

        stage_failures = sorted(
            claim.id for claim in report.claims
            if claim.id.startswith("system:") and claim.id != "system:head-tests"
        )
        target_claim_present = any(
            claim.id != "system:head-tests"
            and claim.target_symbol == args.target_symbol
            for claim in report.claims
        )
        head_tests_verified = any(
            finding.claim_id == "system:head-tests"
            and finding.outcome is Outcome.VERIFIED
            for finding in report.findings
        )
        grounded = all(
            finding.outcome is Outcome.UNVERIFIABLE
            or (bool(finding.command.strip()) and bool(finding.output.strip()))
            for finding in report.findings
        )
        response = journal.data.get("response") or {}
        usage = response.get("usage") or {}
        returned_model = response.get("model") or ""
        header_request_id = (journal.data.get("http_response") or {}).get("request_id")
        sdk_request_id = response.get("request_id")
        request_ids_consistent = bool(
            (header_request_id or sdk_request_id)
            and (not header_request_id or not sdk_request_id or header_request_id == sdk_request_id)
        )
        accepted = all([
            journal.data.get("sdk_parse_calls") == 1,
            journal.data.get("responses_http_attempts") == 1,
            (journal.data.get("http_response") or {}).get("status_code") == 200,
            (journal.data.get("parse_intent") or {}).get("model") == "gpt-5.6-sol",
            (journal.data.get("parse_intent") or {}).get("store") is False,
            returned_model.startswith("gpt-5.6-sol"),
            bool(response.get("id")),
            request_ids_consistent,
            int(usage.get("input_tokens", 0)) > 0,
            int(usage.get("output_tokens", 0)) > 0,
            report.pr_ref == f"{args.base}..{args.head}",
            target_claim_present,
            not stage_failures,
            head_tests_verified,
            grounded,
            persisted_equal,
            report.corpus is not None,
        ])
        journal.update(
            status="accepted" if accepted else "completed-not-accepted",
            run_id=run_id,
            report={
                "sha256": hashlib.sha256(report_json.encode("utf-8")).hexdigest(),
                "verdict": report.verdict.value,
                "pr_ref": report.pr_ref,
                "claims": len(report.claims),
                "findings": len(report.findings),
                "stage_failures": stage_failures,
                "target_claim_present": target_claim_present,
                "head_tests_verified": head_tests_verified,
                "grounded": grounded,
                "persisted_equal": persisted_equal,
            },
            accepted=accepted,
        )
        print(json.dumps(journal.data, ensure_ascii=False, indent=2, sort_keys=True))
        return 0 if accepted else 3
    except BaseException as error:
        journal.update(
            status="exception",
            error={"type": type(error).__name__, "message": str(error)},
        )
        raise


if __name__ == "__main__":
    raise SystemExit(main())
```

Before proceeding, compile and hash the observer without a key.

macOS/Linux:

```bash
TRIAL_ROOT="${TMPDIR:-/tmp}/cross-examine-gpt56-sol-trial-001"
CE="$TRIAL_ROOT/cross-examine"
EVID="$TRIAL_ROOT/evidence-original"
"$CE/.venv/bin/python" -m py_compile "$TRIAL_ROOT/run-once.py"
"$CE/.venv/bin/python" - "$TRIAL_ROOT/run-once.py" <<'PY' | tee "$EVID/observer.sha256"
import hashlib, pathlib, sys
p = pathlib.Path(sys.argv[1])
print(hashlib.sha256(p.read_bytes()).hexdigest(), p.name)
PY
```

Windows:

```powershell
$TrialRoot = Join-Path ([IO.Path]::GetTempPath()) 'cross-examine-gpt56-sol-trial-001'
$CE = Join-Path $TrialRoot 'cross-examine'
$Evid = Join-Path $TrialRoot 'evidence-original'
$Py = Join-Path $CE '.venv\Scripts\python.exe'
& $Py -m py_compile (Join-Path $TrialRoot 'run-once.py')
& $Py -c "import hashlib,pathlib,sys; p=pathlib.Path(sys.argv[1]); print(hashlib.sha256(p.read_bytes()).hexdigest(),p.name)" (Join-Path $TrialRoot 'run-once.py') |
  Tee-Object -FilePath (Join-Path $Evid 'observer.sha256')
```

## Gate C — human-only API and budget checks

These are the first API-key-dependent actions and were **not** executed while preparing
this handoff. The human operator must:

1. Create/use a dedicated OpenAI project with only the funds needed for this trial and
   set a hard project budget of **$5 or less**. Confirm no other process uses that key.
2. Inject `OPENAI_API_KEY` out of band. Do not paste it into a transcript, shell history,
   `.env` file, command argument, screenshot, or chat. Stop transcript capture before
   key injection and never enable shell tracing or `OPENAI_LOG`.
3. Confirm the key can retrieve `gpt-5.6-sol`. This authenticated model lookup is not a
   Responses generation and is allowed before the one paid request. Preserve its model
   ID and request ID, never its authorization header.

The exact model-visibility command is cross-platform; run it using the preflight overlay.

macOS/Linux:

```bash
set -uo pipefail
TRIAL_ROOT="${TMPDIR:-/tmp}/cross-examine-gpt56-sol-trial-001"
CE="$TRIAL_ROOT/cross-examine"
HEAD_WT="$TRIAL_ROOT/target-head"
EVID="$TRIAL_ROOT/evidence-original"
test -n "${OPENAI_API_KEY:-}" || { echo 'STOP: key absent' >&2; exit 2; }
test -z "${OPENAI_BASE_URL:-}" || { echo 'STOP: OPENAI_BASE_URL must be unset' >&2; exit 2; }
uv run --project "$CE" --locked --extra dev --with "$HEAD_WT" \
  --with-requirements "$HEAD_WT/requirements-tests39.txt" --offline python - <<'PY' \
  | tee "$EVID/model-visibility.json"
import json
from openai import OpenAI
m = OpenAI(max_retries=0).models.retrieve("gpt-5.6-sol")
print(json.dumps({"id": m.id, "request_id": getattr(m, "_request_id", None)}, sort_keys=True))
PY
VISIBILITY_EXIT=${PIPESTATUS[0]}
if test "$VISIBILITY_EXIT" -ne 0; then
  unset OPENAI_API_KEY
  printf 'STOP: model visibility failed (%s)\n' "$VISIBILITY_EXIT" >&2
  exit "$VISIBILITY_EXIT"
fi
```

Windows PowerShell 7:

```powershell
$ErrorActionPreference = 'Stop'
$PSNativeCommandUseErrorActionPreference = $true
$TrialRoot = Join-Path ([IO.Path]::GetTempPath()) 'cross-examine-gpt56-sol-trial-001'
$CE = Join-Path $TrialRoot 'cross-examine'
$HeadWT = Join-Path $TrialRoot 'target-head'
$Evid = Join-Path $TrialRoot 'evidence-original'
if (-not $env:OPENAI_API_KEY) { throw 'STOP: key absent' }
if ($env:OPENAI_BASE_URL) { throw 'STOP: OPENAI_BASE_URL must be unset' }
$Overlay = @('run','--project',$CE,'--locked','--extra','dev','--with',$HeadWT,
  '--with-requirements',(Join-Path $HeadWT 'requirements-tests39.txt'),'--offline')
$PSNativeCommandUseErrorActionPreference = $false
uv @Overlay python -c "import json; from openai import OpenAI; m=OpenAI(max_retries=0).models.retrieve('gpt-5.6-sol'); print(json.dumps({'id':m.id,'request_id':getattr(m,'_request_id',None)},sort_keys=True))" |
  Tee-Object -FilePath (Join-Path $Evid 'model-visibility.json')
$VisibilityExit = $LASTEXITCODE
$PSNativeCommandUseErrorActionPreference = $true
if ($VisibilityExit -ne 0) {
  Remove-Item Env:OPENAI_API_KEY -ErrorAction SilentlyContinue
  throw "STOP: model visibility failed ($VisibilityExit)"
}
```

Stop without a generation if the returned `id` is not `gpt-5.6-sol`, the request fails,
or the project budget/key scope is uncertain.

## Gate D — the one paid generation and full run

This gate is the only command allowed to issue `POST /v1/responses`. Before it starts,
the workspace must not exist. The observer will refuse a second Responses HTTP attempt,
and `OpenAI(max_retries=0)` disables the SDK's default automatic retries. The OpenAI
Python SDK documents both [request IDs](https://github.com/openai/openai-python#request-ids)
and [two automatic retries by default](https://github.com/openai/openai-python#retries).

Do not stream this command into an online service. The local log is security-sensitive
until redaction is complete.

macOS/Linux:

```bash
set -uo pipefail
TRIAL_ROOT="${TMPDIR:-/tmp}/cross-examine-gpt56-sol-trial-001"
CE="$TRIAL_ROOT/cross-examine"
HEAD_WT="$TRIAL_ROOT/target-head"
EVID="$TRIAL_ROOT/evidence-original"
RUN_WS="$TRIAL_ROOT/paid-workspace"
BASE="4738d7993c7911ce2f58cd9569a0251d1de7e9a6"
HEAD="9c3356e30a0744919c80c0b69a88d4efa237c983"
CE_SHA="f6524eac4270cf566d3acbf1f3a77ebb24ed904f"

test -n "${OPENAI_API_KEY:-}" || { echo 'STOP: key absent' >&2; exit 2; }
test ! -e "$RUN_WS" || { echo 'STOP: workspace already exists' >&2; exit 2; }
trap 'unset OPENAI_API_KEY' EXIT INT TERM
unset CROSS_EXAMINE_DB CROSS_EXAMINE_RUNS CROSS_EXAMINE_DEMO_CHARACTERIZER
unset OPENAI_BASE_URL OPENAI_LOG PYTHONPATH PYTEST_ADDOPTS COVERAGE_PROCESS_START
unset VIRTUAL_ENV UV_PROJECT_ENVIRONMENT

uv run --project "$CE" --locked --extra dev --with "$HEAD_WT" \
  --with-requirements "$HEAD_WT/requirements-tests39.txt" --offline \
  python "$TRIAL_ROOT/run-once.py" \
  --repo https://github.com/jquast/wcwidth.git \
  --base "$BASE" --head "$HEAD" \
  --workspace "$RUN_WS" --evidence "$EVID" \
  --cross-examine-sha "$CE_SHA" \
  --target-symbol wcwidth.wcwidth:width \
  2>&1 | tee "$EVID/trial.log"
RUN_EXIT=${PIPESTATUS[0]}
unset OPENAI_API_KEY
trap - EXIT INT TERM
printf 'RUN_EXIT=%s\n' "$RUN_EXIT" | tee "$EVID/run-exit.txt"
test "$RUN_EXIT" -eq 0
```

Windows PowerShell 7:

```powershell
$ErrorActionPreference = 'Stop'
$PSNativeCommandUseErrorActionPreference = $true
$TrialRoot = Join-Path ([IO.Path]::GetTempPath()) 'cross-examine-gpt56-sol-trial-001'
$CE = Join-Path $TrialRoot 'cross-examine'
$HeadWT = Join-Path $TrialRoot 'target-head'
$Evid = Join-Path $TrialRoot 'evidence-original'
$RunWS = Join-Path $TrialRoot 'paid-workspace'
$Base = '4738d7993c7911ce2f58cd9569a0251d1de7e9a6'
$Head = '9c3356e30a0744919c80c0b69a88d4efa237c983'
$CESha = 'f6524eac4270cf566d3acbf1f3a77ebb24ed904f'
if (-not $env:OPENAI_API_KEY) { throw 'STOP: key absent' }
if (Test-Path $RunWS) { throw 'STOP: workspace already exists' }
@('CROSS_EXAMINE_DB','CROSS_EXAMINE_RUNS','CROSS_EXAMINE_DEMO_CHARACTERIZER',
  'OPENAI_BASE_URL','OPENAI_LOG','PYTHONPATH','PYTEST_ADDOPTS','COVERAGE_PROCESS_START',
  'VIRTUAL_ENV','UV_PROJECT_ENVIRONMENT') | ForEach-Object {
    Remove-Item "Env:$_" -ErrorAction SilentlyContinue
  }
$Overlay = @('run','--project',$CE,'--locked','--extra','dev','--with',$HeadWT,
  '--with-requirements',(Join-Path $HeadWT 'requirements-tests39.txt'),'--offline')
$PSNativeCommandUseErrorActionPreference = $false
try {
  uv @Overlay python (Join-Path $TrialRoot 'run-once.py') `
    --repo https://github.com/jquast/wcwidth.git `
    --base $Base --head $Head `
    --workspace $RunWS --evidence $Evid `
    --cross-examine-sha $CESha `
    --target-symbol 'wcwidth.wcwidth:width' 2>&1 |
    Tee-Object -FilePath (Join-Path $Evid 'trial.log')
  $RunExit = $LASTEXITCODE
} finally {
  Remove-Item Env:OPENAI_API_KEY -ErrorAction SilentlyContinue
  $PSNativeCommandUseErrorActionPreference = $true
}
"RUN_EXIT=$RunExit" | Tee-Object -FilePath (Join-Path $Evid 'run-exit.txt')
if ($RunExit -ne 0) { throw "trial not accepted ($RunExit); preserve it and do not retry" }
```

There is one deliberate network caveat: `--offline` covers the Python overlay, but the
Cross-Examine Ingest stage still clones the canonical GitHub URL and Characterize calls
OpenAI. If the isolation environment supports egress rules, allow only GitHub for the
clone and `api.openai.com` for the model call. Do not represent this as a sandbox.

## Gate E — no-model Render check and evidence finalization

After the paid process has exited and the key has been removed, exercise the persisted
Render API without creating a pipeline or model client. The `GET` route reads the
completed run from SQLite; it does not call the supplied default pipeline factory.

macOS/Linux:

```bash
set -euo pipefail
TRIAL_ROOT="${TMPDIR:-/tmp}/cross-examine-gpt56-sol-trial-001"
CE="$TRIAL_ROOT/cross-examine"
HEAD_WT="$TRIAL_ROOT/target-head"
EVID="$TRIAL_ROOT/evidence-original"
RUN_WS="$TRIAL_ROOT/paid-workspace"
test -z "${OPENAI_API_KEY:-}" || { echo 'STOP: key still present' >&2; exit 2; }
RUN_ID=$("$CE/.venv/bin/python" -c 'import json,sys; print(json.load(open(sys.argv[1]))["run_id"])' "$EVID/model-proof.json")
RUN_ID="$RUN_ID" DB="$RUN_WS/cross-examine.db" REPORT="$EVID/report.json" \
uv run --project "$CE" --locked --extra dev --with "$HEAD_WT" \
  --with-requirements "$HEAD_WT/requirements-tests39.txt" --offline python - <<'PY' \
  > "$EVID/render-api.json"
import json, os
from fastapi.testclient import TestClient
from cross_examine.api.app import create_app
with TestClient(create_app(os.environ["DB"])) as client:
    response = client.get(f'/api/runs/{os.environ["RUN_ID"]}')
    response.raise_for_status()
    payload = response.json()
    with open(os.environ["REPORT"], encoding="utf-8") as source:
        assert payload["report"] == json.load(source)
    print(json.dumps(payload, ensure_ascii=False, separators=(",", ":"), sort_keys=True))
PY

"$CE/.venv/bin/python" - "$TRIAL_ROOT" <<'PY' > "$EVID/manifest.sha256"
import hashlib, pathlib, sys
root = pathlib.Path(sys.argv[1]).resolve()
excluded = {root / "evidence-original" / "manifest.sha256"}
for path in sorted(p for p in root.rglob("*") if p.is_file() and p not in excluded):
    print(hashlib.sha256(path.read_bytes()).hexdigest(), path.relative_to(root).as_posix())
PY
```

Windows PowerShell 7:

```powershell
$ErrorActionPreference = 'Stop'
$PSNativeCommandUseErrorActionPreference = $true
$TrialRoot = Join-Path ([IO.Path]::GetTempPath()) 'cross-examine-gpt56-sol-trial-001'
$CE = Join-Path $TrialRoot 'cross-examine'
$HeadWT = Join-Path $TrialRoot 'target-head'
$Evid = Join-Path $TrialRoot 'evidence-original'
$RunWS = Join-Path $TrialRoot 'paid-workspace'
if ($env:OPENAI_API_KEY) { throw 'STOP: key still present' }
$Py = Join-Path $CE '.venv\Scripts\python.exe'
$RunID = & $Py -c "import json,sys; print(json.load(open(sys.argv[1]))['run_id'])" (Join-Path $Evid 'model-proof.json')
$env:TRIAL_RUN_ID = $RunID
$env:TRIAL_DB = Join-Path $RunWS 'cross-examine.db'
$env:TRIAL_REPORT = Join-Path $Evid 'report.json'
$Overlay = @('run','--project',$CE,'--locked','--extra','dev','--with',$HeadWT,
  '--with-requirements',(Join-Path $HeadWT 'requirements-tests39.txt'),'--offline')
$Render = @'
import json, os
from fastapi.testclient import TestClient
from cross_examine.api.app import create_app
with TestClient(create_app(os.environ["TRIAL_DB"])) as client:
    response = client.get(f'/api/runs/{os.environ["TRIAL_RUN_ID"]}')
    response.raise_for_status()
    payload = response.json()
    with open(os.environ["TRIAL_REPORT"], encoding="utf-8") as source:
        assert payload["report"] == json.load(source)
    print(json.dumps(payload, ensure_ascii=False, separators=(",", ":"), sort_keys=True))
'@
$Render | uv @Overlay python - | Set-Content -Encoding utf8 (Join-Path $Evid 'render-api.json')
& $Py -c "import hashlib,pathlib,sys; root=pathlib.Path(sys.argv[1]).resolve(); excluded={root/'evidence-original'/'manifest.sha256'}; print('\n'.join(f'{hashlib.sha256(p.read_bytes()).hexdigest()} {p.relative_to(root).as_posix()}' for p in sorted(x for x in root.rglob('*') if x.is_file() and x not in excluded)))" $TrialRoot |
  Set-Content -Encoding utf8 (Join-Path $Evid 'manifest.sha256')
Remove-Item Env:TRIAL_RUN_ID, Env:TRIAL_DB, Env:TRIAL_REPORT -ErrorAction SilentlyContinue
```

Do not run `serve`, another trial, or any command that can alter the database before
hashing. Preserve the whole trial directory read-only. Python virtual environments are
not portable, so the evidence package is a historical capture; reproduction starts
from the immutable sources and commands, not by moving `.venv` to another host.

## Expected evidence and acceptance criteria

The original package must contain at least:

- `evidence-original/preflight.log`, the immutable commit objects, exact diff, overlay
  package list, byte-for-byte `operator-handoff.md`, observer hash, and model-visibility
  result;
- `evidence-original/model-proof.json`, durably updated before request, at HTTP headers,
  after parsing, and after report validation;
- `evidence-original/trial.log`, `run-exit.txt`, canonical `report.json`, and
  `render-api.json`;
- `paid-workspace/cross-examine.db` and the entire
  `paid-workspace/runs/<run-id>/` tree, including cloned repo/worktrees and probe state;
- the exact `run-once.py` and `evidence-original/manifest.sha256` covering all retained
  files other than the manifest itself.

Accept the run as the missing real Characterize proof only when all conditions hold:

1. Gate A passed before a key was present, using the exact overlay later used by Gate D.
2. `model-proof.json` records exactly one SDK `parse` call and exactly one
   `POST /v1/responses` HTTP attempt, HTTP 200, requested model exactly
   `gpt-5.6-sol`, `store=false`, a returned model in the `gpt-5.6-sol` family, a real
   API request ID, a separate response ID, and nonzero input/output token usage.
3. `pr_ref` is exactly
   `4738d7993c7911ce2f58cd9569a0251d1de7e9a6..9c3356e30a0744919c80c0b69a88d4efa237c983`.
4. At least one non-system characterized claim targets
   `wcwidth.wcwidth:width`; no `system:<stage>` failure claim exists.
5. `system:head-tests` exists and is `VERIFIED`. Every `VERIFIED` or `REFUTED` finding
   has a nonempty exact command and captured output. `UNVERIFIABLE` findings remain
   visible and drive risk when preserve-critical.
6. The report has a corpus delta, the database report is canonically byte-equivalent to
   `report.json`, and `/api/runs/<run-id>` returns the same report through the Render
   contract.
7. The observer returns zero and sets `accepted=true`; the manifest verifies; the
   publishable copy passes secret/path review with a complete redaction ledger.

`SAFE` is plausible for this preservation-only fast path, but no verdict is required.
A deterministically grounded `RISKY` or `BROKEN` result is honest evidence. Conversely,
an exit code of zero from the stock CLI would never by itself be sufficient, because
stage failures are represented as completed `RISKY` reports.

## Failure branches: never improvise after a request

| Point | Evidence/action | May use fallback? |
|---|---|---|
| Immutable SHA/parent/diff check fails | Save preflight output; stop as supply-chain mismatch | Yes, before key/request |
| Overlay cannot install offline, import, or pass both suites inside limits | Save exact output; reject primary | Yes, before key/request |
| Model lookup fails or project budget/key scope is unclear | Save sanitized lookup failure; stop with no generation | Yes, before Responses request |
| Second Responses attempt is observed | Hook refuses it; preserve journal/log; trial failed | No |
| API/SDK error, timeout, refusal, parse failure, or missing request metadata | Preserve partial journal and exact exception; do not retry | No |
| Ingest/Characterize/Cross-examine/Test/Aggregate failure claim appears | Preserve `RISKY` report and artifacts; trial not accepted | No |
| No claim targets `wcwidth.wcwidth:width` | Real model call occurred but candidate proof criterion failed; report honestly | No |
| Base tests fail | `system:head-tests` is unverifiable; preflight was not representative | No |
| Base passes and head genuinely fails | Preserve deterministic refutation and verdict; investigate only offline on copied artifacts | No paid retry |
| Command times out or output is truncated | Preserve exact manifest/output and risk result | No |
| DB report differs from export or Render response fails | Preserve all three forms; trial failed evidence-integrity check | No |
| Secret scan/redaction cannot be proven | Keep originals restricted; do not publish | Not relevant |

Once the request hook records an attempted `POST /v1/responses`, **do not run the
fallback and do not repeat the primary**, even if no billable response is returned.

## Exact fallback, usable only before a Responses attempt

Fallback repository and pins:

```text
https://github.com/un33k/python-slugify.git
base=45f9d33a3a0d7302120d2dde26fa2ac6131edb6b
head=1ef698fa7a265ec8971d0b641fb6e735dcd667dc
dependency=text-unidecode==1.3
target=slugify.slugify:slugify
```

Start a **new** trial root. Use the same clean Cross-Examine pin and the exact observer
above; its `--target-symbol` argument means no source edit is needed. The upstream
immutable `setup.py` declares `text-unidecode>=1.3`; pinning `1.3` removes that resolver
choice.

Exact fallback setup/probe on macOS/Linux:

```bash
set -euo pipefail
FROOT="${TMPDIR:-/tmp}/cross-examine-gpt56-sol-fallback-001"
CE="$FROOT/cross-examine"
TARGET="$FROOT/target-mirror"
BASE_WT="$FROOT/target-base"
HEAD_WT="$FROOT/target-head"
EVID="$FROOT/evidence-original"
CE_SHA="f6524eac4270cf566d3acbf1f3a77ebb24ed904f"
BASE="45f9d33a3a0d7302120d2dde26fa2ac6131edb6b"
HEAD="1ef698fa7a265ec8971d0b641fb6e735dcd667dc"
test ! -e "$FROOT" || { echo 'STOP: fallback root exists' >&2; exit 2; }
mkdir -p "$EVID"
test -z "${OPENAI_API_KEY:-}" || { echo 'STOP: key must be absent' >&2; exit 2; }
git clone https://github.com/stefbuilds/cross-examine.git "$CE"
git -C "$CE" checkout --detach "$CE_SHA"
test "$(git -C "$CE" rev-parse HEAD)" = "$CE_SHA"
git clone --no-checkout https://github.com/un33k/python-slugify.git "$TARGET"
test "$(git -C "$TARGET" rev-parse "$HEAD^")" = "$BASE"
git -C "$TARGET" worktree add --detach "$BASE_WT" "$BASE"
git -C "$TARGET" worktree add --detach "$HEAD_WT" "$HEAD"
git -C "$TARGET" diff --no-ext-diff --no-color "$BASE..$HEAD" > "$EVID/target.diff"
cd "$CE"
uv lock --check
uv sync --locked --exact --extra dev
uv run --locked --extra dev pytest -q
FALLBACK_OVERLAY=(uv run --project "$CE" --locked --extra dev --with 'text-unidecode==1.3')
for ITEM in "base:$BASE_WT" "head:$HEAD_WT"; do
  LABEL="${ITEM%%:*}"; WT="${ITEM#*:}"; cd "$WT"; STARTED=$SECONDS
  PYTHONPATH="$WT/src:$WT" "${FALLBACK_OVERLAY[@]}" python -m pytest -q -p no:cacheprovider
  ELAPSED=$((SECONDS - STARTED)); printf '%s_TEST_SECONDS=%s\n' "$LABEL" "$ELAPSED"
  test "$ELAPSED" -le 120
  PYTHONPATH="$WT/src:$WT" "${FALLBACK_OVERLAY[@]}" python - <<'PY'
from slugify.slugify import slugify
for value in ["", "hello world", "影師嗎", "C'est déjà l'été."]:
    first, second = slugify(value), slugify(value)
    print(repr(value), repr(first), repr(second))
    assert first == second
PY
done
cd "$CE"
"${FALLBACK_OVERLAY[@]}" --offline python -c "import slugify; print('FALLBACK_PREFLIGHT_ACCEPTED=true')"
```

Exact fallback setup/probe on Windows PowerShell 7:

```powershell
$ErrorActionPreference = 'Stop'
$PSNativeCommandUseErrorActionPreference = $true
$FRoot = Join-Path ([IO.Path]::GetTempPath()) 'cross-examine-gpt56-sol-fallback-001'
$CE = Join-Path $FRoot 'cross-examine'
$Target = Join-Path $FRoot 'target-mirror'
$BaseWT = Join-Path $FRoot 'target-base'
$HeadWT = Join-Path $FRoot 'target-head'
$Evid = Join-Path $FRoot 'evidence-original'
$CESha = 'f6524eac4270cf566d3acbf1f3a77ebb24ed904f'
$Base = '45f9d33a3a0d7302120d2dde26fa2ac6131edb6b'
$Head = '1ef698fa7a265ec8971d0b641fb6e735dcd667dc'
if (Test-Path $FRoot) { throw 'STOP: fallback root exists' }
if ($env:OPENAI_API_KEY) { throw 'STOP: key must be absent' }
New-Item -ItemType Directory -Path $Evid | Out-Null
git clone https://github.com/stefbuilds/cross-examine.git $CE
git -C $CE checkout --detach $CESha
if ((git -C $CE rev-parse HEAD) -ne $CESha) { throw 'Cross-Examine SHA mismatch' }
git clone --no-checkout https://github.com/un33k/python-slugify.git $Target
if ((git -C $Target rev-parse "$Head^") -ne $Base) { throw 'Parent mismatch' }
git -C $Target worktree add --detach $BaseWT $Base
git -C $Target worktree add --detach $HeadWT $Head
git -C $Target diff --no-ext-diff --no-color "$Base..$Head" |
  Set-Content -Encoding utf8 (Join-Path $Evid 'target.diff')
Push-Location $CE
uv lock --check
uv sync --locked --exact --extra dev
uv run --locked --extra dev pytest -q
Pop-Location
$FallbackOverlay = @('run','--project',$CE,'--locked','--extra','dev','--with','text-unidecode==1.3')
$Probe = @'
from slugify.slugify import slugify
for value in ["", "hello world", "影師嗎", "C'est déjà l'été."]:
    first, second = slugify(value), slugify(value)
    print(repr(value), repr(first), repr(second))
    assert first == second
'@
foreach ($Pair in @(@('base', $BaseWT), @('head', $HeadWT))) {
  $env:PYTHONPATH = "$($Pair[1]);$($Pair[1])\src"
  Push-Location $Pair[1]
  $Timer = [Diagnostics.Stopwatch]::StartNew()
  uv @FallbackOverlay python -m pytest -q -p no:cacheprovider
  $Timer.Stop()
  Write-Output "$($Pair[0])_TEST_SECONDS=$($Timer.Elapsed.TotalSeconds)"
  if ($Timer.Elapsed.TotalSeconds -gt 120) { throw 'Fallback tests exceed product timeout' }
  $Probe | uv @FallbackOverlay python -
  Pop-Location
}
Remove-Item Env:PYTHONPATH -ErrorAction SilentlyContinue
uv @FallbackOverlay --offline python -c "import slugify; print('FALLBACK_PREFLIGHT_ACCEPTED=true')"
```

If this fallback preflight passes, create the observer verbatim in the new root and run
Gates B–E with the fallback variables. The paid command arguments must be exactly:

```text
--repo https://github.com/un33k/python-slugify.git
--base 45f9d33a3a0d7302120d2dde26fa2ac6131edb6b
--head 1ef698fa7a265ec8971d0b641fb6e735dcd667dc
--target-symbol slugify.slugify:slugify
```

Use `FALLBACK_OVERLAY`/`FallbackOverlay` plus `--offline` in place of the primary
overlay for the model lookup, paid observer, and Render commands. Apply every other
acceptance, one-attempt, hashing, and redaction rule unchanged.

Do not call the fallback “unfamiliar”: disclose that its immutable pair was the earlier
manual-claims SAFE trial. It is operational continuity evidence if the primary cannot
survive offline setup, not the strongest judge narrative.

## Redaction and publication rules

1. Keep `evidence-original/` and the whole paid workspace access-controlled and
   immutable. Never edit originals after `manifest.sha256` is created.
2. Create a separate `evidence-publish/` copy. Replace only host-identifying absolute
   paths/usernames with `<TRIAL_ROOT>`/`<REDACTED_USER>` and, if policy requires it,
   replace full API request/response IDs with a SHA-256 plus the last six characters.
   Keep the full IDs in originals.
3. Never publish an API key, authorization/cookie header, `.env`, shell history, home
   directory inventory, unrelated environment variables, or OpenAI project/billing
   identifiers. The observer intentionally records neither request headers nor prompt
   bodies.
4. Create `evidence-publish/redaction-ledger.md` listing every file, original token
   class, replacement, and reason. Do not redact commands, exit codes, target refs,
   semantic outputs, verdicts, claims, or finding evidence.
5. Hash the publishable copy separately. Verify the original manifest before and after
   redaction work. Scan the publishable copy for common key prefixes, `Authorization`,
   `Bearer`, the operator username/home path, and the exact key using a local script that
   prints only pass/fail—not the searched secret.
6. A screenshot is optional. If supplied, show the rendered run only after redaction;
   it supplements but never replaces `render-api.json`, `report.json`, SQLite, exact
   command/output evidence, and hashes.

`store=False` prevents response storage for later retrieval through the API, but it is
not a zero-retention promise. OpenAI states that API data is not used for training by
default unless an organization opts in and that abuse-monitoring logs may be retained
for up to 30 days; the operator must accept the applicable project policy before the
human-only action.

## Time and cost envelope

The [GPT-5.6 Sol model page](https://developers.openai.com/api/docs/models/gpt-5.6-sol)
lists standard pricing of `$5.00 / 1M` input tokens, `$0.50 / 1M` cached input tokens,
and `$30.00 / 1M` output tokens, with structured outputs and the Responses API
supported. Check that page again immediately before the run; pricing and availability
are time-sensitive.

- Estimated operator time: 10–25 minutes for clean checkout, overlay warm-up, two
  upstream suites, and preflight; 1–10 minutes for the bounded paid run; 10–20 minutes
  for Render capture, hashing, review, and redaction.
- Planning estimate, not a cap: roughly 5k–30k input tokens and 1k–4k output tokens,
  about `$0.055–$0.27` at the cited rates. The prompt code caps diff text at 80,000
  characters and source at 40,000 characters, but character-to-token conversion is not
  exact and the application does not set a max-output-token value.
- Worst documented model-output capacity is much larger than the planning estimate.
  The dedicated `$5` project budget is the real guardrail. Record actual usage from
  `model-proof.json` and reconcile it with the OpenAI project dashboard; never claim an
  estimate as actual cost.

## Judge-facing narrative

> We pinned Cross-Examine and an unfamiliar public Python change to immutable Git
> objects. Before exposing an API key, we reproduced both revisions, passed the exact
> repository-test environment on each, and confirmed deterministic function behavior.
> One instrumented-but-unchanged Cross-Examine pipeline execution then made exactly one
> Responses HTTP attempt with SDK retries disabled. The observer retained only a hash
> of the Characterize input plus the requested/returned model, API request ID, separate
> response ID, status, and usage; it did not supply claims or influence verdict logic.
> GPT-5.6 Sol produced schema-constrained claims for `wcwidth.wcwidth:width`; Layer A and
> the upstream tests produced exact command/output evidence; pure aggregation produced
> the displayed verdict; SQLite and the Render API returned the same canonical report.
> We preserve the complete original workspace and hashes. The verdict is reported as
> obtained, including abstentions or refutations, and the run was never repeated to
> improve the story.

## Independent reviews and disagreements

- **Candidate-repository researcher:** ranked the ASCII fast path first, the center
  parity fix second, and `python-slugify` third. It favored the fast path's four-line
  preservation change over the center change's stronger visible demo.
- **Cross-Examine compatibility reviewer:** confirmed the `str -> int` Layer A fit,
  optional Layer B, 120-second command/600-second run budgets, automatic discovered
  tests, and failure-to-risk behavior. It warned that request metadata and ingest
  evidence are not persisted by the stock report.
- **Adversarial verifier:** required a clean public Cross-Examine pin, a one-request
  wrapper with retries disabled, full workspace preservation, external hashes, strict
  pre-request fallback, and a definition of reproducibility that does not promise
  identical model prose.
- **Final-choice/command challenger:** agreed the primary survives but disputed the
  initial “low setup” description. It found that `pytest-cov`, `pytest-codspeed`, and
  installed distribution metadata require the exact upstream test overlay; it also
  required an HTTP-level one-attempt guard, immediate journaling, distinct request and
  response IDs, DB/export equality, a no-model Render check, and PowerShell 7-specific
  handling. Those corrections are incorporated above.

The remaining disagreement is presentational, not operational: `wcwidth.center()` is
the clearest visible bug story, while the ASCII fast path is the safer single paid trial
for the missing real Characterize proof. This handoff chooses reliability and discloses
the tradeoff.

## Operator stop checklist

The human operator must check every box before calling the handoff complete:

- [ ] Disposable low-privilege environment contains no unrelated secrets or writable mounts.
- [ ] Cross-Examine SHA, target base/head, parent relation, clean trees, and exact diff are captured.
- [ ] Cross-Examine tests and both exact upstream test commands pass offline within limits.
- [ ] Base/head deterministic probes and the fully offline paid overlay pass.
- [ ] Exact observer source and SHA-256 are preserved outside the production checkout.
- [ ] Dedicated OpenAI project/key, current model visibility, current pricing, and a <= `$5` budget are human-confirmed.
- [ ] No transcript, tracing, OpenAI debug logging, proxy base URL, or secret-bearing environment contamination is present.
- [ ] Exactly one paid command is run; key is removed immediately; no retry or fallback follows an attempted Responses request.
- [ ] Model proof contains HTTP 200, one attempt, model IDs, distinct API request/response IDs, input/output usage, and input hash.
- [ ] At least one real model claim targets `wcwidth.wcwidth:width`; no synthetic stage failure exists.
- [ ] `system:head-tests` is `VERIFIED`; every decided finding preserves its exact command and captured output.
- [ ] SQLite, canonical report export, and Render API report agree exactly.
- [ ] Original workspace and artifacts are hashed before any redaction or publication.
- [ ] Redaction ledger and separate publishable hashes exist; local secret/path scan passes.
- [ ] Actual verdict, failures/abstentions, elapsed time, and dashboard-reconciled actual cost are reported without embellishment.

## Primary sources

- [Cross-Examine README at the pinned commit](https://github.com/stefbuilds/cross-examine/blob/f6524eac4270cf566d3acbf1f3a77ebb24ed904f/README.md)
- [Cross-Examine five-stage pipeline at the pinned commit](https://github.com/stefbuilds/cross-examine/blob/f6524eac4270cf566d3acbf1f3a77ebb24ed904f/src/cross_examine/pipeline.py)
- [Cross-Examine CLI at the pinned commit](https://github.com/stefbuilds/cross-examine/blob/f6524eac4270cf566d3acbf1f3a77ebb24ed904f/src/cross_examine/cli.py)
- [`wcwidth` primary immutable source](https://raw.githubusercontent.com/jquast/wcwidth/9c3356e30a0744919c80c0b69a88d4efa237c983/wcwidth/wcwidth.py), [test configuration](https://raw.githubusercontent.com/jquast/wcwidth/9c3356e30a0744919c80c0b69a88d4efa237c983/tox.ini), and [pinned test requirements](https://raw.githubusercontent.com/jquast/wcwidth/9c3356e30a0744919c80c0b69a88d4efa237c983/requirements-tests39.txt)
- [`python-slugify` fallback immutable source](https://raw.githubusercontent.com/un33k/python-slugify/1ef698fa7a265ec8971d0b641fb6e735dcd667dc/slugify/slugify.py) and [dependency declaration](https://raw.githubusercontent.com/un33k/python-slugify/1ef698fa7a265ec8971d0b641fb6e735dcd667dc/setup.py)
- [OpenAI GPT-5.6 Sol model/pricing page](https://developers.openai.com/api/docs/models/gpt-5.6-sol)
- [OpenAI model retrieval API](https://platform.openai.com/docs/api-reference/models/object?lang=curl)
- [OpenAI API data controls](https://platform.openai.com/docs/models/default-usage-policies-by-endpoint)
- [`uv sync` and locked-project behavior](https://docs.astral.sh/uv/concepts/projects/sync/)
- [`git rev-parse` object verification](https://git-scm.com/docs/git-rev-parse/2.45.0.html)
- [PowerShell `Tee-Object`](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.utility/tee-object?view=powershell-7.5)
- [Python virtual-environment non-portability](https://docs.python.org/3/library/venv.html)
