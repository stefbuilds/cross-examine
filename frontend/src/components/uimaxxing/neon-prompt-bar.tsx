/*!
 * UImaxxing™ — © 2026 Yogi Suria. All rights reserved.
 * Free to use, modify and ship in your own products, commercial ones
 * included. Not for republication as a component library, and not as
 * machine-learning training data. See LICENSE.
 * @author Yogi Suria <yogi@jumper.xyz>
 * @license SEE LICENSE IN LICENSE
 * @preserve
 * provenance-mark: uim1-1ea983e5.866d597c
 */
import {
  FileTextIcon,
  LockSimpleIcon,
  MicrophoneIcon,
  NavigationArrowIcon,
  PlusIcon,
  SparkleIcon,
} from "@phosphor-icons/react/ssr";

import { GradientIconButton } from "@/components/ui/gradient-button";
import { SelectMenu } from "@/components/ui/select-menu";
import { TypingField } from "@/components/ui/typing-field";

import { cn } from "@/lib/utils";

const chipClass =
  "interactive flex h-8 shrink-0 items-center gap-1.5 rounded-pill border border-white/[0.07] bg-surface px-3 text-xs text-fg hover:border-white/[0.16] hover:bg-white/[0.04] hover:text-fg";

/**
 * @param compact Drops the attachment button, the document-mode select and
 *   Talk, leaving the tone select and Send. The dock opens this bar over the
 *   page rather than inside a card, and a launcher's bar earns fewer controls
 *   than a showcase's — every chip there is one more thing between the reader
 *   and the one thing they came to do.
 *
 *   It also locks Send. The dock's bar is maxxagent, which does not exist yet;
 *   a send button that looks live and does nothing is a worse promise than one
 *   that says so. The lock sits on the button's edge rather than replacing the
 *   arrow, so the control still reads as Send — locked, not missing.
 */
export function NeonPromptBar({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className="relative w-full max-w-[400px]">
      {/* Tight halo hugging the bar: warm along the top/left, violet at the
          bottom-right — kept close so it reads as a neon rim, not a cloud */}
      {/* animate-drift lives on the (filter-free) wrapper so the children's
          blur() filters stay intact while the glows slide */}
      <div aria-hidden className="animate-drift pointer-events-none absolute inset-0">
        <div className="absolute -top-4 left-0 h-14 w-[62%] rounded-full bg-[#ff8f76] opacity-[0.12] blur-xl" />
        <div className="absolute -bottom-4 left-[6%] h-12 w-[52%] rounded-full bg-[#ff7684] opacity-[0.08] blur-xl" />
        <div className="absolute -bottom-5 right-[4%] h-14 w-[48%] rounded-full bg-accent-violet opacity-30 blur-xl" />

        {/* Tight angular neon hugging the border, masked by the opaque bar */}
        <div className="absolute -inset-[3px] rounded-[25px] bg-[linear-gradient(115deg,rgba(255,143,118,0.3),rgba(255,118,132,0.18)_28%,rgba(154,123,255,0.42)_55%,rgba(91,141,238,0.3)_78%,transparent_96%)] blur-[8px]" />
      </div>

      {/* Aurora hairline ring on the opaque bar */}
      <div className="stroke-aurora-tr relative rounded-[22px] bg-[linear-gradient(180deg,var(--color-frame)_0%,var(--color-stage-2)_45%,var(--color-well)_100%)] px-3.5 pb-3 pt-4 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.9)]">
        <TypingField
          defaultValue="What makes a landing page convert?"
          placeholder="Ask anything…"
          aria-label="Prompt"
          className="px-1 text-sm leading-5 text-fg-muted"
        />

        {/* Controls row */}
        <div className="mt-3.5 flex flex-wrap items-center gap-1.5">
          {!compact && (
            <button
              type="button"
              aria-label="Add attachment"
              className="hover-spin interactive flex size-8 shrink-0 items-center justify-center rounded-full border border-white/[0.07] bg-surface text-fg-secondary hover:border-white/[0.16] hover:text-fg"
            >
              <PlusIcon className="size-4" />
            </button>
          )}

          <SelectMenu
            items={["Boost", "Balanced", "Precise"]}
            className="shrink-0"
            triggerClassName={chipClass}
            panelClassName="text-xs"
            icon={
              <SparkleIcon className="size-3.5 shrink-0 text-fg-secondary" />
            }
          />

          {!compact && (
            <SelectMenu
              items={["Draft", "Outline", "Full essay"]}
              className="shrink-0"
              triggerClassName={chipClass}
              panelClassName="text-xs"
              icon={
                <FileTextIcon className="size-3.5 shrink-0 text-fg-secondary" />
              }
            />
          )}

          <div className="min-w-2 flex-1" />

          {!compact && (
            <button type="button" className={chipClass}>
              <MicrophoneIcon className="size-3.5 text-fg-secondary" />
              Talk
            </button>
          )}

          <div className="relative shrink-0">
            <GradientIconButton
              aria-label={compact ? "Send — maxxagent is coming soon" : "Send"}
              aria-disabled={compact || undefined}
              className={cn(
                "hover-nudge interactive size-8 text-black shadow-[0_0_24px_-6px_rgba(139,123,255,0.7)] hover:scale-105",
                /* Locked, so it does not invite the press: the gradient stays
                   (this is still the send button) but drains to the same
                   saturation the house switches use for an off state. */
                compact && "[filter:saturate(0.25)brightness(0.92)]",
              )}
            >
              <NavigationArrowIcon
                className="size-3.5 rotate-[18deg] fill-current"
                weight="light"
              />
            </GradientIconButton>

            {compact && (
              /* On the edge, straddling it — a badge inside the 32px button
                 would leave the lock and the arrow fighting for four pixels
                 each, and a lock beside the button would read as a separate
                 control. */
              <span
                aria-hidden
                className="pointer-events-none absolute -right-1 -top-1 grid size-[15px] place-items-center rounded-full border border-white/[0.12] fill-panel text-fg-secondary shadow-[0_2px_6px_rgb(var(--shade)/0.6)]"
              >
                <LockSimpleIcon className="size-[9px]" weight="bold" />
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


