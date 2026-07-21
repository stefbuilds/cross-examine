// Sidebar onboarding banner.
// A single compact card with one strong primary action and a quiet dismiss,
// replacing the previous stacked-card decoration.
import * as React from "react";
import { ArrowRight, X } from "lucide-react";
import { Link } from "react-router-dom";

import { cn } from "@/lib/utils";

const STORAGE_KEY = "cross-examine-help-dismissed";

export function SidebarHelpBanner({
  className,
  onOpen,
}: {
  className?: string;
  onOpen?: () => void;
}) {
  const [dismissed, setDismissed] = React.useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(STORAGE_KEY) === "true";
  });

  if (dismissed) return null;

  const dismiss = () => {
    setDismissed(true);
    if (typeof window !== "undefined") window.localStorage.setItem(STORAGE_KEY, "true");
  };

  return (
    <section
      aria-label="How to use Cross-Examine"
      className={cn("relative rounded-lg border border-sidebar-border bg-card/60 p-3", className)}
    >
      <button
        aria-label="Dismiss help"
        className="absolute right-1.5 top-1.5 grid size-6 place-items-center rounded-md text-muted-foreground outline-none transition hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar"
        onClick={dismiss}
        type="button"
      >
        <X aria-hidden="true" className="size-3.5" />
      </button>
      <p className="pr-6 font-heading text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        How to use Cross-Examine
      </p>
      <p className="mt-1.5 text-[13px] leading-5 text-muted-foreground">
        Paste a Python repo and PR refs, then let the five-stage harness catch the regression.
      </p>
      <Link
        aria-label="Start a verification"
        className="mt-3 inline-flex h-8 w-full items-center justify-center gap-1.5 rounded-md bg-primary text-[13px] font-semibold text-primary-foreground shadow-sm outline-none transition hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar"
        onClick={onOpen}
        to="/run"
      >
        Start a verification
        <ArrowRight aria-hidden="true" className="size-3.5" />
      </Link>
    </section>
  );
}
