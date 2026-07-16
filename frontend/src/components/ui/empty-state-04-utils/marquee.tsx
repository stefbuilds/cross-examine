import * as React from "react";

import { cn } from "@/lib/utils";

type MarqueeProps = React.ComponentProps<"div"> & {
  repeat?: number;
  vertical?: boolean;
};

export function Marquee({ children, className, repeat = 4, vertical = false, ...props }: MarqueeProps) {
  const content = Array.from({ length: repeat }, (_, index) => <React.Fragment key={index}>{children}</React.Fragment>);

  return (
    <div className={cn("group flex overflow-hidden [--gap:1rem]", vertical && "flex-col", className)} {...props}>
      <div className={cn("flex shrink-0 justify-around gap-[var(--gap)]", vertical ? "animate-marquee-vertical flex-col" : "animate-marquee-horizontal")}>{content}</div>
      <div aria-hidden className={cn("flex shrink-0 justify-around gap-[var(--gap)]", vertical ? "animate-marquee-vertical flex-col" : "animate-marquee-horizontal")}>
        {content}
      </div>
    </div>
  );
}
