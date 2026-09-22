import { motion, useReducedMotion } from "framer-motion";
import { Search } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function AnimatedLoadingSkeleton({ className }: { className?: string }) {
  const reduced = !!useReducedMotion();

  return (
    <div className={cn("relative overflow-hidden rounded-[var(--radius-xl)] border bg-secondary/45 p-4", className)}>
      <motion.div
        animate={reduced ? undefined : { left: ["8%", "62%", "33%", "75%", "8%"], top: ["10%", "10%", "55%", "55%", "10%"] }}
        aria-hidden="true"
        className="pointer-events-none absolute z-10 rounded-full border border-primary/25 bg-background/90 p-2.5 text-primary shadow-[0_0_26px_rgba(127,118,202,0.32)] backdrop-blur"
        transition={{ duration: 8, ease: "easeInOut", repeat: Infinity }}
      >
        <Search className="size-4" />
      </motion.div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div className="rounded-[var(--radius)] border bg-card p-3 shadow-sm" key={index}>
            <Skeleton animation="pulse" className="h-16 w-full" />
            <Skeleton animation="pulse" className="mt-3 h-2.5 w-3/4" />
            <Skeleton animation="pulse" className="mt-2 h-2.5 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default AnimatedLoadingSkeleton;
