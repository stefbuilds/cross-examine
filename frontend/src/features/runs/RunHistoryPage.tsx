import { Plus } from "lucide-react";
import { Link, useLoaderData } from "react-router-dom";

import type { RunSummary } from "@/app/api";
import { Button } from "@/components/ui/button";
import { VerdictStatus } from "@/features/report/VerdictStatus";

export function RunHistoryPage() {
  const runs = useLoaderData() as RunSummary[];

  return (
    <main className="mx-auto grid w-full max-w-6xl gap-7 p-4 md:p-8">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-border/50 pb-6">
        <div>
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Restart-safe evidence
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Run history</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Reopen persisted reports and their exact execution receipts.
          </p>
        </div>
        <Button asChild>
          <Link to="/">
            <Plus aria-hidden="true" />
            New verification
          </Link>
        </Button>
      </header>

      <section className="overflow-hidden rounded-xl border border-border/50 bg-card shadow-sm">
        {runs.length === 0 ? (
          <div className="grid gap-2 p-8 text-center">
            <h2 className="font-semibold">No runs yet</h2>
            <p className="text-sm text-muted-foreground">
              Start a verification to create the first grounded report.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-border/50 bg-muted/30 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Repository</th>
                  <th className="px-4 py-3 font-medium">Refs</th>
                  <th className="px-4 py-3 font-medium">State</th>
                  <th className="px-4 py-3 font-medium">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {runs.map((run) => (
                  <tr key={run.id} className="transition-colors hover:bg-muted/20">
                    <td className="px-4 py-4">
                      <Link
                        className="font-medium text-foreground underline-offset-4 hover:underline"
                        to={`/runs/${run.id}`}
                      >
                        {run.repo}
                      </Link>
                      <p className="mt-1 font-mono text-xs text-muted-foreground">
                        {run.id.slice(0, 12)}
                      </p>
                    </td>
                    <td className="px-4 py-4 font-mono text-xs text-muted-foreground">
                      {run.base_ref} → {run.head_ref}
                    </td>
                    <td className="px-4 py-4">
                      {run.verdict ? (
                        <VerdictStatus verdict={run.verdict} />
                      ) : (
                        <span className="font-mono text-xs font-semibold uppercase text-muted-foreground">
                          {run.status}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-xs text-muted-foreground">
                      <time dateTime={run.updated_at}>
                        {new Date(run.updated_at).toLocaleString()}
                      </time>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
