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

## Task 4 — Distinguish import failure from target behavior

### SPEC

A hero-like target whose module import fails identically in base and head might be normalized as ordinary behavior, producing a `VERIFIED` finding and a fail-open verdict; if the probe protocol already treats import failure as infrastructure, the finding will instead be `UNVERIFIABLE` and the report `RISKY`.

### PROBE

A throwaway script materialized base and head `src/normalizer/core.py` files that both imported the absent `dependency_that_is_not_installed`, then ran the full `Pipeline` with a preserve-critical claim targeting `normalizer.core:normalize`.

Command:

```text
.venv/bin/python .task4_probe.py
```

Raw output:

```text
verdict=Verdict.RISKY
outcome=Outcome.UNVERIFIABLE
output:
{"cross_examine_probe": 1, "exception": {"message": "No module named 'dependency_that_is_not_installed'", "type": "ModuleNotFoundError"}, "ok": false, "probe_error": true, "value": null}
ModuleNotFoundError: No module named 'dependency_that_is_not_installed'

```

### VERDICT

The fail-open SPEC did not survive. The audit was wrong for import-time failures: `_resolve_target()` runs outside the target invocation `try` block, so an import failure reaches the outer protocol handler with `probe_error=true`; `parse_probe_output()` converts that to no envelope, and Layer A abstains.

The distinguishing rule is: an exception raised before a callable is successfully resolved is an infrastructure probe error, while an exception raised by invoking a successfully resolved callable is comparable target behavior.

### FIX

No production or test change was made. Changing exception normalization after this failed reproduction would broaden behavior without evidence. The existing `test_matching_target_exceptions_are_verified_behavior` already guards the genuine-domain-exception side of the rule. The throwaway probe script was removed after capture.

### VERIFY

Command:

```text
.venv/bin/pytest -q tests/integration/test_layer_a.py::test_matching_target_exceptions_are_verified_behavior
```

Raw output:

```text
.                                                                        [100%]
1 passed in 0.64s
```

Command:

```text
uv run pytest -q
```

Raw output:

```text
........................................................................ [ 68%]
.................................                                        [100%]
105 passed in 22.05s
```

## Task 7 — Establish one generated frontend bundle

### SPEC

The packaged FastAPI server and Vercel's normal SPA routes serve `src/cross_examine/static`, while `public/` is a separately exposed, stale bundle with no configured generator. A fresh frontend build should target only the packaged tree and produce hashes matching neither stale committed set.

### PROBE

Command:

```text
rg -n -C 2 'static_root|assets_root|app\.mount|index = static_root' src/cross_examine/api/app.py
```

Raw output:

```text
223-        )
224-
225:    static_root = Path(__file__).resolve().parents[1] / "static"
226:    assets_root = static_root / "assets"
227:    if assets_root.is_dir():
228:        app.mount("/assets", StaticFiles(directory=assets_root), name="frontend-assets")
229-
230-    @app.get("/{frontend_path:path}", include_in_schema=False)
--
234:        candidate = (static_root / frontend_path).resolve()
235:        if candidate.is_relative_to(static_root) and candidate.is_file():
236-            return FileResponse(candidate)
237:        index = static_root / "index.html"
```

`vercel.json` rewrites `/(.*)` to `/api/index.py`; that module inserts `ROOT / "src"` and calls the same `create_app(..., hosted_mode=True)`. Before rebuilding, the two HTML files referenced different assets:

```text
src/cross_examine/static/index.html:12:    <script type="module" crossorigin src="/assets/index-2uqqDukf.js"></script>
src/cross_examine/static/index.html:13:    <link rel="stylesheet" crossorigin href="/assets/index-HV6iRfAi.css">
public/index.html:12:    <script type="module" crossorigin src="/assets/index-1hHMzRj_.js"></script>
public/index.html:13:    <link rel="stylesheet" crossorigin href="/assets/index-BHf-u9Z0.css">
```

Both live aliases returned the packaged HTML for `/` with no redirect. Command pattern:

```text
curl -sS -L --max-time 20 -w '\nstatus=%{http_code} effective=%{url_effective} redirects=%{num_redirects} content_type=%{content_type}\n' <alias>/
```

Relevant raw output from each response:

```text
<script type="module" crossorigin src="/assets/index-2uqqDukf.js"></script>
<link rel="stylesheet" crossorigin href="/assets/index-HV6iRfAi.css">
status=200 effective=https://cross-examine-stefffs-projects.vercel.app/ redirects=0 content_type=text/html; charset=utf-8

<script type="module" crossorigin src="/assets/index-2uqqDukf.js"></script>
<link rel="stylesheet" crossorigin href="/assets/index-HV6iRfAi.css">
status=200 effective=https://cross-examine-six.vercel.app/ redirects=0 content_type=text/html; charset=utf-8
```

The obsolete public JS remained exposed at its exact static filename and matched the committed redundant asset byte-for-byte:

```text
$ curl -sS -L --max-time 20 https://cross-examine-six.vercel.app/assets/index-1hHMzRj_.js | shasum -a 256
7ac18395ef559067b4b9a2a05476699e8185fa3fd18c2b9b4156ffadea5d5624  -
$ git show HEAD:public/assets/index-1hHMzRj_.js | shasum -a 256
7ac18395ef559067b4b9a2a05476699e8185fa3fd18c2b9b4156ffadea5d5624  -
```

Command (Node 24.14.0 supplied by the workspace runtime):

```text
npm run build
```

Raw output:

