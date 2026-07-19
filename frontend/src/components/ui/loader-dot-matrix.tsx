import { useMemo } from "react";

import { cn } from "@/lib/utils";

export type LoaderDotMatrixProps = {
  rows?: number;
  cols?: number;
  pattern?: "ripple" | "wave" | "rain";
  speed?: number;
  dotSize?: number;
  className?: string;
  label?: string;
};

export function LoaderDotMatrix({
  rows = 5,
  cols = 7,
  pattern = "ripple",
  speed = 1.5,
  dotSize = 3,
  className,
  label = "Loading",
}: LoaderDotMatrixProps) {
  const dots = useMemo(() => {
    const result: { delay: number }[] = [];
    const centerX = (cols - 1) / 2;
    const centerY = (rows - 1) / 2;
    const maxDist = Math.max(1, Math.sqrt(centerX ** 2 + centerY ** 2));

    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < cols; col += 1) {
        let delay = 0;
        if (pattern === "ripple") {
          delay = (Math.sqrt((col - centerX) ** 2 + (row - centerY) ** 2) / maxDist) * speed;
        } else if (pattern === "wave") {
          delay = ((row + col) / Math.max(1, rows + cols - 2)) * speed;
        } else {
          delay = row * 0.1 + (col / Math.max(1, cols)) * speed;
        }
        result.push({ delay });
      }
    }
    return result;
  }, [cols, pattern, rows, speed]);

  return (
    <output
      aria-label={label}
      aria-live="polite"
      className={cn("inline-flex", className)}
      data-slot="loader-dot-matrix"
    >
      <span className="sr-only">{label}</span>
      <span
        aria-hidden="true"
        className="grid"
        style={{ gap: `${dotSize * 1.5}px`, gridTemplateColumns: `repeat(${cols}, 1fr)` }}
      >
        {dots.map(({ delay }, index) => (
          <span
            className="rounded-full bg-current will-change-transform motion-reduce:animate-none"
            key={`${rows}-${cols}-${index}`}
            style={{
              animation: `dot-matrix-pulse ${speed}s ease-in-out infinite`,
              animationDelay: `${delay}s`,
              height: `${dotSize}px`,
              width: `${dotSize}px`,
            }}
          />
        ))}
      </span>
    </output>
  );
}

export default LoaderDotMatrix;
