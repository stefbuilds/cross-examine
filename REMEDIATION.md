# Consolidated remediation evidence log

Branch: `fix/consolidated-remediation`

This log follows the required `SPEC → PROBE → VERDICT → FIX → VERIFY → LOG` loop. Command output is reproduced verbatim.

## Task 0 — Consolidate approved remediation work

### SPEC

The five commits on `docs/coherence` and the uncommitted hosted-fixture grounding changes from `fix/fixture-grounding` can be consolidated without regression; afterward the backend suite will report 102 passed, Ruff will pass, and the frontend suite will report 27 passed.

### PROBE

Command:

```text
uv run pytest -q
```

Raw output:

```text
Using CPython 3.12.13
Creating virtual environment at: .venv
   Building cross-examine @ file:///Users/stefanospalivos/Documents/cross%20examine/.worktrees/consolidated-remediation
      Built cross-examine @ file:///Users/stefanospalivos/Documents/cross%20examine/.worktrees/consolidated-remediation
Installed 35 packages in 76ms
........................................................................ [ 70%]
..............................                                           [100%]
=============================== warnings summary ===============================
.venv/lib/python3.12/site-packages/fastapi/testclient.py:1
  /Users/stefanospalivos/Documents/cross examine/.worktrees/consolidated-remediation/.venv/lib/python3.12/site-packages/fastapi/testclient.py:1: StarletteDeprecationWarning: Using `httpx` with `starlette.testclient` is deprecated; install `httpx2` instead.
    from starlette.testclient import TestClient as TestClient  # noqa

-- Docs: https://docs.pytest.org/en/stable/how-to/capture-warnings.html
102 passed, 1 warning in 24.96s
```

Command:

```text
uv run ruff check .
```

Raw output:

```text
All checks passed!
```

