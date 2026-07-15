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

## Reduced-motion subscription follow-up

- Added a focused change-event test that opens both sourced layers in normal motion, dispatches a `(prefers-reduced-motion: reduce)` media-query change, and verifies the hero shimmer/CTA delay and dither color transition/parallax update without a route reload.
- Red evidence: the focused welcome test exited 1 because neither source subscribed to the media-query change; the hero kept its shimmer and Neon Dither kept its transition class.
- Green evidence: both sources now subscribe with `MediaQueryList.addEventListener("change", ...)` and unsubscribe on cleanup. PixelCanvas receives the updated state and cancels/restarts its source animation accordingly; dither removes its mouse handler and transition only while reduced motion is active. Neither component writes the document `dark` class.
- Final verification: focused welcome tests passed 3/3; full `npm run test` passed 11 files and 28 tests; `npm run build` passed with the standard >500 kB output warning.
- Sidebar audit: `sidebar-news.tsx` changes originated in `801d938` and require restoration to the pre-welcome baseline.

## Final scope and generated-output cleanup

- Initial cleanup was incomplete: it reverted only the bottom-alignment subset of `801d938`, leaving the `h-60` layout, sidebar-news test, and provenance sentence. The subsequent correction restores the exact pre-welcome baseline (`h-52`), deletes that test, and restores the prior provenance wording. The intended `SessionNavBar` removal of the evidence destination/article remains untouched.
- Full verification passed: `npm run test` reported 11 files and 28 tests passing; `npm run build` exited 0 with the standard >500 kB output warning.
- Rebuilt static output replaces the prior generated bundle. The generated shader template's trailing whitespace was removed safely from the fresh bundle; the post-commit `git diff --check f44d2e3..HEAD` check is recorded after committing the replacement.

## Exact sidebar baseline correction

- Restored the remaining original `801d938` delta exactly: `sidebar-news.tsx` now uses its pre-welcome `h-52` height, `sidebar-news.test.tsx` is deleted, and the Sidebar News provenance row is returned to its prior wording.
- This correction does not change welcome files, `SessionNavBar`, or the intended evidence/article removal.
- Final verification: `npm run test` exited 0 with 10 files and 27 tests passing; `npm run build` exited 0 with the standard >500 kB output warning. The rebuilt generated JavaScript had its shader-template trailing whitespace removed before staging; the requested base-range diff check is run after the correction commit.
