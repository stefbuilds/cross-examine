# Approved 21st.dev components

This registry records every user-approved 21st.dev component in Cross-Examine, its
verified origin, and its approved purpose. Only components listed here (or exact
21st.dev source supplied by the user during the current task) may be used for visible
UI. Origins below were verified against the interface-provenance record preserved in
repository history (commit `0b193e9`, `docs/provenance.md` and
`docs/21st-component-integration.md`).

Approval date for all entries: 2026-07-19 (user-supplied during the component
integration session), unless noted.

## Verified public-source components

| Component | 21st.dev source | Approved purpose | Repository path |
| --- | --- | --- | --- |
| Sidebar (hover-expand) | https://21st.dev/@andrewlu0/components/sidebar | Primary workspace navigation shell | `frontend/src/components/ui/session-nav-bar.tsx` |
| Accordion | https://21st.dev/@coss.com/components/coss-accordion | Disclosure primitive (previously Runs submenu) | `frontend/src/components/ui/coss-accordion.tsx` |
| Dropdown Menu | https://21st.dev/@originui/components/dropdown-menu | Theme (appearance) selector | `frontend/src/components/ui/theme-dropdown.tsx` |
| Button | https://21st.dev/@coss.com/components/coss-button | All buttons | `frontend/src/components/ui/button.tsx` |
| Card | https://21st.dev/@hero_ui/components/heroui-card | Cards, including run-locally landing action | `frontend/src/components/ui/card.tsx` |
| Input | https://21st.dev/@originui/components/input | Form inputs | `frontend/src/components/ui/input.tsx` |
| Label | https://21st.dev/@originui/components/label | Form labels | `frontend/src/components/ui/label.tsx` |
| Switch | https://21st.dev/@jshguo/components/interfaces-switch | Boolean form controls (Layer B toggle) | `frontend/src/components/ui/switch.tsx` |
| Table | https://21st.dev/@cnippet.dev/components/cnippet-table | Run history, corpus, findings tables | `frontend/src/components/ui/table.tsx` |
| Checkout Form | https://21st.dev/community/components/ruixenui/checkout-form/default | New verification run form | `frontend/src/components/ui/checkout-form.tsx` |
| Status Badge | 21st source `arihantcodes_1f7b8c4d/status-badge` (snapshot retained) | SAFE / RISKY / BROKEN verdict pill | `frontend/src/features/report/VerdictStatus.tsx` |
| Timeline | https://21st.dev/community/components/nyxbui/timeline/default (CDN snapshot `https://cdn.21st.dev/user_nyxbui/timeline.tsx`) | Live run stage progress | `frontend/src/components/ui/timeline.tsx` |
| Code Block | https://21st.dev/@ibelick/components/code-block | Exact command / captured output receipts | `frontend/src/components/ui/code-block.tsx` |
| Error Message | https://21st.dev/@serafimcloud/components/error-message | Failure states | `frontend/src/components/ui/error-message.tsx` |
| Empty (cnippet) | Empty by cnippet.dev (user-supplied exact source) | Empty corpus state | `frontend/src/components/ui/cnippet-empty.tsx` |
| Pixel Perfect Hero | https://21st.dev/r/easemize/pixel-perfect-hero (component 14681) | Welcome hero | `frontend/src/components/ui/pixel-perfect-hero.tsx` |
| Neon Dither | https://21st.dev/r/moazamtrade/neon-dither (component 7245) | Welcome background | `frontend/src/components/ui/neon-dither.tsx` |

## Verified user-supplied 21st.dev sources (no public URL recorded)

| Component | Origin record | Approved purpose | Repository path |
| --- | --- | --- | --- |
| Empty State 04 | User-supplied 21st.dev `Empty State 04` source, pasted with its empty-slot and marquee utilities | Empty run history | `frontend/src/components/ui/empty-state-04.tsx`, `empty-state-04-utils/` |
| WithAvatar context menu | User-supplied 21st.dev `WithAvatar` context-menu source | Workspace profile area; context-menu primitive | `frontend/src/components/ui/context-menu.tsx`, `avatar.tsx` |
| Basic skeleton + variants | User-supplied 21st.dev skeleton batch (2026-07-19 brief) | Shared skeleton vocabulary (shimmer/pulse) | `frontend/src/components/ui/skeleton.tsx`, `report-loading-skeleton.tsx` |
| Gradient shimmer configurator | User-supplied 21st.dev source (same batch) | Run-entry flow, active-run message, progress headline | `frontend/src/components/ui/gradient-shimmer.tsx` |
| Carousel dialog | User-supplied 21st.dev source (same batch) | Five-stage method explainer dialog | `frontend/src/components/ui/verification-method-dialog.tsx` |
| Dot matrix loader | User-supplied 21st.dev source (same batch) | Compact activity signal | `frontend/src/components/ui/loader-dot-matrix.tsx` |
| Progressive flux loader | User-supplied 21st.dev source (same batch) | Stage-driven run progress bar | `frontend/src/components/ui/progressive-flux-loader.tsx` |
| Animated search skeleton | User-supplied 21st.dev source (same batch) | Evidence-search loading grid | `frontend/src/components/ui/animated-loading-skeleton.tsx` |
| Command palette | User-supplied 21st.dev source (same batch) | Global ⌘K navigation and quick actions | `frontend/src/components/ui/command-palette.tsx`, `command.tsx` |
| Breadcrumb | User-supplied 21st.dev source (same batch) | Route context in workspace toolbar | `frontend/src/components/ui/breadcrumb.tsx` |
| Scrollable dialog | User-supplied 21st.dev source (same batch) | Accessible dialog foundation | `frontend/src/components/ui/dialog.tsx` |
| Note (Geist-style) | User-supplied 21st.dev source (2026-07-22) | Failed-run alert with title + message | `frontend/src/components/ui/note.tsx` |
| Entropy (order/chaos field) | User-supplied 21st.dev source (2026-07-22) | Corpus empty-state illustration | `frontend/src/components/ui/entropy.tsx` |
| Flickering grid | User-supplied 21st.dev source (2026-07-22) | Decorative backdrop behind the live run-progress header | `frontend/src/components/ui/flickering-grid.tsx` |
| Cards stack (CardSticky / ContainerScroll) | User-supplied 21st.dev source (2026-07-22) | Sticky New Run summary panel (sticky mechanic) | `frontend/src/components/ui/cards-stack.tsx` |

