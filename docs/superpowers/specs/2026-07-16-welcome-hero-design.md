# Welcome hero design

> **Historical design record.** Written 2026-07-15/16 during the build. It describes intent at the time, not current behavior, and contains claims now superseded by the implementation. For current architecture see [docs/architecture.md](../../architecture.md). Retained for provenance.

## Goal

Replace the sidebar's evidence entry with a separate, full-viewport welcome page that sends users to the existing evidence dashboard.

## Structure

- `/welcome` renders outside `AppShell`, so it has no sidebar, overlay, or collapse mechanics.
- `/` remains the evidence dashboard and keeps its existing loader and AppShell integration unchanged.
- The sidebar removes the "Evidence catch" destination. Its remaining links, active states, semantic links, focus rings, and mobile `onSelect` auto-close behavior stay intact.

## Visual source and adaptation

- Use 21st.dev Pixel Perfect Hero (easemize, component 14681) as the welcome-page hero, preserving its canvas pixel motion, shimmer, CTA transition, responsiveness, and reduced-motion behavior.
- Use 21st.dev Neon Dither (moazamtrade, component 7245) behind the hero, preserving its shader, parallax, glow, grain, and transition behavior.
- Replace the dither source's orange/gold colors with Cross-Examine's purple token family only. It must not write to `document.documentElement` or own color-mode state; the existing profile theme control remains authoritative.
- Remove source demo logos and GitHub action. The primary CTA is a real semantic React Router link to `/`; no source component owns product routes.

## Content and accessibility

- Hero copy describes Cross-Examine's independent evidence workflow rather than placeholder design copy.
- The CTA has a visible keyboard focus ring and an accessible name.
- The canvas and dither layers are decorative and never block pointer or keyboard interaction.

## Verification

- Add visual/UI-focused tests proving `/welcome` has no primary navigation, its CTA links to `/`, and the sidebar no longer exposes "Evidence catch".
- Run `cd frontend && npm run build` and `cd frontend && npm run test`.
- Add provenance rows for both imported 21st sources and report preserved/adapted/changed behavior.
