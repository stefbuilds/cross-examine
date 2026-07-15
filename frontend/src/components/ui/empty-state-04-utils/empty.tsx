import type React from "react";

import { cn } from "@/lib/utils";

export function Empty({ className, ...props }: React.ComponentProps<"div">): React.ReactElement {
  return <div className={cn("flex flex-col items-center justify-center gap-6 text-center text-balance", className)} {...props} />;
}

export function EmptyHeader({ className, ...props }: React.ComponentProps<"div">): React.ReactElement {
  return <div className={cn("flex max-w-sm flex-col items-center text-center", className)} {...props} />;
}

export function EmptyTitle({ className, ...props }: React.ComponentProps<"h2">): React.ReactElement {
  return <h2 className={cn("font-heading text-xl font-semibold", className)} {...props} />;
}

export function EmptyDescription({ className, ...props }: React.ComponentProps<"p">): React.ReactElement {
  return <p className={cn("mt-1 text-sm text-muted-foreground", className)} {...props} />;
}

export function EmptyContent({ className, ...props }: React.ComponentProps<"div">): React.ReactElement {
  return <div className={cn("flex w-full flex-col items-center gap-4", className)} {...props} />;
}
