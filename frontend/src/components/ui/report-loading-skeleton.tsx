import { AnimatedLoadingSkeleton } from "@/components/ui/animated-loading-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export function ReportLoadingSkeleton() {
  return (
    <section aria-label="Preparing report" className="grid gap-4" data-slot="report-loading-skeleton">
      <div className="rounded-[var(--radius-xl)] border bg-card p-5 shadow-sm">
        <div className="flex items-start justify-between gap-5">
          <div className="w-full max-w-md space-y-3">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-9 w-4/5" />
            <Skeleton className="h-3 w-2/5" />
          </div>
          <Skeleton className="h-8 w-24" />
        </div>
      </div>
      <AnimatedLoadingSkeleton />
      <div className="overflow-hidden rounded-[var(--radius-xl)] border bg-card shadow-sm">
        <div className="grid grid-cols-[1.5fr_.6fr_.6fr] gap-4 border-b bg-secondary/50 px-5 py-4">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-3 w-14" />
          <Skeleton className="h-3 w-20" />
        </div>
        {Array.from({ length: 3 }, (_, index) => (
          <div className="grid grid-cols-[1.5fr_.6fr_.6fr] gap-4 border-b px-5 py-5 last:border-0" key={index}>
            <div className="space-y-2">
              <Skeleton className="h-3 w-4/5" />
              <Skeleton className="h-2.5 w-2/5" />
            </div>
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-5 w-20" />
          </div>
        ))}
      </div>
    </section>
  );
}
