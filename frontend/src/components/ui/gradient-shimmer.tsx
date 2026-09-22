import { type CSSProperties, type ElementType, type HTMLAttributes, useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

export type GradientPresetName = "sunrise" | "bubble" | "mint" | "twilight";

const gradients: Record<GradientPresetName, string> = {
  sunrise: "#b6d3ef, #e1cdb9, #ef9b62, #f78a94",
  bubble: "#f5ebd9, #ebbdde, #8cbff0, #78b0ff",
  mint: "#decee8, #7dc0fb, #00c7a6",
  twilight: "#e3cce6, #4e8cd5, #6068c2, #38364e",
};

export interface GradientShimmerProps extends Omit<HTMLAttributes<HTMLElement>, "children"> {
  children: string;
  gradient?: GradientPresetName;
  duration?: number;
  pauseBetween?: number;
  as?: ElementType;
}

export function GradientShimmer({
  children,
  gradient = "sunrise",
  duration = 3.2,
  pauseBetween = 900,
  as: Comp = "span",
  className,
  style,
  ...props
}: GradientShimmerProps) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || typeof element.animate !== "function") return;
    const supportsClip = typeof window.CSS?.supports === "function" && (
      window.CSS.supports("background-clip", "text") ||
      window.CSS.supports("-webkit-background-clip", "text")
    );
    if (!supportsClip) {
      element.style.removeProperty("background-image");
      element.style.removeProperty("-webkit-text-fill-color");
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let animation: Animation | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let stopped = false;
    const run = () => {
      if (stopped) return;
      animation = element.animate(
        [{ backgroundPosition: "180% center" }, { backgroundPosition: "-80% center" }],
        { duration: Math.max(300, duration * 1000), easing: "cubic-bezier(0.45, 0, 0.55, 1)" },
      );
      animation.onfinish = () => { timer = setTimeout(run, Math.max(0, pauseBetween)); };
    };
    run();
    return () => {
      stopped = true;
      animation?.cancel?.();
      clearTimeout(timer);
    };
  }, [children, duration, pauseBetween]);

  const shimmerStyle = {
    backgroundImage: `linear-gradient(105deg, currentColor 20%, ${gradients[gradient]}, currentColor 80%)`,
    backgroundSize: "260% 100%",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    ...style,
  } as CSSProperties;

  return (
    <Comp
      className={cn("inline-block", className)}
      ref={ref}
      style={shimmerStyle}
      {...props}
    >
      {children}
    </Comp>
  );
}

export default GradientShimmer;
