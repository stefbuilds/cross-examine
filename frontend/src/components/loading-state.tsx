"use client";

import { useEffect, useState } from "react";

const chevron = Array.from({ length: 9 }, (_, index) => {
  const row = Math.floor(index / 3);
  const column = index % 3;
  return (column + Math.abs(row - 1)) * 90;
});

const ORBIT_ORDER = [0, 1, 2, 5, 8, 7, 6, 3];
const orbit = Array.from({ length: 9 }, (_, index) => {
  const order = ORBIT_ORDER.indexOf(index);
  return order === -1 ? null : order * 110;
});

const PATTERNS = {
  Drive: { delays: chevron, dur: 650, round: false },
  Dots: { delays: chevron, dur: 650, round: true },
  Orbit: { delays: orbit, dur: 950, round: false },
} satisfies Record<
  string,
  { delays: (number | null)[]; dur: number; round: boolean }
>;

export type LoadingStateVariant = keyof typeof PATTERNS | "Surfer";

function LoaderGrid({
  delays,
  dur,
  round,
}: {
  delays: (number | null)[];
  dur: number;
  round: boolean;
}) {
  return (
    <span
      aria-hidden="true"
      className="grid shrink-0 grid-cols-[repeat(3,4px)] gap-[1.5px]"
      data-testid="loading-state-grid"
    >
      {delays.map((delay, index) => (
        <span
          key={index}
          className={`loading-state-pixel size-[4px] bg-foreground ${
            round ? "rounded-full" : "rounded-[1px]"
          }`}
          style={{
            opacity: delay === null ? 0.07 : 0.15,
            animation:
              delay === null
                ? "none"
                : `pixel-on ${dur}ms ease-in-out ${delay}ms infinite`,
          }}
        />
      ))}
    </span>
  );
}

function useElapsed() {
  const [deciseconds, setDeciseconds] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(
      () => setDeciseconds((current) => current + 1),
      100,
    );
    return () => window.clearInterval(timer);
  }, []);

  const total = deciseconds / 10;
  if (total < 60) return `${total.toFixed(1)}s`;
  return `${Math.floor(total / 60)}m ${(total % 60).toFixed(1)}s`;
}

export default function LoadingState({
  label,
  variant = "Drive",
  videoSrc =
    "https://95dnc2a95qgwt9ff.public.blob.vercel-storage.com/subway-surfers.mp4",
}: {
  label?: string;
  variant?: LoadingStateVariant;
  videoSrc?: string;
}) {
  const elapsed = useElapsed();
  const surfer = variant === "Surfer";
  const resolvedLabel = label ?? (surfer ? "Subway surfing" : "Churning");
  const [videoOk, setVideoOk] = useState(true);
  const pattern = surfer ? PATTERNS.Drive : PATTERNS[variant];

  useEffect(() => setVideoOk(true), [videoSrc]);

  const labelElement = (
    <span className="loading-state-label bg-clip-text text-[13px] font-medium text-transparent">
      {resolvedLabel}
    </span>
  );
  const elapsedElement = (
    <span className="font-mono text-[12px] text-muted-foreground tabular-nums">
      {elapsed}
    </span>
  );

  if (surfer) {
    return (
      <div
        aria-live="polite"
        className="flex w-fit flex-col items-start"
        role="status"
      >
        <div className="flex items-center gap-2.5">
          <LoaderGrid {...PATTERNS.Drive} />
          {labelElement}
          {elapsedElement}
        </div>
        <div className="loading-state-pop-in mt-2 w-56 origin-top-left overflow-hidden rounded-[10px] shadow-xl">
          <div className="relative aspect-video w-full bg-popover">
            {videoOk ? (
              <video
                autoPlay
                className="h-full w-full object-cover"
                loop
                muted
                onError={() => setVideoOk(false)}
                playsInline
                src={videoSrc}
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-1.5">
                <LoaderGrid {...PATTERNS.Drive} />
                <span className="px-3 text-center font-mono text-[10px] text-muted-foreground">
                  Video unavailable
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      aria-live="polite"
      className="flex w-fit items-center gap-2.5"
      role="status"
    >
      <LoaderGrid {...pattern} />
      {labelElement}
      {elapsedElement}
    </div>
  );
}

