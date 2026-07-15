import { Database } from "lucide-react";
import { Link, useLoaderData } from "react-router-dom";

import type { CorpusSummary } from "@/app/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function CorpusPage() {
  const summaries = useLoaderData() as CorpusSummary[];

  return (
    <main className="page-shell">
      <header className="page-header">
        <div>
        <p className="eyebrow">State moat</p>
        <h1 className="page-title mt-4">
          Behavioral corpus
        </h1>
        <p className="page-copy mt-4">
          Passing executed checks become durable regression evidence for later
          runs on the same repository.
        </p>
        </div>
        <Database aria-hidden="true" className="size-12 text-primary" strokeWidth={1.25} />
      </header>
      {summaries.length === 0 ? (
        <section className="flex min-h-72 flex-col items-center justify-center gap-3 rounded-[1.4rem] border border-dashed border-primary bg-card text-center shadow-sm">
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
        <section className="surface-frame">
            <Table>
              <TableHeader className="bg-secondary/70">
                <TableRow>
                  <TableHead scope="col">
                    Repository
                  </TableHead>
                  <TableHead className="text-right" scope="col">
                    Checks
                  </TableHead>
                  <TableHead
                    className="hidden text-right sm:table-cell"
                    scope="col"
                  >
                    Latest growth
                  </TableHead>
                  <TableHead
                    className="hidden md:table-cell"
                    scope="col"
                  >
                    Updated
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summaries.map((summary) => (
                  <TableRow key={summary.repo}>
                    <th className="px-4 py-4 font-medium" scope="row">
                      <Link
                        className="underline-offset-4 hover:underline"
                        to={`/runs/${summary.last_run_id}`}
                      >
                        {summary.repo}
                      </Link>
                    </th>
                    <TableCell className="text-right font-mono">
                      {summary.corpus_total}
                    </TableCell>
                    <TableCell className="hidden text-right font-mono text-emerald-700 sm:table-cell dark:text-emerald-400">
                      +{summary.latest_growth}
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground md:table-cell">
                      {new Date(summary.updated_at).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
        </section>
      )}
    </main>
  );
}
