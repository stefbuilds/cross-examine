import { Database } from "lucide-react";
import { Link, useLoaderData } from "react-router-dom";

import type { CorpusSummary } from "@/app/api";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/cnippet-empty";
import { Entropy } from "@/components/ui/entropy";
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
          Eligible locator/symbol Layer-A fixtures are retained for later runs on
          the same repository.
        </p>
        </div>
        <Database aria-hidden="true" className="size-12 text-primary" strokeWidth={1.25} />
      </header>
      {summaries.length === 0 ? (
        <Empty
          className="min-h-72 rounded-[1.4rem] border border-dashed border-primary bg-card shadow-sm"
          data-corpus-empty
        >
          <EmptyHeader>
            <div aria-hidden="true" className="mx-auto mb-2 overflow-hidden">
              <Entropy className="mx-auto" size={200} />
            </div>
            <EmptyTitle>No pinned checks yet</EmptyTitle>
            <EmptyDescription>
              Run a verification to begin accumulating grounded behavioral checks.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
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
                    Rows observed in latest run
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
