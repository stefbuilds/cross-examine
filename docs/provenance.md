# Interface provenance

Cross-Examine uses premade interface sources selected during the design stage. Product-specific changes are limited to content, routing, domain state, and accessibility fixes; the sourced visual grammar remains recognizable.

## 21st.dev sources

| Product surface | Source | How it entered the repository | Cross-Examine adaptation |
| --- | --- | --- | --- |
| Dashboard shell | [Dashboard Sidebar by arunjdass](https://21st.dev/community/components/arunjdass/dashboard-sidebar/default) | Public component source transferred to `frontend/src/components/ui/dashboard-sidebar.tsx` after the 21st registry endpoint required `API_KEY_21ST`. | Navigation content is Runs, Corpus, and About. The 260px frame, collapse motion, workspace identity treatment, neutral light/dark palette, density, and responsive overflow behavior are preserved. The source's single-option workspace dropdown became a static identity row so it does not advertise a dead interaction; leaf rows became semantic router links. |
| Verdict status | 21st source `arihantcodes_1f7b8c4d/status-badge` | A public source snapshot is retained at `frontend/src/components/ui/status-badge-21st-source.tsx` with one unused React import removed for TypeScript 6. | `VerdictStatus.tsx` maps the source pill geometry, icon weight, and green/amber/red state colors to SAFE, RISKY, and BROKEN. |
| Live run progress | [Timeline by nyxbui](https://21st.dev/community/components/nyxbui/timeline/default) | The exact [public CDN source](https://cdn.21st.dev/user_nyxbui/timeline.tsx) is retained in `frontend/src/components/ui/timeline.tsx`; only formatting and a provenance comment changed. | The source's done/current/error/default states map directly to Ingest, Characterize, Capture, Layer A, Layer B, and Aggregate. No verdict state is shown while a run is incomplete. |
| Findings and corpus tables | [Project Data Table by ravikatiyar162](https://21st.dev/community/components/ravikatiyar162/project-data-table/default) | The registry-gated core could not be retrieved without `API_KEY_21ST`; its [public demo source](https://cdn.21st.dev/ravikatiyar162/project-data-table/default/code.demo.1759681409078.tsx) supplied the compact header, row-density, border, hover, and horizontal-overflow grammar. | Product rows are native semantic tables so claim expansion, keyboard focus, evidence receipts, and responsive column hiding remain accessible without importing the demo's project-specific state machinery. |
| Grounded evidence | [Code Block by Vercel / AI Elements](https://elements.ai-sdk.dev/components/code-block) | Installed from the exact upstream with `npx ai-elements@latest add code-block`, which created the AI Elements and shadcn dependencies. | Used without structural redesign for exact commands, captured stdout/stderr, reproducing inputs, expected values, and actual values. Its Shiki loader is narrowed to the only exercised language (`bash`) and the same GitHub light/dark themes so the packaged wheel ships seven frontend assets instead of the entire grammar catalog. |

## Registry note

The planned commands for `arunjdass/dashboard-sidebar`, `nyxbui/timeline`, `ravikatiyar162/project-data-table`, and the original status-badge slug reached 21st.dev's authenticated registry but the environment has no `API_KEY_21ST`. The dashboard, status, and timeline sources were therefore obtained from their public 21st component pages or CDN. The project table's core remains token-gated, so only its public demo's visual grammar was adapted; that boundary is explicit above rather than presenting a reconstruction as exact source.

## Interface verification

The shared tokens cover light and dark color modes even though the Build Week shell intentionally launches in the system/default mode. Responsive behavior uses native horizontal table overflow, hides secondary columns at narrow widths, and preserves the sidebar collapse control. Frontend contract tests exercise submission, live no-verdict progress, report evidence expansion, and receipt fields; production compilation and browser verification cover the integrated route shell.

## License and attribution boundary

This file records source identity and material adaptations. Upstream package licenses in `frontend/node_modules` are not copied into the application bundle; distribution must retain any notices required by those packages.
