import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export type SkeletonAnimation = "shimmer" | "pulse" | "none";

export function Skeleton({
  animation = "shimmer",
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & { animation?: SkeletonAnimation }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "skeleton-surface rounded-[var(--radius)] bg-muted",
        animation === "shimmer" && "skeleton-shimmer",
        animation === "pulse" && "animate-pulse",
        className,
      )}
      data-animation={animation}
      data-slot="skeleton"
      {...props}
    />
  );
}
