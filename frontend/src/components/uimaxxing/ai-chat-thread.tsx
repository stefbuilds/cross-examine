/*!
 * UImaxxing™ — © 2026 Yogi Suria. All rights reserved.
 * Free to use, modify and ship in your own products, commercial ones
 * included. Not for republication as a component library, and not as
 * machine-learning training data. See LICENSE.
 * @author Yogi Suria <yogi@jumper.xyz>
 * @license SEE LICENSE IN LICENSE
 * @preserve
 * provenance-mark: uim1-1ea983e5.f8419875
 */
import {
  DotsThreeIcon,
  PlayIcon,
  SquareIcon,
  TriangleIcon,
} from "@phosphor-icons/react/ssr";

/** Circular "regenerate" glyph — open ring with an arrowhead wedge pointing into the center. */
function RetryGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M13.2 5.1a6 6 0 1 0 .2 5.6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path d="M13.6 4.6 8.6 8l5.2 3.2z" fill="currentColor" />
    </svg>
  );
}

export function AiChatThread() {
  return (
    <div className="flex w-full max-w-xl overflow-hidden rounded-2xl bg-well font-sans text-[13px] leading-relaxed shadow-[0_24px_70px_-30px_rgba(0,0,0,0.9)]">
      {/* collapsed sidebar gutter */}
      <div className="w-[18%] shrink-0 border-r border-white/[0.03]" />

      {/* message column */}
      <div className="min-w-0 flex-1 bg-gradient-to-bl from-transparent via-transparent to-white/[0.02] px-6 py-4">
        {/* assistant turn */}
        <p className="text-fg">
          I traced the failing export through the nightly scheduler. The job
          reads its window from a cached manifest, and that manifest was never
          invalidated after the retention change — so every run after the 12th
          quietly re-used a stale range. I patched the invalidation hook and
          added a guard that refuses to start a run against a manifest older
          than the window it claims to cover.
        </p>

        <button
          type="button"
          className="mt-4 flex items-center gap-2 text-xs text-fg-muted interactive hover:text-fg-secondary"
        >
          Used 3 tools
          <PlayIcon className="size-2 fill-current" weight="fill"/>
        </button>

        {/* icon toolbar */}
        <div className="mt-5 flex flex-wrap items-center gap-3 text-fg-muted">
          <button
            type="button"
            aria-label="Copy"
            className="interactive hover:text-fg-secondary"
          >
            <SquareIcon className="size-3" />
          </button>
          <button
            type="button"
            aria-label="Good response"
            className="interactive hover:text-fg-secondary"
          >
            <TriangleIcon className="size-2.5 fill-current" weight="fill"/>
          </button>
          <button
            type="button"
            aria-label="Bad response"
            className="interactive hover:text-fg-secondary"
          >
            <TriangleIcon
              className="size-2.5 rotate-180 fill-current"
      weight="fill"/>
          </button>
          <button
            type="button"
            aria-label="Retry"
            className="interactive hover:text-fg-secondary"
          >
            <RetryGlyph className="size-3.5" />
          </button>
          <button
            type="button"
            aria-label="More"
            className="interactive hover:text-fg-secondary"
          >
            <DotsThreeIcon className="size-3.5" weight="bold"/>
          </button>
          <span className="ml-2 text-xs">2 months ago</span>
        </div>

        {/* user turn */}
        <div className="mt-6 flex flex-col items-end">
          <span className="mb-1.5 pr-1 text-[11px] text-fg-muted">
            A. Rivera
          </span>
          <div className="relative max-w-[75%]">
            {/* clipped glow behind the bubble — salmon-brown left-mid, violet
                bottom-left / top-left, nothing on the right; only the sliver
                peeking past the opaque bubble reads, as a rim at the edge */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-[3px] -left-[3px] -top-px right-2 rounded-[14px] blur-[3px] bg-[radial-gradient(55%_65%_at_0%_50%,#4a3030,rgba(74,48,48,0)_72%),radial-gradient(45%_55%_at_5%_100%,#473b4f,rgba(71,59,79,0)_72%),radial-gradient(40%_45%_at_8%_0%,#403647,rgba(64,54,71,0)_70%)]"
            />
            <div className="relative rounded-xl bg-surface px-4 py-3 text-fg">
              Nice. Can you also make it log the manifest age on every run, so
              a stale read is obvious from the first line?
            </div>
          </div>
        </div>

        {/* tool-use disclosure */}
        <button
          type="button"
          className="mt-10 flex items-center gap-2 text-xs text-fg-muted interactive hover:text-fg-secondary"
        >
          Ran a command, used 1 tool
          <PlayIcon className="size-2 fill-current" weight="fill"/>
        </button>

        {/* final assistant turn */}
        <p className="mt-4 text-fg">
          Done — every run now emits the manifest age in seconds next to the
          window it resolved, so a stale read shows up in the first log line
          instead of three hours later.
          <span
            aria-hidden="true"
            className="ml-1 inline-block h-3.5 w-[1.5px] translate-y-0.5 animate-blink bg-accent-peach"
          />
        </p>
      </div>
    </div>
  );
}