Approved adaptations for the 2026-07-22 batch (the owner granted explicit
permission to edit these components as needed to preserve core functionality):

- **Note** — color classes mapped to Cross-Examine theme tokens (destructive /
  primary / accent / amber) so it is theme-aware in light and dark; structure,
  icons, sizing, and layout are unchanged.
- **Entropy** — the hardcoded black background and white particle color were
  parameterized to the primary theme color and a transparent surface; a
  reduced-motion static frame replaces the animation loop; size made responsive.
  2026-07-21 (owner-authorized): particle velocity/return-to-order constants
  slowed roughly 2x and dot size increased (2px → 3px) so the corpus
  empty-state animation reads as calmer; the Corpus page instance size
  increased 200 → 280 to match. Simulation logic and connective-line
  structure are unchanged.
- **Gradient shimmer configurator** — 2026-07-21 (owner-authorized): default
  `duration` (1.45s → 3.2s) and `pauseBetween` (700ms → 900ms) slowed so the
  rainbow sweep reads as calmer everywhere it's used (New Run hero,
  in-progress run heading, checkout-form summary label). Gradient presets,
  markup, and the animation mechanism are unchanged.
- **Flickering grid** — used only as a `pointer-events-none`, masked, low-opacity
  decorative layer; a reduced-motion static frame added; theme color applied.
- **Cards stack** — `motion/react` import changed to the project's `framer-motion`;
  `CardSticky` used for a single sticky summary (desktop-only via `max-md:!static`,
  `layout` disabled to avoid animating summary text updates).

## Components with non-21st.dev or mixed origin (flagged)

| Component | Status | Notes |
| --- | --- | --- |
| Sidebar help banner | User-specified custom (2026-07-21) | `frontend/src/components/ui/sidebar-help-banner.tsx` was built to the user's explicit written design instructions (single card, strong primary action, quiet dismiss). It is not a 21st.dev component. Flagged for a component decision if strict 21st-only compliance is required. |
| Workspace profile rows | Derived (2026-07-21) | `frontend/src/components/ui/workspace-profile.tsx` retains the approved Avatar primitive but its row layout was restructured to the user's explicit sidebar-redesign instructions. |
| Removed: Sidebar News | Removed 2026-07-21 | The Dub.co stacked-card component (`sidebar-news.tsx`) was deleted at the user's direction and replaced by the help banner above. |
| Workspace toolbar | Neutral wrapper (2026-07-21) | `frontend/src/components/ui/workspace-toolbar.tsx` is not itself a 21st component; it is a neutral layout wrapper that composes the approved Breadcrumb and Command palette. Breadcrumb segments were wired to React Router links (permitted data/routing change). |
| Table presentation edit | Owner-authorized edit (2026-07-22) | `frontend/src/components/ui/table.tsx` (cnippet-table) header divider was firmed and a left-accent hover cue was added to body rows only, to deliver a data-grid feel while keeping semantic HTML, real links, badges, and keyboard access. |
| Skeleton restyle | Owner-authorized edit (2026-07-22) | `frontend/src/components/ui/skeleton.tsx` box radius changed to `rounded-lg` to match the supplied HeroUI skeleton aesthetic. `@heroui/react` was intentionally **not** added as a dependency — pulling an entire component library for one skeleton primitive was not warranted, so the look was matched on the existing primitive (which already shimmers). |

## Supplied but not integrated (2026-07-22)

| Component | Reason |
| --- | --- |
| CSV Viewer (`@glideapps/glide-data-grid`) | Proposed for the run history / dashboard / corpus tables. It renders cells to a **canvas**, so it cannot host the real anchor links, the `VerdictStatus` badges, the click-a-row-to-open-the-report navigation, or the responsive column hiding those screens depend on — and it is a virtualized grid built for very large datasets, whereas these lists hold a handful of rows. Adopting it would remove the two most important behaviors of those screens and reduce keyboard/screen-reader access. The data-grid *aesthetic* was delivered on the real accessible table instead (see Table presentation edit). It would also add three heavy dependencies plus a vendored primitives subtree for data that is not CSV. |

## Change rules

See `.claude/skills/using-21st-components/SKILL.md` (workspace) for the binding
policy: data wiring, content, dimensions, token mapping, neutral wrappers, and
accessibility fixes are permitted; internal structure, spacing, typography, icons,
decoration, animation, and interaction patterns must not be altered.
