# Capability status

What Cross-Examine does today, and the tests behind each capability. The suite is 140
Python tests and 32 frontend tests, run on Windows, macOS, and Ubuntu via
`scripts/verify.sh` or `scripts/verify.ps1`.

## Status vocabulary

- `implemented` — works now, within the supported scope stated in its row.
- `future` — designed, not built.

## Capability matrix

| Capability | Current state | Implementation and test evidence | Supported scope |
| --- | --- | --- | --- |
| Five-stage pipeline | `implemented` | `src/cross_examine/pipeline.py`; `tests/e2e/test_layer_a_pipeline.py` | Ingest, Characterize, Cross-examine, Aggregate, and Render run end to end for Python repositories |
| Git revision ingest | `implemented` | `src/cross_examine/ingest/service.py`; `tests/integration/test_ingest.py` | Materializes base and head in detached worktrees |
| Python symbol discovery | `implemented` | `src/cross_examine/ingest/symbols.py`; `tests/unit/test_ingest_symbols.py` | Enumerates class, function, async, and nested definitions in changed files |
| Structured GPT-5.6 adapter | `implemented` | `src/cross_examine/characterize/service.py`; `src/cross_examine/characterize/models.py`; `tests/unit/test_characterize.py` | Schema-constrained Claims and optional ProbePlans; neither can carry an outcome or a verdict |
| Layer A base/head replay | `implemented` | `src/cross_examine/cross_examine/layer_a.py`; `tests/integration/test_layer_a.py` | Synchronous callables with JSON-compatible scalar and list inputs; anything else abstains |
| Layer B bounded search | `implemented` | `src/cross_examine/cross_examine/layer_b.py`; `tests/integration/test_layer_b.py` | Hypothesis generation and shrinking over eligible claims |
| Repository-test comparison | `implemented` | `src/cross_examine/pipeline.py`; `tests/e2e/test_layer_a_pipeline.py` | Runs one discovered pytest command against both revisions; only a passing-base regression refutes |
| Pure aggregate | `implemented` | `src/cross_examine/schema.py`; `tests/unit/test_schema.py` | Maps findings and critical claim IDs to `SAFE`, `RISKY`, or `BROKEN` with no I/O and no model input |
| EvidenceReceipt v1 | `implemented` | `src/cross_examine/schema.py`; `src/cross_examine/validation.py`; `tests/unit/test_validation.py` | Hashes canonical command and output and binds receipt text to rendered decided evidence |
| Trusted-host command executor | `implemented` | `src/cross_examine/execution.py`; `tests/unit/test_execution.py` | Allowlisted commands, bounded output, deadlines, and redaction, for trusted input |
| Behavioral corpus v1 | `implemented` | `src/cross_examine/corpus/repository.py`; `tests/integration/test_corpus.py` | Pins verified Layer-A fixtures and replays them by repository locator and symbol |
| Report persistence and codec | `implemented` | `src/cross_examine/persistence/runs.py`; `src/cross_examine/codec.py`; `tests/unit/test_codec.py`; `tests/integration/test_run_repository.py` | SQLite-backed runs and reports that survive restart |
| API and live progress | `implemented` | `src/cross_examine/api/app.py`; `tests/integration/test_api_jobs.py` | FastAPI service with SSE stage progress, single in-process worker, loopback use |
| Hosted fixture explorer | `implemented` | `api/index.py`; `tests/integration/test_api_fixture.py` | Serves a labeled checked-in evidence fixture; hosted repository execution is rejected by design |
| React evidence explorer | `implemented` | `frontend/src/`; `npx vitest run` | Report, receipts, run history, and corpus views |
| Wheel install and hero smoke | `implemented` | `tests/release/test_wheel_install.py`; `tests/release/test_local_product_run.py` | Builds a wheel, installs it, and runs the hero in an isolated offline workspace |
| Cross-platform verification | `implemented` | `scripts/verify.sh`; `scripts/verify.ps1`; `tests/unit/test_verification_entrypoints.py` | One command runs backend, frontend, build, and hero gates on POSIX and Windows |
| Hostile-code sandboxing | `future` | — | Needs disposable, network-restricted VMs; the current executor targets trusted input |
| Non-Python repositories | `future` | — | The probe protocol and symbol discovery are Python-specific |
| Intended-change oracle | `future` | `src/cross_examine/cross_examine/layer_a.py` | Represented intended-change claims deliberately abstain rather than guess |

## Supported scope

Python repositories on Python 3.12, across Windows, macOS, and Ubuntu.

`SAFE` means bounded, not proven: it reports that nothing was refuted among the checks
that actually ran, not that the pull request is correct. Layer B is a bounded search
rather than exhaustive proof. Cross-Examine executes the target repository's code, so
point it only at repositories you trust.
