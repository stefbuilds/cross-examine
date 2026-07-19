import { Plus } from "lucide-react";
import { Link, useLoaderData } from "react-router-dom";

import type { RunSummary } from "@/app/api";
import { Button } from "@/components/ui/button";
import EmptyState from "@/components/ui/empty-state-04";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { VerdictStatus } from "@/features/report/VerdictStatus";

export function RunHistoryPage() {
  const runs = useLoaderData() as RunSummary[];

  return (
    <main className="page-shell">
      <header className="page-header">
        <div>
          <p className="eyebrow">Restart-safe evidence</p>
          <h1 className="page-title mt-4">Run history</h1>
          <p className="page-copy mt-4">
            Reopen persisted reports and their exact execution receipts.
          </p>
        </div>
        <Button asChild>
          <Link to="/run">
            <Plus aria-hidden="true" />
            New verification
          </Link>
        </Button>
      </header>

      <section className="surface-frame">
        {runs.length === 0 ? (
          <EmptyState />
        ) : (
            <Table className="min-w-[720px]">
              <TableHeader className="bg-secondary/70">
                <TableRow>
                  <TableHead>Repository</TableHead>
                  <TableHead>Refs</TableHead>
                  <TableHead>State</TableHead>
                  <TableHead>Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {runs.map((run) => (
                  <TableRow key={run.id}>
                    <TableCell>
                      <Link
                        className="font-medium text-foreground underline-offset-4 hover:underline"
                        to={`/runs/${run.id}`}
                      >
                        {run.repo}
                      </Link>
                      <p className="mt-1 font-mono text-xs text-muted-foreground">
                        {run.id.slice(0, 12)}
                      </p>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {run.base_ref} → {run.head_ref}
                    </TableCell>
                    <TableCell>
                      {run.verdict ? (
                        <VerdictStatus verdict={run.verdict} />
                      ) : (
                        <span className="font-mono text-xs font-semibold uppercase text-muted-foreground">
                          {run.status}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      <time dateTime={run.updated_at}>
                        {new Date(run.updated_at).toLocaleString()}
                      </time>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
        )}
      </section>
    </main>
  );
}
