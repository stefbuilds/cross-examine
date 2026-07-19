import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";

export interface ProgressiveFluxPhase {
  at: number;
  label: string;
}

export interface ProgressiveFluxLoaderProps {
  value: number;
  phases: ProgressiveFluxPhase[];
  className?: string;
  barClassName?: string;
  textClassName?: string;
}

function pickLabel(value: number, phases: ProgressiveFluxPhase[]) {
  let active = phases[0]?.label ?? "Preparing";
  for (const phase of phases) if (value >= phase.at) active = phase.label;
  return active;
}

export function ProgressiveFluxLoader({
  value,
  phases,
  className,
  barClassName,
  textClassName,
}: ProgressiveFluxLoaderProps) {
  const reduced = !!useReducedMotion();
  const current = Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : 0;
  const sortedPhases = React.useMemo(() => [...phases].sort((a, b) => a.at - b.at), [phases]);
  const label = pickLabel(current, sortedPhases);
  const rounded = Math.round(current);

  return (
    <div className={cn("flex w-full flex-col gap-4", className)}>
      <div className="flex min-h-9 items-end justify-between gap-4">
        <AnimatePresence mode="wait">
          <motion.p
            aria-hidden="true"
            animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
            className={cn("text-lg font-semibold tracking-[-0.02em] text-foreground", textClassName)}
            exit={{ filter: reduced ? "none" : "blur(7px)", opacity: 0, y: -5 }}
            initial={{ filter: reduced ? "none" : "blur(7px)", opacity: 0, y: 5 }}
            key={label}
            transition={{ duration: reduced ? 0 : 0.35 }}
          >
            {label}
          </motion.p>
        </AnimatePresence>
        <span className="font-mono text-xs font-semibold tabular-nums text-muted-foreground">{rounded}%</span>
      </div>
      <div
        aria-label="Verification progress"
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={rounded}
        aria-valuetext={`${rounded}% – ${label}`}
        className={cn(
          "relative h-5 overflow-hidden rounded-full bg-muted shadow-[inset_0_2px_3px_rgba(0,0,0,0.09),inset_0_-1px_2px_rgba(255,255,255,0.7)]",
          barClassName,
        )}
        role="progressbar"
      >
        <motion.div
          animate={{ width: `${current}%` }}
          className="relative h-full rounded-full bg-[linear-gradient(90deg,#7f76ca_0%,#d08ce8_46%,#78d8ff_68%,#7f76ca_100%)] shadow-[0_0_20px_rgba(127,118,202,0.45),inset_0_1.5px_0_rgba(255,255,255,0.55)]"
          initial={false}
          transition={{ duration: reduced ? 0 : 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          {!reduced && (
            <motion.span
              animate={{ x: ["-110%", "210%"] }}
              aria-hidden="true"
              className="absolute inset-y-0 left-0 w-1/2 rounded-full bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.65),transparent)] mix-blend-screen"
              transition={{ duration: 1.6, ease: "linear", repeat: Infinity }}
            />
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default ProgressiveFluxLoader;
