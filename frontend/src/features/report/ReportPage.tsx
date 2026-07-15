import { Fragment, useMemo, useState } from "react";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FindingEvidence } from "./FindingEvidence";
import { VerdictStatus } from "./VerdictStatus";
import type { Report } from "./report-model";

export type { Report } from "./report-model";

const outcomeColor = {
  verified: "text-emerald-700 dark:text-emerald-300",
  refuted: "text-rose-700 dark:text-rose-300",
  unverifiable: "text-amber-700 dark:text-amber-300",
} as const;

export function ReportPage({
  report,
  fixture = false,
}: {
  report: Report;
  fixture?: boolean;
}) {
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const claimsById = useMemo(
    () => new Map(report.claims.map((claim) => [claim.id, claim])),
    [report.claims],
  );

  return (
    <main className="page-shell">
      <header className="page-header">
        <div className="grid gap-2">
          <div className="flex items-center gap-3">
            <VerdictStatus verdict={report.verdict} />
            {fixture && (
              <span className="rounded-md border border-border/50 bg-muted px-2 py-1 text-xs text-muted-foreground">
                Fixture data
              </span>
            )}
          </div>
          <h1 className="mt-2 max-w-3xl break-words text-3xl font-semibold uppercase tracking-[-0.04em] text-foreground md:text-5xl">
            {report.repo}
          </h1>
          <p className="font-mono text-xs text-muted-foreground">
            {report.pr_ref}
          </p>
        </div>
        {report.corpus && (
          <p className="text-sm font-medium text-muted-foreground">
            +{report.corpus.pinned_this_run} this run ·{" "}
            {report.corpus.corpus_total} total
          </p>
        )}
      </header>

      <section
        aria-labelledby="findings-heading"
        className="surface-frame"
      >
        <div className="flex items-center justify-between border-b border-border bg-secondary/70 px-5 py-4">
          <h2
            id="findings-heading"
            className="font-heading text-sm font-semibold uppercase tracking-[0.1em] text-foreground"
          >
            Executed findings
          </h2>
        </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead scope="col">
                  Claim
                </TableHead>
                <TableHead
                  className="hidden md:table-cell"
                  scope="col"
                >
                  Layer
                </TableHead>
                <TableHead scope="col">
                  Outcome
                </TableHead>
                <TableHead
                  className="hidden text-right sm:table-cell"
                  scope="col"
                >
                  Confidence
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {report.findings.map((finding, index) => {
                const claim = claimsById.get(finding.claim_id);
                const rowId = `${finding.claim_id}-${finding.layer}-${index}`;
                const expanded = selectedRowId === rowId;
                return (
                  <Fragment key={rowId}>
                    <TableRow>
                      <th className="p-0 font-normal" scope="row">
                        <button
                          aria-expanded={expanded}
                          className="w-full px-4 py-4 text-left"
                          onClick={() =>
                            setSelectedRowId(expanded ? null : rowId)
                          }
                          type="button"
                        >
                          <span className="block font-medium text-foreground">
                            {claim?.text ?? finding.claim_id}
                          </span>
                          <span className="mt-1 block font-mono text-xs text-muted-foreground md:hidden">
                            {finding.layer}
                          </span>
                          {claim?.kind && (
                            <span className="mt-1 block font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
                              {claim.kind.replace("_", " ")}
                            </span>
                          )}
                        </button>
                      </th>
                      <TableCell className="hidden font-mono text-xs text-muted-foreground md:table-cell">
                        {finding.layer}
                      </TableCell>
                      <TableCell
                        className={`text-xs font-semibold uppercase ${outcomeColor[finding.outcome]}`}
                      >
                        {finding.outcome}
                      </TableCell>
                      <TableCell className="hidden text-right font-mono text-xs text-muted-foreground sm:table-cell">
                        {Math.round(finding.confidence * 100)}%
                      </TableCell>
                    </TableRow>
                    {expanded && (
                      <TableRow className="hover:bg-transparent">
                        <TableCell className="p-0" colSpan={4}>
                          <FindingEvidence finding={finding} />
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                );
              })}
            </TableBody>
          </Table>
      </section>
    </main>
  );
}
