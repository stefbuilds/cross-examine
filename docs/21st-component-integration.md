# 21st.dev component integration

The supplied components are treated as visual source material rather than feature names. Their product placements preserve Cross-Examine's five stages and its deterministic verdict boundary.

| Supplied design | Product placement |
| --- | --- |
| Basic skeleton | Shared `Skeleton` primitive and report-shaped loading fallback. Shimmer is the global default. |
| Skeleton animation variants | Shimmer is used for page/report loading; pulse is reserved for the active search grid; static behavior is available for reduced motion. |
| Gradient shimmer configurator | Visual grammar for the repository-entry flow, active run message, and progress headline. Controls were translated into relevant run choices rather than exposed as demo settings. |
| Carousel dialog | Five-stage method explainer available from a live run. It is not onboarding. |
| Dot matrix loader | Compact activity signal in route fallback, run status, and submitting actions. |
| Progressive flux loader | Controlled by real backend run stages; it never predicts a verdict or advances from a timer. |
| Animated search skeleton | Shows the report's evidence search taking shape while cross-examination runs. Its inner bones use the shared radius and pulse vocabulary. |
| Command palette | Global navigation and quick-start actions through the sticky workspace toolbar and `Cmd/Ctrl+K`. |
| Breadcrumb | Route context in the workspace toolbar, including individual run IDs. |
| Theme selector | Persistent light, dark, and system choices on the Settings page and in the workspace footer. |
| Scrollable dialog | Accessible Radix dialog foundation for the method carousel and future dense evidence explanations. |

## Automatic skeleton capture

`boneyard-js` is integrated through the Vite plugin. The app shell gives each route family a stable capture name, so navigation loading can reuse bones extracted from the destination's real DOM. The final report is also wrapped with the named `verification-report` capture seam, and the in-progress page requests that same generated shape. The registry import is stable at `frontend/src/bones/registry.ts`; development capture updates it from the real pages at mobile, tablet, and desktop breakpoints.

If a generated registry is not yet available—for example, on the first local start—the same seam renders the hand-authored report skeleton fallback. This prevents an empty loading state while keeping Boneyard as the automatic source of layout truth after capture.

The skeleton theme is configured once in `frontend/src/main.tsx`: shimmer animation, theme-aware bone colors, 105-degree highlight angle, and viewport breakpoint selection for the app-shell layout.

## Grounding rules

- Progress percentage is a presentation mapping of persisted/SSE stages, not simulated work.
- The report replaces the loading state only when `run.report` exists.
- No SAFE, RISKY, or BROKEN label appears during loading.
- Verified and refuted findings continue to expose the exact command and captured output.
