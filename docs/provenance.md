# Interface provenance

Cross-Examine uses premade interface sources selected during the design stage. Product-specific changes are limited to content, routing, domain state, and accessibility fixes; the sourced visual grammar remains recognizable.

## 21st.dev sources

| Product surface | Source | How it entered the repository | Cross-Examine adaptation |
| --- | --- | --- | --- |
| Dashboard shell | [Dashboard Sidebar by arunjdass](https://21st.dev/@arunjdass/components/dashboard-sidebar) | Retrieved again through the authenticated 21st MCP component interface for this redesign. | The responsive shell, collapsible frame, compact navigation density, and semantic router links are retained; product navigation is New examination, Runs, Corpus, and About. |
| Cards | [Card by hero_ui](https://21st.dev/@hero_ui/components/heroui-card) | Retrieved through the authenticated 21st MCP component interface. | Compound card slots were retained; colors, shadows, and radii use Cross-Examine tokens. |
| Buttons | [Button by coss.com](https://21st.dev/@coss.com/components/coss-button) | Retrieved through the authenticated 21st MCP component interface. | Variant and size interfaces remain compatible with the product while using the rounded Hack the Law treatment. |
| Inputs and labels | [Input by originui](https://21st.dev/@originui/components/input) and [Label by originui](https://21st.dev/@originui/components/label) | Retrieved through the authenticated 21st MCP component interface. | Native validation and accessible label associations are preserved. |
| Switch | [Switch by jshguo](https://21st.dev/@jshguo/components/interfaces-switch) | Retrieved through the authenticated 21st MCP component interface. | Adapted from the standalone Radix package to the repository's existing `radix-ui` package. |
| Semantic tables | [Table by cnippet.dev](https://21st.dev/@cnippet.dev/components/cnippet-table) | Retrieved through the authenticated 21st MCP component interface. | The source semantic table primitives now render run history, corpus, and expandable findings. |
| Verdict status | 21st source `arihantcodes_1f7b8c4d/status-badge` | A public source snapshot is retained at `frontend/src/components/ui/status-badge-21st-source.tsx` with one unused React import removed for TypeScript 6. | `VerdictStatus.tsx` maps the source pill geometry, icon weight, and green/amber/red state colors to SAFE, RISKY, and BROKEN. |
| Live run progress | [Timeline by nyxbui](https://21st.dev/community/components/nyxbui/timeline/default) | The exact [public CDN source](https://cdn.21st.dev/user_nyxbui/timeline.tsx) is retained in `frontend/src/components/ui/timeline.tsx`; only formatting and a provenance comment changed. | The source's done/current/error/default states map directly to Ingest, Characterize, Capture, Layer A, Layer B, and Aggregate. No verdict state is shown while a run is incomplete. |
| Grounded evidence | [Code Block by ibelick](https://21st.dev/@ibelick/components/code-block) | Retrieved through the authenticated 21st MCP component interface. | The container and copy-header pattern are retained. Receipt content is rendered as exact, unmodified shell text without shipping unused syntax grammars. |
| Failure state | [Error Message by serafimcloud](https://21st.dev/@serafimcloud/components/error-message) | Retrieved through the authenticated 21st MCP component interface. | Adds `role="alert"` and project typography while preserving the compact error card. |

## Theme provenance

The palette and typography were sampled from the live [Hack the Law Cambridge](https://hackthelaw-cambridge.com/) site on 15 July 2026. Its published Elementor kit defines `#7F76CA` primary, `#D08CE8` secondary, `#AC82DB` accent, black headline ink, `#E9E8E6` light neutral, Space Grotesk headings, and Lexend body text. Cross-Examine maps those values into its semantic CSS tokens; verdict greens, ambers, and reds remain semantic evidence colors.

## Registry note

The redesign used the authenticated 21st MCP marketplace for search and code retrieval. Earlier shell, status, and timeline sources remain attributed to their original public 21st pages or CDN snapshots.

## Interface verification

The shared tokens cover light and dark color modes even though the Build Week shell intentionally launches in the system/default mode. Responsive behavior uses native horizontal table overflow, hides secondary columns at narrow widths, and preserves the sidebar collapse control. Frontend contract tests exercise submission, live no-verdict progress, report evidence expansion, and receipt fields; production compilation and browser verification cover the integrated route shell.

## License and attribution boundary

This file records source identity and material adaptations. Upstream package licenses in `frontend/node_modules` are not copied into the application bundle; distribution must retain any notices required by those packages.
