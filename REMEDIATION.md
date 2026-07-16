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

## Task 6 — Remove dead Finder-copy artifacts

### SPEC

Only tracked numbered Finder-copy artifacts with no live references should be removed. A
typo-looking filename must stay when its name records an intentional source and it remains
imported. The retired dashboard sidebar must not be revived by renaming a stray copy.

### PROBE

Command:

```text
git ls-files | grep -E ' [0-9]\.'
```

Raw output:

```text
frontend/src/components/ui/dashboard-sidebar 2.tsx
frontend/src/components/ui/label 2.tsx
frontend/src/components/ui/switch 2.tsx
src/cross_examine/static/assets/index-D4zFGBUc 2.css
src/cross_examine/static/assets/lexend-latin-ext-wght-normal-B6JQhE1e 2.woff2
src/cross_examine/static/assets/lexend-latin-wght-normal-ci0D1wrL 2.woff2
src/cross_examine/static/assets/lexend-vietnamese-wght-normal-RvljkFvg 2.woff2
src/cross_examine/static/assets/space-grotesk-latin-ext-wght-normal-D9tNdqV9 2.woff2
src/cross_examine/static/assets/space-grotesk-latin-wght-normal-BhU9QXUp 2.woff2
src/cross_examine/static/assets/space-grotesk-vietnamese-wght-normal-D0rl6rjA 2.woff2
src/cross_examine/static/favicon 2.svg
src/cross_examine/static/favicon 3.svg
src/cross_examine/static/index 2.html
src/cross_examine/static/index 3.html
```

Each exact self-excluding reference search for those 14 names returned empty stdout and exit
code 1. The dashboard copy also had no surviving consumer:

```text
$ git grep -n -F -- 'SidebarNav' HEAD -- . ':(exclude)frontend/src/components/ui/dashboard-sidebar 2.tsx'
exit_code=1
```

Its history showed that it was introduced alone as a stray artifact after the real component
had already been replaced:

```text
$ git log --follow --format=oneline --name-status -- 'frontend/src/components/ui/dashboard-sidebar 2.tsx'
e459fb552927aa404b8d2ddfc71654ac192c902d chore: include remaining integration assets
A	frontend/src/components/ui/dashboard-sidebar 2.tsx
```

The earlier replacement in `c7e5751` was:

```text
-import { SidebarNav } from "@/components/ui/dashboard-sidebar";
+import { SessionNavBar } from "@/components/ui/session-nav-bar";
```

The typo-looking names were not dead. Exact references returned:

```text
frontend/src/components/ui/session-nav-bar.tsx:12:import { Accordion, AccordionItem, AccordionPanel, AccordionTrigger } from "@/components/ui/coss-accordion";
docs/provenance.md:10:| Runs sidebar accordion | [Accordion by coss.com](https://21st.dev/@coss.com/components/coss-accordion) |
frontend/src/features/corpus/CorpusPage.tsx:11:} from "@/components/ui/cnippet-empty";
docs/provenance.md:25:| Empty corpus | Empty by cnippet.dev (user-supplied source) |
```

### VERDICT

The SPEC survived. All 14 numbered paths were unreferenced copies. `coss-accordion.tsx` and
`cnippet-empty.tsx` are live, provenance-backed source-brand names. Renaming the dashboard
copy would resurrect deliberately retired code.

### FIX

Deleted exactly the 14 numbered tracked artifacts and added `* [0-9].*` plus `.DS_Store` to
`.gitignore`. Kept the two intentional provenance filenames unchanged. Because deleting the
unused TSX files changed Tailwind's source scan, regenerated the one canonical packaged bundle.

### VERIFY

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
   Duration  11.18s
