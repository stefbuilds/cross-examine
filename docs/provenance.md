# Interface provenance

Cross-Examine uses premade interface sources selected during the design stage. Product-specific changes are limited to content, routing, domain state, and accessibility fixes; the sourced visual grammar remains recognizable.

## 21st.dev sources

| Product surface | Source | How it entered the repository | Cross-Examine adaptation |
| --- | --- | --- | --- |
| Hover-expand primary navigation | [Sidebar by andrewlu0](https://21st.dev/@andrewlu0/components/sidebar) | Pasted directly from the supplied 21st.dev component source. | Preserves the source's Framer Motion variants, hover-open width, stagger timing, and compact rail grammar. Demo organization/account/dropdowns and fake destinations were removed; real React Router links, active-route `aria-current`, keyboard focus rings, mobile auto-close callback, Cross-Examine fonts, and semantic colors were added. |
| Runs sidebar accordion | [Accordion by coss.com](https://21st.dev/@coss.com/components/coss-accordion) | Retrieved through the authenticated 21st MCP component interface; its Base UI primitives and panel-height transition were retained. | The source's accessible trigger, indicator, keyboard support, and height animation now disclose the real View runs (`/runs`) and Run locally (`/run`) links. Existing sidebar tokens and active-route semantics were applied; the removed About destination is not retained. |
| Profile settings theme control | [Dropdown Menu by originui](https://21st.dev/@originui/components/dropdown-menu) | Retrieved through the authenticated 21st MCP component interface. | Preserves the source dropdown's light/dark/system choices and data-state enter/exit motion. The trigger uses Cross-Examine tokens and is placed under the workspace profile; app startup defaults to light. |
| Sidebar product-use stack | [Sidebar News by Dub.co](https://21st.dev/@dubinc/components/sidebar-news) | Pasted from the user-supplied 21st.dev component source and cross-checked against the public source page. | Preserves the stacked card layout, hover reveal, swipe-to-dismiss interaction, and completed state. Dub changelog content, Next.js `Image`/`Link`, and external destinations were replaced with Cross-Examine internal product-use links, React Router navigation, theme-token panels, accessible link labels, and mobile auto-close callbacks. |
| Sidebar workspace profile | User-supplied 21st.dev `WithAvatar` context-menu source (public source URL not provided) | Pasted directly from the supplied source, with its context-menu primitive retained in `context-menu.tsx`. | Preserves the avatar trigger, compact menu scale, separators, icon rows, and context-menu interaction. Demo initials and profile-edit/bookmark/follower/settings/logout actions were replaced with real Cross-Examine routes only; a semantic button trigger, visible focus ring, accessible menu label, React Router links, and mobile auto-close callback were added. |
| New verification run form | [Checkout Form by Ruixen UI](https://21st.dev/community/components/ruixenui/checkout-form/default) | Pasted directly from the user-supplied 21st.dev component source and cross-checked against the public source page. | Preserves the centered summary card, icon-labeled sections, separators, compact summary grid, and footer action bar. Shipping/payment/discount/order content was replaced with repository target fields, hosted execution limitation, Layer B switch, live run summary, validation messages, and the existing Cross-Examine submit/hero-run behavior. |
| Run locally landing action | [Card by hero_ui](https://21st.dev/@hero_ui/components/heroui-card) | Pasted directly from the user-supplied Card source. | The source card's border, tokenized surface, rounded frame, and inset-shadow layers are applied to the existing semantic `/run` link; its wider frame distinguishes the primary local workflow. The source contains no motion, and only the required visible keyboard focus ring was added. |
| Cards | [Card by hero_ui](https://21st.dev/@hero_ui/components/heroui-card) | Retrieved through the authenticated 21st MCP component interface. | Compound card slots were retained; colors, shadows, and radii use Cross-Examine tokens. |
| Buttons | [Button by coss.com](https://21st.dev/@coss.com/components/coss-button) | Retrieved through the authenticated 21st MCP component interface. | Variant and size interfaces remain compatible with the product while using the rounded Hack the Law treatment. |
| Inputs and labels | [Input by originui](https://21st.dev/@originui/components/input) and [Label by originui](https://21st.dev/@originui/components/label) | Retrieved through the authenticated 21st MCP component interface. | Native validation and accessible label associations are preserved. |
| Switch | [Switch by jshguo](https://21st.dev/@jshguo/components/interfaces-switch) | Retrieved through the authenticated 21st MCP component interface. | Adapted from the standalone Radix package to the repository's existing `radix-ui` package. |
| Semantic tables | [Table by cnippet.dev](https://21st.dev/@cnippet.dev/components/cnippet-table) | Retrieved through the authenticated 21st MCP component interface. | The source semantic table primitives now render run history, corpus, and expandable findings. |
| Verdict status | 21st source `arihantcodes_1f7b8c4d/status-badge` | A public source snapshot is retained at `frontend/src/components/ui/status-badge-21st-source.tsx` with one unused React import removed for TypeScript 6. | `VerdictStatus.tsx` maps the source pill geometry, icon weight, and green/amber/red state colors to SAFE, RISKY, and BROKEN. |
| Live run progress | [Timeline by nyxbui](https://21st.dev/community/components/nyxbui/timeline/default) | The exact [public CDN source](https://cdn.21st.dev/user_nyxbui/timeline.tsx) is retained in `frontend/src/components/ui/timeline.tsx`; only formatting and a provenance comment changed. | The source's done/current/error/default states map directly to Ingest, Characterize, Capture, Layer A, Layer B, and Aggregate. No verdict state is shown while a run is incomplete. |
| Grounded evidence | [Code Block by ibelick](https://21st.dev/@ibelick/components/code-block) | Retrieved through the authenticated 21st MCP component interface. | The container and copy-header pattern are retained. Receipt content is rendered as exact, unmodified shell text without shipping unused syntax grammars. |
| Failure state | [Error Message by serafimcloud](https://21st.dev/@serafimcloud/components/error-message) | Retrieved through the authenticated 21st MCP component interface. | Adds `role="alert"` and project typography while preserving the compact error card. |
| Empty corpus | Empty by cnippet.dev (user-supplied source) | The supplied source is retained in `frontend/src/components/ui/cnippet-empty.tsx`; demo meeting text and placeholder buttons were omitted. | `CorpusPage` supplies the grounded pinned-checks copy and `RouteIcon`; the source's layered icon-card composition, semantic slots, and no-animation behavior are preserved without changing loaders, routes, or AppShell mechanics. |
| Empty run history | User-supplied 21st.dev `Empty State 04` source (public source URL not provided) | Pasted directly from the supplied component and its required empty-slot and marquee utilities. | Preserves the vertical marquee, masked run-row placeholders, centered hierarchy, and primary-action composition. Demo project copy and the nonexistent import action were replaced with verification-run wording and the real `/run` route; the action remains a semantic React Router link with the existing visible focus treatment. |
| Welcome hero | [Pixel Perfect Hero by easemize (component 14681)](https://21st.dev/r/easemize/pixel-perfect-hero) | Retrieved through the authenticated 21st MCP component interface. | Preserves the canvas pixel ripple, shimmer, staged CTA reveal, responsive hierarchy, and reduced-motion handling. Demo logos and GitHub action were removed; Cross-Examine copy and the semantic, focus-visible `/` dashboard link are supplied as the source CTA action. |
| Welcome dither background | [Neon Dither by moazamtrade (component 7245)](https://21st.dev/r/moazamtrade/neon-dither) | Retrieved through the authenticated 21st MCP component interface with `@paper-design/shaders-react`. | Preserves the Dithering shader, parallax, glow, grain, vignette, and color transition behavior. Warm source colors were adapted to `#7F76CA`, `#D08CE8`, and `#AC82DB`; it observes the existing document theme without writing the global `dark` class or owning color-mode state. |

## Theme provenance

The palette and typography were sampled from the live [Hack the Law Cambridge](https://hackthelaw-cambridge.com/) site on 15 July 2026. Its published Elementor kit defines `#7F76CA` primary, `#D08CE8` secondary, `#AC82DB` accent, black headline ink, `#E9E8E6` light neutral, Space Grotesk headings, and Lexend body text. Cross-Examine maps those values into its semantic CSS tokens; verdict greens, ambers, and reds remain semantic evidence colors.

## Registry note

The redesign used the authenticated 21st MCP marketplace for search and code retrieval. Earlier shell, status, and timeline sources remain attributed to their original public 21st pages or CDN snapshots.

## Interface verification

The shared tokens cover light and dark color modes even though the Build Week shell intentionally launches in the system/default mode. Responsive behavior uses native horizontal table overflow, hides secondary columns at narrow widths, and preserves the sidebar collapse control. Frontend contract tests exercise submission, live no-verdict progress, report evidence expansion, and receipt fields; production compilation and browser verification cover the integrated route shell.

## License and attribution boundary

This file records source identity and material adaptations. Upstream package licenses in `frontend/node_modules` are not copied into the application bundle; distribution must retain any notices required by those packages.
## Embedded assistant (2026-09-20)

The thinking and long-running-work loader is adapted from the exact React source
provided by the product owner on 2026-09-20. Its Drive, Dots, Orbit, and optional
Surfer patterns, elapsed timer, shimmer, fallback, and reduced-motion behavior are
preserved. Cross-Examine maps Dots to model reasoning and Drive to verification;
only the source's `ink` and overlay tokens were mapped to existing semantic tokens.

The user explicitly selected assistant-ui for this integration. Chat components
were installed from `https://r.assistant-ui.com/styles/radix-nova/thread.json` via
the shadcn registry: Thread, attachments/file/image support components, Markdown,
reasoning, tool groups/fallback, tooltip button, and their hooks and UI primitives.
The installed packages are pinned by `frontend/package-lock.json`.

Upstream layout, scrolling, composer, cancellation, Markdown/code copying, tool
disclosure, and responsive behavior are retained. Import paths were repaired for
this Vite project's aliases. Existing project Button and Avatar styling was
preserved; AvatarImage was added for source compatibility. The chat consumes the
existing font/color tokens and adds upstream tw-shimmer and collapse animations.
Copy and capabilities are adapted to append-only verification conversations:
editing/regeneration are removed, unsupported attachments are hidden, tool groups
start expanded, and the welcome content describes Cross-Examine.

Investigation results reuse existing 21st-derived Card, coss Accordion,
VerdictStatus, ErrorMessage, and FindingEvidence components. Navigation reuses the
existing 21st-derived SessionNavBar. Conversation controls use the existing Button
and a labeled native select. Their data comes from the custom Python runtime.

Verification includes production build, frontend tests, and a packaged browser
flow through real hero execution, expanded receipts, follow-up, reload, and a
390px viewport. Provider token streaming/tool calling is tested with a controlled
provider; a live provider test requires an operator-supplied OPENAI_API_KEY.

## Bottom command dock (2026-09-22)

The primary navigation uses UImaxxing's `command-dock` registry component from
`https://uimaxx.ing/r/command-dock.json`. The canonical source is retained
unchanged at `frontend/src/components/uimaxxing/command-dock.tsx`; it preserves
the source search field, pill action, active indicator, gradients, spacing, and
icon treatment.

Cross-Examine routing lives separately in
`frontend/src/features/navigation/CrossExamineCommandDock.tsx`. That adapter
maps the dock grammar to Evidence, Assistant, Verify, Runs, Trials, and Corpus,
adds semantic React Router links and active-route state, and uses the existing
application color and font tokens. Only the small `stroke-lit` and `interactive`
utilities required by this component were transferred, preventing the registry's
full global theme sheet from recoloring unrelated evidence surfaces.

## Assistant UImaxxing composition (2026-09-22)

The assistant uses the UImaxxing registry sources `neon-prompt-bar`,
`ai-chat-thread`, `code-diff-card`, and `issue-activity-card` from
`https://uimaxx.ing/r/*.json`. Their canonical TSX sources are retained unchanged
under `frontend/src/components/uimaxxing/`; the registry CSS is retained at
`frontend/src/app/uimaxxing.css`.

Product wiring is isolated in `frontend/src/features/assistant/`. The adapters
preserve the sources' structure, motion, glow, disclosure, and activity-card
grammar while replacing demo data with assistant-ui streaming, run progress,
saved-report links, and exact evidence receipts. A scoped `.uimax-assistant`
token map selects Cross-Examine's white theme without recoloring other routes.
The shared Avatar primitive only adds the `seed` and `size` compatibility props
required by the untouched activity-card source.

## Persistent assistant island (2026-09-22)

At the user's request, the UImaxxing command-dock adapter now expands into one
pair of joined pills containing the existing assistant composition. The original
registry components remain the visual source for the dock, icons, chat, and
composer. The expansion itself is a Cross-Examine interaction: coordinated
width/height easing, delayed content reveal, a 540px-wide compact assistant
capsule connected by a central neck to a 520px navbar. The user's supplied
Dynamic Island reference grounds the pure-black fill and capsule silhouette;
fine inset highlights and layered contact/ambient shadows provide edge depth.
The compact assistant is 72px tall and contains only the ask bar and small
expand/close controls. Its bar comes from the explicitly requested
`https://uimaxx.ing/r/compact-ask-bar.json`, adapted in `CompactAssistantBar.tsx`
with the source geometry, sheen, shadows, plus icon, and gradient waveform
button. The controls connect to the existing assistant runtime rather than
the registry demo: Enter or the waveform sends a draft and expands the thread;
the plus opens the full assistant. No voice capability is implied or added.
No new dependency was added.

The assistant stays mounted across navigation and closure, preserving the
current draft and runtime. The open state persists for the browser tab until
closed. The close control and Escape return focus to Assistant; hidden content
is inert. Reduced-motion preferences disable the expansion transitions.
The expand control navigates to `/assistant`; minimize returns to the previous
page. A shared named view transition animates between the capsule and full-page
surface. Both presentations keep the same runtime mounted, preserving drafts
and conversation state without duplicate assistant instances.

At the user's request, the wide single-silhouette experiments were reverted
to the original separate capsules. The connector was subsequently widened
10% from 120px to 132px. To eliminate residual seams, the expanded pills and
bridge now share one SVG perimeter and shadow in `JoinedPillSurface.tsx`;
individual capsule borders, bridge overlays, and inset shadows are suppressed
in that state. The narrow-connector silhouette is retained.
The compact capsule is 540px wide and the navbar is 520px wide.
Navbar icon paths were
provided by the user; the terminal motion is adapted from AnimateIcons by
Avijit Dey (@avijit07x), MIT, using the already-installed Framer Motion runtime.
Trials and Corpus now share one Trials dock entry and a local section switcher.
The user-supplied animated Pleroma mark is used for Evidence; the previous
Evidence logs icon is used for Runs. The pasted SVG nesting was repaired and
reduced motion renders the completed Pleroma mark without animation.

Assistant motion uses a fixed-size silhouette with an interruptible 640ms path
morph for opening/closing, rather than stretching a fading SVG through layout
height changes. The navbar stays anchored. Full-page expansion/minimization
shares the assistant surface's bounds through the View Transitions API, with
coordinated corner interpolation and a delayed content reveal. Reduced motion
skips the morph and shortens the page transition; the runtime remains mounted.
