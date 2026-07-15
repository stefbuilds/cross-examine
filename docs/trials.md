# Unseen-repository compatibility trials

Run date: 2026-07-15 on Windows, Python 3.12.13. Repositories were selected for small, function-level Python changes and fast import/setup paths. Every repository was run with Layer A first; Layer B was added only after a renderable Layer-A report existed.

## Characterization limitation

`OPENAI_API_KEY` was absent, so `cross-examine run` correctly refused real-repository characterization rather than silently substituting a model. For these compatibility trials only, `scripts/run_trials.py` supplied one manually inspected, preserve-critical claim per diff. Each `proposed_check` is labeled `[characterization source: manual unseen-repository trial]`. Ingest, base capture, head replay, Layer B, aggregation, evidence, and corpus behavior are the real product pipeline.

Reproduction command:

```powershell
uv run --with text-unidecode python scripts/run_trials.py
```

This command uses network access and writes ignored artifacts to `.cross-examine/trials/`.

## Results

| Repository change | Refs | Setup | Layer A | Layer A + B | Result and limitation |
| --- | --- | ---: | --- | --- | --- |
| [python-slugify: reintroduce tox and tighten typing](https://github.com/un33k/python-slugify/commit/1ef698fa7a265ec8971d0b641fb6e735dcd667dc) | `45f9d33…` → `1ef698f…` | `text-unidecode`, 0.5s | 8.797s, **SAFE**, 33 verified, corpus 32 | 21.240s, **SAFE**, 34 verified, corpus +0 / 32 | The identical base/head repository tests passed as a separately grounded finding. The first pre-fix Layer-B run had abstained when Windows cp1252 could not emit generated U+0080; forcing UTF-8 child stdio made the same deterministic 60-example search verified. |
| [humanize: empty `natural_list`](https://github.com/python-humanize/humanize/commit/0a06a3d4a12113cd5f3d0df0cfbb3e27d92499eb) | `013969a…` → `0a06a3d…` | none | 3.345s, **RISKY**, 2 unverifiable | 3.774s, **RISKY**, 3 unverifiable | The source checkout imports build-generated `humanize._version`, and its tests require absent `freezegun`/localization dependencies. Probes and base/head tests surfaced exact import diagnostics; neither layer claimed safety. |
| [validators: reject mixed MAC separators](https://github.com/python-validators/validators/commit/402b3517eb09be188df13e5c57ea4d1400b7cc20) | `5440442…` → `402b351…` | none | 5.571s, **RISKY**, 2 unverifiable | 24.045s, **RISKY**, 3 unverifiable | Invalid values return a non-JSON `ValidationError`; the optional Ethereum test extra is also absent on both revisions. The probe reported `UnserializableResult`, and 17 pre-existing dependency-caused pytest failures were correctly classified as `UNVERIFIABLE`, not as a broken PR. |

## Demonstrated hardening

The trials exposed three defects in Cross-Examine itself. First, child Python inherited Windows cp1252 even though the parent decoded pipes as UTF-8; generated Unicode could fail before evidence was emitted. `PYTHONIOENCODING=utf-8` and `PYTHONUTF8=1` are now forced at the execution boundary. Second, a raw pytest `N failed` summary can be caused entirely by missing optional dependencies; tests now run on both revisions and only a passing-base regression can refute. Third, pytest's cache provider could hit a Windows rename denial in a detached worktree, so conservative commands disable that non-evidentiary cache. These behaviors have regression coverage.

The remaining two results are explicit v1 support boundaries, not hidden failures:

- repositories that require a build step to generate importable source need a future setup/install hook;
- return values must be JSON-compatible for stable cross-process comparison.

No multi-language support, package installer, object serializer, or broader sandbox was added during hardening.