```

Command:

```text
npm run build
```

Raw output (asset summary):

```text
../src/cross_examine/static/assets/index-gZ2lRzhV.css     74.85 kB │ gzip:  13.80 kB
../src/cross_examine/static/assets/index-ChboQhj8.js     662.23 kB │ gzip: 209.88 kB
✓ built in 388ms
```

Command:

```text
uv run pytest -q
```

Raw output:

```text
........................................................................ [ 68%]
.................................                                        [100%]
105 passed in 22.20s
```

## Task 8 — Make local and CI verification equivalent

### SPEC

macOS/Linux and Windows need documented, repository-owned verification entry points. Each must
run locked dependency sync, Ruff, backend tests, frontend tests and lint, the production build,
packaged Playwright tests, and the credential-free fixture demo. CI must invoke those same entry
points on Ubuntu, macOS, and Windows.

### PROBE

Command and result before the fix:

```text
$ test ! -e scripts/verify.sh
exit_code=0
```

The PowerShell entry point used `uv sync --extra dev`, did not run `npm run lint`, and removed no
inherited model credential. The workflow ran the full frontend gate only in a separate Ubuntu
job, while README documented only PowerShell.

### VERDICT

The SPEC did not survive. There was no POSIX entry point, the two existing verification paths
diverged, and macOS/Windows CI did not exercise the frontend or packaged browser flow.

### FIX

Added executable `scripts/verify.sh`; made both scripts remove `OPENAI_API_KEY`, force the
deterministic fixture, use `uv sync --locked`, and include frontend lint. Replaced the split CI
jobs with one three-OS matrix that invokes the repository scripts. Documented both commands in
the existing README Tests section.

The first local run used the application-bundled Node 24 and exposed a host signing mismatch,
not a repository defect:

```text
Error: Cannot find native binding.
cause: Error: dlopen(.../rolldown-binding.darwin-arm64.node, 0x0001):
code signature ... not valid for use in process: mapping process and mapped file
(non-platform) have different Team IDs
code: 'ERR_DLOPEN_FAILED'
```

Exact diagnosis:

```text
$ codesign -dv --verbose=4 /Applications/ChatGPT.app/Contents/Resources/cua_node/bin/node
flags=0x10000(runtime)
TeamIdentifier=2DC432GLL2
$ codesign -dv --verbose=4 frontend/node_modules/@rolldown/binding-darwin-arm64/rolldown-binding.darwin-arm64.node
flags=0x20002(adhoc,linker-signed)
TeamIdentifier=not set
$ /opt/homebrew/opt/node@20/bin/node --version
v20.19.6
```

Running unchanged under the normal Node 20 runtime matching CI then exposed a genuine stale e2e
locator after Task 0's pipeline-generated fixture replacement:

```text
Error: locator.click: Error: strict mode violation:
getByRole('button', { name: /preserves empty-list normalization/i }) resolved to 4 elements
  1 failed
  1 passed (5.2s)
```

The fixture contains behavioral refuted, behavioral verified, and adversarial rows for the same
claim. Narrowed the test to the behavioral-refuted row and asserted the current captured
`probe_runner` command plus its `[]` and `null` outputs instead of stale hand-authored pytest
text. No production behavior changed.

Focused regression command:

```text
npm run test:e2e -- --grep 'opens every grounded receipt'
```

Raw output:

```text
> frontend@0.0.0 test:e2e
> playwright test --grep opens every grounded receipt

Running 1 test using 1 worker

[1/1] e2e/broken-verdict.spec.ts:3:1 › opens every grounded receipt from a packaged direct route
  1 passed (2.3s)
```

### VERIFY

Command (with Homebrew Node 20 first on `PATH`, matching CI's Node 20):

```text
bash scripts/verify.sh
```

Raw output:

```text
Resolved 43 packages in 23ms
Checked 42 packages in 8ms
All checks passed!
........................................................................ [ 68%]
.................................                                        [100%]
105 passed in 20.86s

added 525 packages, and audited 526 packages in 3s

139 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities

> frontend@0.0.0 test
> vitest --run

 RUN  v4.1.10 /Users/stefanospalivos/Documents/cross examine/.worktrees/consolidated-remediation/frontend

 Test Files  10 passed (10)
      Tests  27 passed (27)
   Duration  2.93s (transform 955ms, setup 941ms, import 4.07s, tests 3.01s, environment 8.59s)

> frontend@0.0.0 lint
> oxlint

> frontend@0.0.0 build
> tsc -b && vite build

