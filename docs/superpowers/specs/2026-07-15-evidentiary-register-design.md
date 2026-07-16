# Evidentiary register design

## Scope

Refresh the visual system used by `frontend/src/index.css` and the shared UI
primitives. Do not change feature/page APIs or `dashboard-sidebar.tsx`.

## Visual thesis

Cross-Examine should read as an evidentiary register: restrained paper-and-ink
surfaces, compact editorial hierarchy, and mechanical mono treatment for exact
captured material. Verdict red, amber, and green remain the only saturated
colors and communicate verdict state only.

## Token system

Light and dark modes use complete semantic token sets for backgrounds,
foregrounds, borders, inputs, focus rings, sidebar compatibility, and the
existing destructive state. Neutral tokens establish hierarchy with contrast
instead of decorative color. Rounded, heavy-shadow styling is replaced by
deliberately modest corners, fine rules, and quiet elevation.

## Shared primitives

Buttons, inputs, labels, switches, tables, cards, and error messages share
the register's compact spacing, ink-like borders, durable focus rings, and
neutral interaction states. Their props, variants, data attributes, semantic
elements, and accessibility behavior remain unchanged.

## Evidence receipts

The existing AI Elements code block becomes the receipt surface: a labelled
header, hairline frame, code-only monospace content, and visibly separated
captured payload. Command, base output, head output, and reproducing input all
inherit this treatment without altering the report's data flow.

## Verification

Add focused styling contract coverage only where needed, then run the frontend
test suite, lint, and production build. Confirm responsive semantic tables,
focus indicators, and existing evidence actions remain intact.
