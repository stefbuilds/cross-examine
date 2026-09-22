// Shared accessible error message.
import { memo } from "react";

import { cn } from "@/lib/utils";

export const ErrorMessage = memo(function ErrorMessage({ className, message, title = "Something went wrong" }: { className?: string; message: string; title?: string }) {
  return (
    <div className={cn("rounded-2xl border border-destructive/30 bg-destructive/10 px-5 py-4 text-sm", className)} role="alert">
      <div className="font-heading font-semibold uppercase text-foreground">{title}</div>
      <div className="mt-1 break-words font-mono text-xs text-muted-foreground">{message}</div>
    </div>
  );
});