vite v8.1.4 building client environment for production...
transforming...✓ 2460 modules transformed.
rendering chunks...
computing gzip size...
../src/cross_examine/static/index.html                                                    0.58 kB │ gzip:   0.35 kB
../src/cross_examine/static/assets/space-grotesk-vietnamese-wght-normal-D0rl6rjA.woff2    6.71 kB
../src/cross_examine/static/assets/lexend-vietnamese-wght-normal-RvljkFvg.woff2          13.84 kB
../src/cross_examine/static/assets/space-grotesk-latin-ext-wght-normal-D9tNdqV9.woff2    18.94 kB
../src/cross_examine/static/assets/space-grotesk-latin-wght-normal-BhU9QXUp.woff2        22.28 kB
../src/cross_examine/static/assets/lexend-latin-ext-wght-normal-B6JQhE1e.woff2           34.47 kB
../src/cross_examine/static/assets/lexend-latin-wght-normal-ci0D1wrL.woff2               39.68 kB
../src/cross_examine/static/assets/index-gZ2lRzhV.css                                    74.85 kB │ gzip:  13.80 kB
../src/cross_examine/static/assets/index-ChboQhj8.js                                    662.23 kB │ gzip: 209.88 kB
✓ built in 261ms

> frontend@0.0.0 test:e2e
> playwright test

Running 2 tests using 1 worker

[1/2] e2e/broken-verdict.spec.ts:3:1 › opens every grounded receipt from a packaged direct route
[2/2] e2e/broken-verdict.spec.ts:26:1 › runs the offline hero from the browser without model credentials
  2 passed (4.6s)
   Building cross-examine @ file:///Users/stefanospalivos/Documents/cross%20examine/.worktrees/consolidated-remediation
      Built cross-examine @ file:///Users/stefanospalivos/Documents/cross%20examine/.worktrees/consolidated-remediation
Installed 35 packages in 39ms
Run: http://127.0.0.1:8765/runs/c3ec76b5be144a69aa6ec63751183cc8
Characterization: deterministic hero fixture
Verdict: BROKEN
Corpus: +0 this run · 2 total
Refuted claim: preserve-empty
Exact command: /Users/stefanospalivos/.cache/uv/builds-v0/.tmpuIeumr/bin/python -P -m cross_examine.cross_examine.probe_runner call normalizer.core:normalize '/Users/stefanospalivos/Documents/cross examine/.worktrees/consolidated-remediation/.cross-examine/runs/c3ec76b5be144a69aa6ec63751183cc8/probe-state/requests/head/f01811fb36d2136aacb7.json'
Reproducing input: []
```

Static entry-point checks:

```text
bash_syntax_exit=0
workflow_yaml_exit=0
verify_sh_executable_exit=0
pwsh_available_exit=1
```

PowerShell was not present on this macOS host, so the Windows entry point was not executed
locally; the workflow retains Windows and invokes that file directly.

## Task 9 — Resolve the canonical hosted URL

### SPEC

Every judge-facing repository reference should use one verified public URL. A live alias alone
does not make it canonical; repository metadata must identify the intended homepage.

### PROBE

Command:

```text
curl -sS --max-time 20 https://api.github.com/repos/stefbuilds/cross-examine | jq '{html_url, homepage, default_branch, archived}'
```

Raw output:

```text
{
  "html_url": "https://github.com/stefbuilds/cross-examine",
  "homepage": "https://cross-examine-six.vercel.app",
  "default_branch": "main",
  "archived": false
}
```

Both documented candidates were live:

```text
host=cross-examine-stefffs-projects.vercel.app root_status=200 root_effective=https://cross-examine-stefffs-projects.vercel.app/ root_redirects=0
host=cross-examine-stefffs-projects.vercel.app health={"status":"ok"} status=200
host=cross-examine-six.vercel.app root_status=200 root_effective=https://cross-examine-six.vercel.app/ root_redirects=0
host=cross-examine-six.vercel.app health={"status":"ok"} status=200
```

Before the fix, README and `docs/submission.md` contained four references to the longer
`stefffs-projects` alias.

### VERDICT

The repository's public GitHub metadata makes `https://cross-examine-six.vercel.app` canonical.
The other hostname remains a working deployment alias, but using it in judge-facing text caused
avoidable identity drift.

### FIX

Replaced all four judge-facing references with the canonical GitHub homepage. No deployment,
redirect, application code, or hosted state was changed.

