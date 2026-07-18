# Cross-Examine product-flow audit

Date: 2026-07-18

Surface: hosted evidence explorer at `https://cross-examine-six.vercel.app`

User goal: understand a verdict, inspect the evidence behind it, and start a verification run.

## Overall verdict

The evidence story is unusually strong: verdicts are labeled, findings open into exact receipts, and the visual system feels deliberate. The main weakness is the transition from “see the proof” to “run a check.” Hosted users are led through a repository form that cannot execute repositories, while the useful offline demo action is secondary and far down the page. Desktop presentation also visibly clips oversized hero/form content in captured states, and several interaction semantics need accessibility verification.

## Steps

1. **Hosted fixture landing — Needs attention.** The BROKEN verdict and the product’s proof-first promise are immediately clear, but the oversized hero and body copy are clipped at the right edge in the accepted 1280 px capture.
2. **Empty runs state — Healthy.** The empty state explains what runs are for and offers one clear action. On the hosted surface, however, “Start local verification” implies an executable path that the next screen says is unavailable.
3. **New verification form — Needs work.** Labels, grouping, layer choice, and a live run summary are useful. The hosted limitation arrives only after repository fields, while the working offline-demo action sits near the end of a long form. The desktop capture also visibly clips the hero/form content.
4. **Completed hero result — Healthy.** Verdict, evidence source, revision range, corpus contribution, layer, outcome, and confidence are all visible without opening a finding.
5. **Expanded evidence receipt — Strong.** The exact command, captured output, reproducing input, expected value, and actual value are co-located. Long command/output lines are visually cut off without an obvious wrapping or horizontal-scroll cue, and the expandable row needs a clearer visual affordance.
6. **Expanded sidebar — Needs work.** Navigation groups and shortcuts are understandable, but the “How to use” area consumes substantial space and truncates card copy. Multiple controls share the accessible name “Dismiss,” which can be ambiguous to assistive-technology users.
7. **Mobile verification form — Needs attention.** The main content reflows into one readable column, but the unavailable hosted workflow produces a very long page before the useful action. The mobile DOM snapshot also exposed several navigation controls without accessible names; this requires screen-reader verification.

## Highest-impact changes

1. Make the hosted path explicit at entry: lead with **Run offline hero demo** and present local installation as the alternative; do not make users complete or scan an unusable repository form.
2. Reduce or constrain the oversized task-page hero and verify desktop clipping/reflow at common widths and 200% zoom.
3. Add a visible expand/collapse affordance to finding rows, distinguish repeated findings by layer or test input, and give long receipts wrapping or an obvious horizontal-scroll treatment.
4. Expose only one accessible Layer B control, give each onboarding dismissal a unique name, and restore explicit names for mobile navigation controls.
5. Move the primary action closer to the target fields and keep the run summary secondary or sticky so users do not traverse a long page to act.

## Confirmed strengths

- Verdicts do not rely on color alone; BROKEN, REFUTED, and VERIFIED are written out.
- The report uses semantic landmarks, regions, headings, and a real table in the captured DOM.
- Form inputs have programmatic names, and the expanded finding showed a visible focus outline.
- The receipt design strongly supports trust and auditability.

## Evidence limits

This was a screenshot-led audit of the hosted surface at 1280 px and 390 px, supplemented by current DOM snapshots and observed interactions. The local server stalled before becoming reachable, so local-only execution, progress, validation, and error recovery were not audited. No claim of WCAG compliance is made: color contrast, screen-reader output, full keyboard traversal, 200–400% zoom, reduced motion, browser text resizing, and touch-target measurements still need dedicated testing.
