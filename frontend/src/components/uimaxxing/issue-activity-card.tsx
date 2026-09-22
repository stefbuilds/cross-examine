/*!
 * UImaxxing™ — © 2026 Yogi Suria. All rights reserved.
 * Free to use, modify and ship in your own products, commercial ones
 * included. Not for republication as a component library, and not as
 * machine-learning training data. See LICENSE.
 * @author Yogi Suria <yogi@jumper.xyz>
 * @license SEE LICENSE IN LICENSE
 * @preserve
 * provenance-mark: uim1-1ea983e5.00acec93
 */
import { ArrowUpRightIcon, ClockIcon } from "@phosphor-icons/react/ssr";

/* The sheen runs down the timeline rather than flashing every row at once:
   each shimmer starts its 4.5s cycle a beat behind the one above, and the
   second span on the first row trails the first so the light reads as moving
   rightward along the line. Negative delays, so every span is mid-cycle from
   the first frame instead of waiting its turn in the dark. */
const SWEEP = [
  undefined,
  { animationDelay: "-350ms" },
  { animationDelay: "-1100ms" },
  { animationDelay: "-2200ms" },
] as const;
import { Avatar } from "@/components/ui/avatar";

/** Two vertical strokes with dot terminals — the issue "activity" glyph. */
function ActivityGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <circle cx="4.5" cy="3.5" r="1.6" fill="currentColor" />
      <path
        d="M4.5 3.5v8.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <circle cx="4.5" cy="12" r="1.6" fill="currentColor" />
      <path
        d="M11.5 6.5v6"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <circle cx="11.5" cy="12.5" r="1.4" fill="currentColor" />
    </svg>
  );
}

/** Commit rail with a branch line out to a node — the integration glyph. */
function IntegrationGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <circle
        cx="4.5"
        cy="3.5"
        r="1.7"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path d="M4.5 5.4v5.2" stroke="currentColor" strokeWidth="1.4" />
      <circle
        cx="4.5"
        cy="12.5"
        r="1.7"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path
        d="M6.5 8h3.6"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <circle
        cx="11.9"
        cy="8"
        r="1.6"
        stroke="currentColor"
        strokeWidth="1.4"
      />
    </svg>
  );
}

export function IssueActivityCard() {
  return (
    <div className="hover-raise stroke-lit w-full max-w-sm rounded-[20px] bg-surface bg-gradient-to-bl from-white/[0.05] via-white/[0.02] to-transparent px-9 pb-12 pt-9 font-sans shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)]">
        {/* title */}
        <div className="row-hover -mx-2 flex items-center gap-3 rounded-lg px-2 py-1">
          <span className="flex size-5 shrink-0 items-center justify-center text-fg-muted">
            <ActivityGlyph className="size-4" />
          </span>
          <p className="min-w-0 truncate text-[13px] font-medium text-fg">
            #48127 mira/orb 9942 wire up exp…
          </p>
        </div>

        {/* timeline */}
        <div className="mt-9 space-y-7 text-[12.5px]">
          {/* linked */}
          <div className="row-hover -mx-2 flex items-center gap-3 rounded-lg px-2 py-1">
            <span className="relative size-5 shrink-0">
              <Avatar seed={0} size="sm" />
              <span className="absolute -bottom-0.5 -right-0.5 size-2 rounded-full bg-fg-secondary ring-2 ring-stage-2" />
            </span>
            <p className="min-w-0 truncate">
              <span className="font-medium text-fg">mira</span>{" "}
              <span className="text-shimmer">linked</span>
              <span className="mx-1.5 inline-flex size-5 items-center justify-center rounded-full bg-fg align-middle">
                <ArrowUpRightIcon className="size-3 text-black" weight="bold"/>
              </span>
              <span className="font-medium text-fg">mira/orb 9942</span>{" "}
              <span className="text-shimmer" style={SWEEP[1]}>wire up…</span>
            </p>
          </div>

          {/* status change */}
          <div className="row-hover -mx-2 flex items-center gap-3 rounded-lg px-2 py-1">
            <span className="flex size-5 shrink-0 items-center justify-center text-fg-muted">
              <ClockIcon className="size-4" />
            </span>
            <p className="min-w-0 truncate">
              <span className="font-medium text-fg">mira</span>{" "}
              <span className="text-shimmer" style={SWEEP[2]}>
                changed status from Backlog to…
              </span>
            </p>
          </div>

          {/* integration */}
          <div className="row-hover -mx-2 flex items-center gap-3 rounded-lg px-2 py-1">
            <span className="flex size-5 shrink-0 items-center justify-center text-fg-muted">
              <IntegrationGlyph className="size-4" />
            </span>
            <p className="min-w-0 truncate">
              <span className="font-medium text-fg">GitHub</span>{" "}
              <span className="text-shimmer" style={SWEEP[3]}>
                changed status from In Progr…
              </span>
            </p>
          </div>
        </div>
    </div>
  );
}