### VERIFY

Command:

```text
rg -n 'cross-examine-(stefffs-projects|six)\.vercel\.app' . --glob '!frontend/node_modules/**' --glob '!src/cross_examine/static/assets/**' --glob '!REMEDIATION.md'
```

Raw output:

```text
./README.md:10:[![Live evidence explorer](https://img.shields.io/badge/Live-evidence%20explorer-000000)](https://cross-examine-six.vercel.app)
./README.md:53:**Zero-install option:** the [live evidence explorer](https://cross-examine-six.vercel.app) serves an explicitly labeled, checked-in evidence fixture.
./docs/submission.md:67:- Public evidence explorer: `https://cross-examine-six.vercel.app`
./docs/submission.md:77:- [x] Add the deployed judge-demo URL: `https://cross-examine-six.vercel.app`.
stale_url_matches=0
```

## Task 10 — Reserve the demo GIF slot safely

### SPEC

README should reserve the requested `docs/assets/demo.gif` location immediately below the pitch,
without adding a heading or rendering a broken image before the recording exists. The expected
asset directory should be trackable now.

### PROBE

Commands and raw results before the fix:

```text
$ rg -n -F 'docs/assets/demo.gif' README.md docs
exit_code=1
$ test -d docs/assets
exit_code=1
$ git ls-files --stage -- docs/assets
exit_code=0
stdout=(empty)
```

### VERDICT

The SPEC did not survive: neither the placeholder nor the asset directory existed.

### FIX

Inserted a non-rendering HTML comment between the two-line pitch blockquote and the badges, and
created `docs/assets/.gitkeep`. No image element or README heading was added.

### VERIFY

Raw output:

```text
     3  > **Codex writes the code. Cross-Examine puts it on the stand.**
     4  >
     5  > Git worktrees → GPT-5.6 Sol claims → trusted-input base/head execution → pure `aggregate()` → FastAPI/React report.
     6
     7  <!-- Demo GIF slot: docs/assets/demo.gif -->
     8
     9  [![Python >=3.12](https://img.shields.io/badge/Python-%3E%3D3.12-3776AB?logo=python&logoColor=white)](pyproject.toml)
gitkeep_exists_exit=0
headings_before=15 headings_after=15
7:<!-- Demo GIF slot: docs/assets/demo.gif -->
```

## Task 11 — Explain why schema-constrained claims matter

### SPEC

The existing “Why this is not a Codex skill” section should explain, in two or three concrete
sentences, why a schema-constrained claim can be refuted while prose cannot. It must connect the
hero's `preserve-empty` / `[]` receipt to the existing intended-change abstention rule.

### PROBE

Before the fix, the section contained only the separation-of-duties paragraph. The implementation
already enforced the missing rationale:

```text
src/cross_examine/cross_examine/layer_a.py:178:            if claim.kind is ClaimKind.INTENDED_CHANGE:
src/cross_examine/cross_examine/layer_a.py:195:                        if claim.kind is ClaimKind.INTENDED_CHANGE
README.md:126:V1 deliberately abstains on intended-change correctness unless the contract has an independent executable oracle. Since model prose is never an oracle, any intended-change claim without one keeps the report at least `RISKY`;
src/cross_examine/characterize/models.py:9:    model_config = ConfigDict(extra="forbid")
src/cross_examine/characterize/service.py:42:            text_format=CharacterizationPayload,
```

### VERDICT

The SPEC did not survive. Code and the later abstention paragraph expressed the boundary, but the
named README section did not explain the contract-to-refutation link.

### FIX

Added exactly three sentences to the existing section. They identify `Claim` as a contract,
ground the distinction in `preserve-empty` and `[]`, state that prose has no failing clause or
oracle authority, and point forward to the existing abstention rule. Added no heading.

### VERIFY

Raw output:

```text
A schema-constrained `Claim` is a contract, not a description. When the head fails, the report names the exact clause—`preserve-empty`—and the input that broke it—`[]`; prose has no clause to fail and cannot serve as an oracle. The intended-change abstention rule below follows from that same boundary.

claim_contract_mentions=1
preserve_empty_mentions_in_section=1
headings_before=15 headings_after=15
```
