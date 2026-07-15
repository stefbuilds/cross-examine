import { Database } from "lucide-react";
import { Link, useLoaderData } from "react-router-dom";

import type { CorpusSummary } from "@/app/api";

export function CorpusPage() {
  const summaries = useLoaderData() as CorpusSummary[];

  return (
    <main className="mx-auto grid w-full max-w-5xl gap-6 p-4 md:p-8">
      <header className="border-b border-border/50 pb-6">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          State moat
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Behavioral corpus
        </h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Passing executed checks become durable regression evidence for later
          runs on the same repository.
        </p>
      </header>
      {summaries.length === 0 ? (
        <section className="flex min-h-64 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-card text-center">
          <Database
            aria-hidden="true"
            className="size-5 text-muted-foreground"
          />
          <p className="font-medium">No pinned checks yet</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Run a verification to begin accumulating grounded behavioral checks.
          </p>
        </section>
      ) : (
        <section className="overflow-hidden rounded-xl border border-border/50 bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium" scope="col">
                    Repository
                  </th>
                  <th className="px-4 py-3 text-right font-medium" scope="col">
                    Checks
                  </th>
                  <th
                    className="hidden px-4 py-3 text-right font-medium sm:table-cell"
                    scope="col"
                  >
                    Latest growth
                  </th>
                  <th
                    className="hidden px-4 py-3 font-medium md:table-cell"
                    scope="col"
                  >
                    Updated
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {summaries.map((summary) => (
                  <tr className="hover:bg-muted/30" key={summary.repo}>
                    <th className="px-4 py-4 font-medium" scope="row">
                      <Link
                        className="underline-offset-4 hover:underline"
                        to={`/runs/${summary.last_run_id}`}
                      >
                        {summary.repo}
                      </Link>
                    </th>
                    <td className="px-4 py-4 text-right font-mono">
                      {summary.corpus_total}
                    </td>
                    <td className="hidden px-4 py-4 text-right font-mono text-emerald-700 sm:table-cell dark:text-emerald-400">
                      +{summary.latest_growth}
                    </td>
                    <td className="hidden px-4 py-4 text-muted-foreground md:table-cell">
                      {new Date(summary.updated_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </main>
  );
}
