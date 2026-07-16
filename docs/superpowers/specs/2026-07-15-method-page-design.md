# How it works page design

> **Historical design record.** Written 2026-07-15/16 during the build. It describes intent at the time, not current behavior, and contains claims now superseded by the implementation. For current architecture see [docs/architecture.md](../../architecture.md). Retained for provenance.

## Purpose

Make Cross-Examine's trust boundary visible at `/about`: the model proposes
claims, deterministic execution produces findings, and pure code decides the
verdict. This page must source every product claim from `docs/architecture.md`.

## Scope

- Add `frontend/src/features/method/HowItWorksPage.tsx` and its tests.
- Preserve `/about`; replace its inline page only when the owner of `App.tsx`
  integrates the exported page component.
- Do not restyle other routes or change report behavior.

## Layout and content

The page uses a responsive pipeline with three consistently color-coded trust
zones, followed by a compact verdict-rules panel.

1. **Untrusted model proposal**: Ingest then Characterize, where GPT-5.6 Sol
   produces strict `Claim[]`. It states that the model cannot emit `Finding`,
   `Outcome`, or `Verdict`; malformed, duplicate, unknown-symbol, flooded, and
   verdict-injecting output is rejected.
2. **Grounded deterministic execution**: Layer A base capture/head replay,
   Layer B bounded Hypothesis plus shrinking, then discovered repository tests.
   This zone explains that evidence comes from actual base/head execution and
   that findings require the exact command and captured output. Missing critical
   execution resolves to `UNVERIFIABLE` and cannot produce a `SAFE` verdict.
3. **Pure judgment**: `aggregate()` turns findings into a verdict with no IO,
   model, or network access.

The verdict panel presents the actual aggregation behavior: a preserve-critical
refutation is `BROKEN`; another refutation or critical abstention is `RISKY`;
grounded passing evidence is `SAFE`. It calls out the V1 intended-change
boundary: without an executable oracle, a model-authored intended-change claim
remains critical `UNVERIFIABLE`; model prose is never an oracle.

## Components and dependencies

`HowItWorksPage` is a presentational React component. It has no API calls and
does not reimplement Python contract logic. Local data structures may describe
the fixed stage copy so repeated cards remain consistent. It uses the existing
Tailwind design tokens and Lucide icons already installed in the frontend.

## Accessibility and responsive behavior

Zones use text labels and icons in addition to color. The sequence is a
semantic ordered list or labelled sections, and the verdict rules remain
readable in a single column on small screens.

## Tests

Component tests verify the page shows all three trust zones, the model-output
restriction, the evidence requirement, each verdict outcome, and the V1
intended-change abstention. The routing owner can add a lightweight `/about`
route assertion when integrating the component.