Command (run with the Codex workspace Node 24.14.0 runtime because the host shell's Node 18 cannot start the locked Vite/Vitest toolchain):

```text
npm test -- --run
```

Raw output:

```text

> frontend@0.0.0 test
> vitest --run


 RUN  v4.1.10 /Users/stefanospalivos/Documents/cross examine/.worktrees/consolidated-remediation/frontend


 Test Files  10 passed (10)
      Tests  27 passed (27)
   Start at  17:18:39
   Duration  3.41s (transform 1.72s, setup 1.39s, import 6.27s, tests 2.86s, environment 9.04s)
```

### VERDICT

The consolidation claim survived. The fixture regression tests are present because the suite reports 102 passed rather than the 100-test clean-main baseline.

### FIX

Merged `docs/coherence` into the target branch and transplanted the exact six-file worktree state from `fix/fixture-grounding`. No conflict resolution changed either source. Installed only the already-locked development/runtime dependencies needed to execute the gates; no dependency manifests changed.

### VERIFY

The three probe outputs above are the post-consolidation verification evidence. All required Task 0 gates passed.

## Task 1 — Resolve the `aggregate()` fail-open contradiction

### SPEC

`aggregate([], {"critical-claim"})` returns `Verdict.RISKY`, because a non-empty critical-claim set with no covering findings is uncovered and must resolve toward risk. If it returned `Verdict.SAFE`, the function would fail open.

### PROBE

Command:

```text
.venv/bin/python -c 'from cross_examine.schema import aggregate; print(aggregate([], {"critical-claim"}))'
```

Raw output:

```text
Verdict.RISKY
```

The exact settling branch in `src/cross_examine/schema.py` is:

```python
covered_claim_ids = {finding.claim_id for finding in findings}
if critical_claim_ids - covered_claim_ids:
    return Verdict.RISKY
```

### VERDICT

The SPEC survived. Agent 1 was correct about uncovered critical claims resolving to `RISKY`; Agent 2's `SAFE` conclusion was wrong. The first two requested cases—empty findings with a critical ID, and non-matching findings with a critical ID—already existed in the decision table. The mixed case with one covered and one uncovered critical ID did not.

### FIX

No production fix was made because the alleged fail-open could not be reproduced. Added only the missing decision-table row: a verified `c1` finding with critical IDs `{c1, c2}` must remain `RISKY` because `c2` is uncovered.

### VERIFY

Command:

```text
.venv/bin/pytest -q tests/unit/test_schema.py
```

Raw output:

```text
..........                                                               [100%]
10 passed in 0.11s
```

Command:

```text
uv run pytest -q
```

Raw output:

```text
........................................................................ [ 69%]
...............................                                          [100%]
103 passed in 25.07s
```

## Task 2 — Refuse credit without an established repository-test baseline

### SPEC

A repository test that fails on base and passes on head currently produces `VERIFIED`; because base never established a passing baseline, the finding must instead be `UNVERIFIABLE`.

### PROBE

A real pytest command was run against two temporary revision directories: base contained `assert False`, while head contained `assert True`.

Command:

```text
.venv/bin/pytest -q tests/e2e/test_layer_a_pipeline.py::test_failing_base_test_that_passes_on_head_is_unverifiable
```

Raw pre-fix output:

```text
F                                                                        [100%]
=================================== FAILURES ===================================
__________ test_failing_base_test_that_passes_on_head_is_unverifiable __________

tmp_path = PosixPath('/private/var/folders/ff/4k4q6dpx6537djl1x0_4561r0000gn/T/pytest-of-stefanospalivos/pytest-18/test_failing_base_test_that_pa0')

    def test_failing_base_test_that_passes_on_head_is_unverifiable(tmp_path: Path) -> None:
        base = tmp_path / "base"
        head = tmp_path / "head"
        base.mkdir()
        head.mkdir()
        (base / "test_recovery.py").write_text(
            "def test_behavior() -> None:\n    assert False\n",
            encoding="utf-8",
        )
        (head / "test_recovery.py").write_text(
            "def test_behavior() -> None:\n    assert True\n",
            encoding="utf-8",
        )

        _claim, findings = _run_discovered_tests(
            [["python", "-m", "pytest", "-q"]],
            base,
            head,
            timeout=10,
        )

>       assert findings[0].outcome is Outcome.UNVERIFIABLE
E       assert <Outcome.VERIFIED: 'verified'> is <Outcome.UNVERIFIABLE: 'unverifiable'>
E        +  where <Outcome.VERIFIED: 'verified'> = Finding(claim_id='system:head-tests', layer=<Layer.BEHAVIORAL_DIFF: 'behavioral_diff'>, outcome=<Outcome.VERIFIED: 've...           [100%]\n1 passed in 0.05s\n", repro_input=None, expected=None, actual=None, confidence=1.0, provenance=None).outcome
E        +  and   <Outcome.UNVERIFIABLE: 'unverifiable'> = Outcome.UNVERIFIABLE

tests/e2e/test_layer_a_pipeline.py:313: AssertionError
=========================== short test summary info ============================
FAILED tests/e2e/test_layer_a_pipeline.py::test_failing_base_test_that_passes_on_head_is_unverifiable
1 failed in 1.12s
```

### VERDICT

The SPEC survived. `_run_discovered_tests()` checked `head_passed` first, so a passing head bypassed the fact that `base_passed` was false. This contradicted the documented rule that pre-existing failures are `UNVERIFIABLE`.

### FIX

In `src/cross_examine/pipeline.py`, check `not base_passed` first and assign `Outcome.UNVERIFIABLE`; only an established passing base can reach the head-success `VERIFIED` branch or the grounded head-regression `REFUTED` branch. Added the real base-fails/head-passes regression test in `tests/e2e/test_layer_a_pipeline.py`.

### VERIFY

Command:

```text
.venv/bin/pytest -q tests/e2e/test_layer_a_pipeline.py::test_failing_base_test_that_passes_on_head_is_unverifiable
```

Raw output:

```text
.                                                                        [100%]
1 passed in 1.66s
```

Command:

```text
uv run pytest -q
```

Raw output:

```text
........................................................................ [ 69%]
................................                                         [100%]
104 passed in 25.68s
```

## Task 3 — Prefer `src` over repository root in probe imports

### SPEC

`_prepare_import_path()` inserts `src` and then the repository root at index zero, leaving the root first. If the same module exists in both locations, the probe imports the root copy instead of the conventional `src`-layout copy.

### PROBE

The probe created `collision_probe.py` in both a temporary repository root (`VALUE = 1`) and its `src` directory (`VALUE = 2`), called `_prepare_import_path()`, then printed path indexes and the imported module origin.

Command:

```text
.venv/bin/python -c 'from pathlib import Path; import importlib, os, sys, tempfile; from cross_examine.cross_examine.probe_runner import _prepare_import_path; td = tempfile.TemporaryDirectory(); root = Path(td.name).resolve(); source = root / "src"; source.mkdir(); (root / "collision_probe.py").write_text("VALUE = 1\n", encoding="utf-8"); (source / "collision_probe.py").write_text("VALUE = 2\n", encoding="utf-8"); os.environ["CROSS_EXAMINE_WORKTREE"] = str(root); _prepare_import_path(); print(f"root_index={sys.path.index(str(root))}"); print(f"src_index={sys.path.index(str(source))}"); module = importlib.import_module("collision_probe"); print(f"value={module.VALUE}"); print(f"origin={module.__file__}")'
```

Raw pre-fix output:

```text
root_index=0
src_index=1
value=1
origin=/private/var/folders/ff/4k4q6dpx6537djl1x0_4561r0000gn/T/tmp_2bmu_rw/collision_probe.py
```

### VERDICT

The SPEC survived. The wrong ordering caused an actual import collision: the repository-root module loaded instead of the `src` module.

### FIX

Reverse the two candidates passed through `sys.path.insert(0, ...)`: insert the root first and `src` second, so the final path order prefers `src`. Added `tests/unit/test_probe_runner.py` to assert both the ordering and the resolved module file/value.

### VERIFY

The original probe was rerun unchanged.

Raw output:

```text
root_index=1
src_index=0
value=2
origin=/private/var/folders/ff/4k4q6dpx6537djl1x0_4561r0000gn/T/tmp2z1n28lj/src/collision_probe.py
```

Command:

```text
.venv/bin/pytest -q tests/unit/test_probe_runner.py
```

Raw output:

```text
.                                                                        [100%]
1 passed in 0.09s
```

Command:

```text
.venv/bin/ruff check src/cross_examine/cross_examine/probe_runner.py tests/unit/test_probe_runner.py
```

Raw output:

```text
All checks passed!
```

Command:

```text
uv run pytest -q
```

Raw output:

```text
........................................................................ [ 68%]
.................................                                        [100%]
105 passed in 26.48s
```
