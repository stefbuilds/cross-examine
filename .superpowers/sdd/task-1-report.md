# Task 1 — Welcome hero report

## Scope completed

- Added the standalone `/welcome` route before the `AppShell` route, so it renders without the dashboard sidebar, overlay, collapse control, or dashboard loader.
- Preserved the existing `/` dashboard route, `loadBrokenFixture` loader, API/data wiring, and `AppShell` implementation.
- Removed only the sidebar `Evidence catch` navigation item and its related `Start with the catch` demo article. Remaining routes, active-state behavior, semantic React Router links, focus rings, hover-collapse mechanics, and `onSelect` mobile callback are unchanged.

## Sourced implementation

- `frontend/src/components/ui/pixel-perfect-hero.tsx` was retrieved from 21st.dev Pixel Perfect Hero (easemize, component 14681). Its canvas ripple, shimmer, staged CTA reveal, responsive layout, and reduced-motion handling remain. Demo brand marquees and the GitHub CTA were removed; `primaryAction` now accepts the product-owned semantic React Router action.
- `frontend/src/components/ui/neon-dither.tsx` was retrieved from 21st.dev Neon Dither (moazamtrade, component 7245). Its Dithering shader, parallax, glow, grain, vignette, and transitions remain. It uses only `#7F76CA`, `#D08CE8`, and `#AC82DB` for the adapted dither family. It observes the existing document `dark` class with a `MutationObserver`; it contains no `classList.toggle`, writes no global theme state, and does not own color-mode state.
- Added `@paper-design/shaders-react` as the source shader dependency.
- `WelcomePage` supplies a focus-visible `<Link to="/">Enter dashboard</Link>` inside the sourced CTA frame.

## Test-first evidence

1. Added assertions that `/welcome` renders the `Evidence, examined.` hero, does not render the Primary navigation, and exposes an `/` dashboard link; changed sidebar expectations to require the removed evidence item to be absent.
2. Focused run before implementation: `npm run test -- src/app/App.test.tsx src/components/ui/session-nav-bar.test.tsx` exited 1. The expected causes were no `/welcome` route and the still-present `Evidence catch` link.
3. Focused run after implementation: the same command exited 0 with 2 files and 14 tests passing.

## Final verification

- `cd frontend && npm run build` exited 0. Vite emitted the standard warning that the generated JavaScript bundle is larger than 500 kB after minification.
- `cd frontend && npm run test` exited 0: 10 test files and 25 tests passed.
- `git diff --check` exited 0.

## Provenance

`docs/provenance.md` now records both 21st component IDs, the preserved source behavior, the removed demo content, the purple adaptation, and the dither's non-owning theme behavior.

## Generated output

The requested frontend build refreshed the tracked FastAPI/Vercel deployment bundle under `src/cross_examine/static/`. The refreshed bundle is included with this visual feature commit.

## Reduced-motion follow-up

- Added `frontend/src/features/welcome/WelcomePage.test.tsx` to exercise the supplied sources under `prefers-reduced-motion: reduce`.
- Red evidence: `npm run test -- src/features/welcome/WelcomePage.test.tsx` exited 1 with two expected failures: the hero stylesheet still contained its infinite shimmer and Neon Dither still registered its `mousemove` parallax listener.
- Green evidence: the same focused command exited 0 with 2 tests passing after source-faithful guards disabled the pixel-canvas animation, heading shimmer, CTA delay/transition, dither parallax, and dither color transition only for reduced-motion users. Normal-motion source behavior remains conditional and unchanged.
- Final follow-up verification: `npm run test` exited 0 with 11 test files and 27 tests passing; `npm run build` exited 0. The build retains the standard >500 kB output warning.
