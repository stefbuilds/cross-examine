# Trials product surface design

> **Historical design record.** Written 2026-07-15/16 during the build. It describes intent at the time, not current behavior, and contains claims now superseded by the implementation. For current architecture see [docs/architecture.md](../../architecture.md). Retained for provenance.

## Goal

Make the real, documented public-repository compatibility trials visible as a first-class frontend destination without changing their verdicts, limits, or scope.

## Scope

- Add `frontend/src/features/trials/` with the trials fixture, page, and tests.
- Add a `/trials` application route and primary-navigation link.
- Render every row currently documented in `docs/trials.md`: python-slugify, humanize, validators, and packaging.
- Present the three Cross-Examine defects exposed by the trials.

The feature does not alter other feature directories, backend behavior, trial execution, or the source markdown table.

## Data

`trials.fixture.json` is checked in beside the feature. Its general row shape has repository metadata, commit references, setup cost, complete Layer A and Layer A+B result strings, a verdict, and an unmodified limitation note. A leading provenance comment in the importing TypeScript module identifies `docs/trials.md` as the source and gives the regeneration rule: parse all table rows from that document without editing values for presentation.

The fixture includes all four currently documented rows. It deliberately preserves the `RISKY` results for humanize and validators, and includes the later packaging `BROKEN` trial because it is a real documented source entry.

## Page

The page opens with an integrity-oriented explanation: the `RISKY` outcomes are evidence of correct abstention where missing optional dependencies prevented verification, not failed or omitted results. A responsive data table then compares repository, refs, setup, Layer A, Layer A+B, and the limitation note. Verdict badges distinguish result categories but do not alter their meaning.

A “What the trials taught us” section follows the table with the three documented self-caught defects:

1. Windows cp1252 child-process output could block Unicode evidence.
2. Missing optional dependencies could be mistaken for a failing PR.
3. Pytest cache writes could hit a Windows rename denial in detached worktrees.

The page uses a 21st.dev data-table composition adapted to the existing shadcn/Tailwind dashboard tokens and the existing sourced sidebar pattern.

## Tests and verification

Component tests use the real checked-in fixture and assert all repository rows, both `RISKY` limitation notes, the integrity framing, and the three lessons. Route tests assert `/trials` loads in the application shell and appears in primary navigation. The frontend test suite and production build provide the final verification.