```text

> frontend@0.0.0 build
> tsc -b && vite build

vite v8.1.4 building client environment for production...
transforming...✓ 2460 modules transformed.
rendering chunks...
computing gzip size...
../src/cross_examine/static/index.html                                                    0.58 kB │ gzip:   0.36 kB
../src/cross_examine/static/assets/space-grotesk-vietnamese-wght-normal-D0rl6rjA.woff2    6.71 kB
../src/cross_examine/static/assets/lexend-vietnamese-wght-normal-RvljkFvg.woff2          13.84 kB
../src/cross_examine/static/assets/space-grotesk-latin-ext-wght-normal-D9tNdqV9.woff2    18.94 kB
../src/cross_examine/static/assets/space-grotesk-latin-wght-normal-BhU9QXUp.woff2        22.28 kB
../src/cross_examine/static/assets/lexend-latin-ext-wght-normal-B6JQhE1e.woff2           34.47 kB
../src/cross_examine/static/assets/lexend-latin-wght-normal-ci0D1wrL.woff2               39.68 kB
../src/cross_examine/static/assets/index-BAAzL6GN.css                                    88.40 kB │ gzip:  15.19 kB
../src/cross_examine/static/assets/index-BVC1yLbJ.js                                    662.23 kB │ gzip: 209.88 kB

✓ built in 316ms
[plugin builtin:vite-reporter]
(!) Some chunks are larger than 500 kB after minification. Consider:
- Using dynamic import() to code-split the application
- Use build.rolldownOptions.output.codeSplitting to improve chunking: https://rolldown.rs/reference/OutputOptions.codeSplitting
- Adjust chunk size limit for this warning via build.chunkSizeWarningLimit.
```

### VERDICT

The SPEC survived. The fresh `BVC1yLbJ.js` / `BAAzL6GN.css` set matched neither committed pair. `frontend/vite.config.ts` has exactly one `outDir`, `src/cross_examine/static`; `public/` had not changed since its creation and was redundant for normal FastAPI/Vercel SPA routes.

### FIX

Applied option (a): removed the tracked `public/` bundle, ignored `public/`, documented `src/cross_examine/static` as the FastAPI/Vercel source of truth beside the Vite `outDir`, and committed the freshly generated canonical bundle. No second build-copy path or dependency was added.

### VERIFY

The post-fix build reproduced the same asset names:

```text
../src/cross_examine/static/assets/index-BAAzL6GN.css                                    88.40 kB │ gzip:  15.19 kB
../src/cross_examine/static/assets/index-BVC1yLbJ.js                                    662.23 kB │ gzip: 209.88 kB

✓ built in 322ms
```

The packaged server was started with `CROSS_EXAMINE_DEMO_CHARACTERIZER=fixture` at `http://127.0.0.1:8765`. Raw request log:

```text
127.0.0.1:51711 - "GET / HTTP/1.1" 200 OK
127.0.0.1:51711 - "GET /assets/index-BVC1yLbJ.js HTTP/1.1" 200 OK
127.0.0.1:51712 - "GET /assets/index-BAAzL6GN.css HTTP/1.1" 200 OK
127.0.0.1:51711 - "GET /api/fixtures/broken HTTP/1.1" 200 OK
127.0.0.1:51728 - "POST /api/hero-runs HTTP/1.1" 202 Accepted
127.0.0.1:51728 - "GET /api/runs/a5de22ba01c546a48beb0723bcf56b49 HTTP/1.1" 200 OK
127.0.0.1:51728 - "GET /api/runs/a5de22ba01c546a48beb0723bcf56b49/events HTTP/1.1" 200 OK
127.0.0.1:51739 - "GET /runs/a5de22ba01c546a48beb0723bcf56b49 HTTP/1.1" 200 OK
127.0.0.1:51740 - "GET /api/runs/a5de22ba01c546a48beb0723bcf56b49 HTTP/1.1" 200 OK
```

After clicking `Run offline hero demo`, the browser navigated to the run URL. Raw DOM snapshot excerpt after expanding the behavioral refutation:

```text
- heading "BROKEN" [level=1]
- region "Executed findings":
  - row "preserves empty-list normalization preservation behavioral_diff refuted 100%":
    - button "preserves empty-list normalization preservation" [expanded] [active]
  - row:
    - cell:
      - generic: Exact command
      - code: "'/Users/stefanospalivos/Documents/cross examine/.worktrees/consolidated-remediation/.venv/bin/python' -P -m cross_examine.cross_examine.probe_runner call normalizer.core:normalize '/Users/stefanospalivos/Documents/cross examine/.worktrees/consolidated-remediation/.cross-examine/runs/a5de22ba01c546a48beb0723bcf56b49/probe-state/requests/head/f01811fb36d2136aacb7.json'"
      - generic: Captured output
      - code: "BASE COMMAND ... BASE OUTPUT {\"cross_examine_probe\": 1, \"exception\": null, \"ok\": true, \"probe_error\": false, \"value\": []} HEAD OUTPUT {\"cross_examine_probe\": 1, \"exception\": null, \"ok\": true, \"probe_error\": false, \"value\": null}"
```

Reloading the exact `/runs/a5de22ba01c546a48beb0723bcf56b49` URL rendered `BROKEN` and the five persisted findings. Browser console errors were `[]`; the error-overlay check was `false`.

Command:

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
   Start at  17:39:19
   Duration  4.07s (transform 1.77s, setup 1.80s, import 5.90s, tests 3.66s, environment 13.27s)
```

Command:

```text
uv run pytest -q
```

Raw output:

```text
........................................................................ [ 68%]
.................................                                        [100%]
105 passed in 25.30s
```
