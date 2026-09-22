import { ArrowRight } from "lucide-react";
import { Link, useLoaderData, useNavigate } from "react-router-dom";

import type { FixtureResponse, RunSummary } from "@/app/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FindingEvidence } from "@/features/report/FindingEvidence";
import { VerdictStatus } from "@/features/report/VerdictStatus";

interface EvidenceLandingData {
  fixture: FixtureResponse;
  runs: RunSummary[];
}

export function EvidenceLandingPage() {
  const { fixture: payload, runs } = useLoaderData() as EvidenceLandingData;
  const navigate = useNavigate();
  const finding = payload.report.findings.find(
    (candidate) => candidate.outcome === "refuted",
  );
  const claim = finding
    ? payload.report.claims.find((candidate) => candidate.id === finding.claim_id)
    : undefined;
  const recentRuns = runs.slice(0, 5);
  const activeRuns = runs.filter((run) => run.status === "running" || run.status === "queued");

  return (
    <main className="page-shell">
      <header className="page-header">
        <div className="grid gap-4">
          <p className="eyebrow">Captured evidence / hero fixture</p>
          <VerdictStatus verdict={payload.report.verdict} />
          <h1 className="page-title">The catch is the product.</h1>
          <p className="page-copy">
            A plausible patch kept the happy path green. The captured base and
            head executions below show the preserve-critical regression that
            Cross-Examine found.
          </p>
        </div>
        <Link
          className="relative flex min-h-14 min-w-56 w-full max-w-md items-center justify-between gap-6 rounded-2xl border bg-card px-6 py-4 text-card-foreground shadow-xs/5 not-dark:bg-clip-padding before:pointer-events-none before:absolute before:inset-0 before:rounded-[calc(var(--radius-2xl)-1px)] before:shadow-[0_1px_--theme(--color-black/4%)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:before:shadow-[0_-1px_--theme(--color-white/6%)]"
          to="/run"
        >
          Run locally <ArrowRight aria-hidden="true" />
        </Link>
      </header>

      {finding && (
        <section aria-labelledby="hero-proof-heading" className="surface-frame">
          <div className="border-b border-border bg-secondary/70 px-5 py-4">
            <p className="eyebrow">Grounded receipt</p>
            <h2 className="mt-2 text-xl font-semibold" id="hero-proof-heading">
              {claim?.text ?? finding.claim_id}
            </h2>
          </div>
          <FindingEvidence finding={finding} />
        </section>
      )}

      {recentRuns.length > 0 && (
        <section aria-labelledby="recent-runs-heading" className="surface-frame">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-secondary/70 px-5 py-4">
            <div>
              <p className="eyebrow">Your activity</p>
              <h2 className="mt-2 text-xl font-semibold" id="recent-runs-heading">
                Recent runs
              </h2>
            </div>
            <div className="flex items-center gap-4">
              {activeRuns.length > 0 && (
                <span className="text-sm font-medium text-muted-foreground">
                  {activeRuns.length} in progress
                </span>
              )}
              <Link
                className="inline-flex items-center gap-1 text-sm font-medium text-foreground underline-offset-4 hover:underline"
                to="/runs"
              >
                View all runs <ArrowRight aria-hidden="true" className="size-3.5" />
              </Link>
            </div>
          </div>
          <Table className="w-full">
            <TableHeader>
              <TableRow>
                <TableHead>Repository</TableHead>
                <TableHead className="hidden sm:table-cell">Refs</TableHead>
                <TableHead>State</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentRuns.map((run) => (
                <TableRow
                  className="cursor-pointer"
                  key={run.id}
                  onClick={() => navigate(`/runs/${run.id}`)}
                >
                  <TableCell>
                    <Link
                      className="block max-w-[40vw] break-words font-medium text-foreground underline-offset-4 hover:underline sm:max-w-none"
                      onClick={(event) => event.stopPropagation()}
                      to={`/runs/${run.id}`}
                    >
                      {run.repo}
                    </Link>
                  </TableCell>
                  <TableCell className="hidden font-mono text-xs text-muted-foreground sm:table-cell">
                    {run.base_ref} → {run.head_ref}
                  </TableCell>
                  <TableCell>
                    {run.verdict ? (
                      <VerdictStatus verdict={run.verdict} />
                    ) : (
                      <span className="font-mono text-xs font-semibold uppercase text-muted-foreground">
                        {run.status === "failed" ? (
                          <span className="text-destructive">Failed</span>
                        ) : (
                          run.status
                        )}
                      </span>
                    )}
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
