import { Fragment, useMemo, useState } from "react";

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
    <main className="mx-auto grid w-full max-w-5xl gap-6 p-4 md:p-8">
      <header className="flex flex-col gap-4 border-b border-border/50 pb-6 md:flex-row md:items-end md:justify-between">
        <div className="grid gap-2">
          <div className="flex items-center gap-3">
            <VerdictStatus verdict={report.verdict} />
            {fixture && (
              <span className="rounded-md border border-border/50 bg-muted px-2 py-1 text-xs text-muted-foreground">
                Fixture data
              </span>
            )}
          </div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            {report.repo}
          </h2>
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
        className="overflow-hidden rounded-xl border border-border/50 bg-card shadow-sm"
      >
        <div className="border-b border-border/50 px-4 py-3">
          <h2
            id="findings-heading"
            className="text-sm font-semibold text-foreground"
          >
            Executed findings
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium" scope="col">
                  Claim
                </th>
                <th
                  className="hidden px-4 py-3 font-medium md:table-cell"
                  scope="col"
                >
                  Layer
                </th>
                <th className="px-4 py-3 font-medium" scope="col">
                  Outcome
                </th>
                <th
                  className="hidden px-4 py-3 text-right font-medium sm:table-cell"
                  scope="col"
                >
                  Confidence
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {report.findings.map((finding, index) => {
                const claim = claimsById.get(finding.claim_id);
                const rowId = `${finding.claim_id}-${finding.layer}-${index}`;
                const expanded = selectedRowId === rowId;
                return (
                  <Fragment key={rowId}>
                    <tr className="transition-colors hover:bg-muted/30">
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
                      <td className="hidden px-4 py-4 font-mono text-xs text-muted-foreground md:table-cell">
                        {finding.layer}
                      </td>
                      <td
                        className={`px-4 py-4 text-xs font-semibold uppercase ${outcomeColor[finding.outcome]}`}
                      >
                        {finding.outcome}
                      </td>
                      <td className="hidden px-4 py-4 text-right font-mono text-xs text-muted-foreground sm:table-cell">
                        {Math.round(finding.confidence * 100)}%
                      </td>
                    </tr>
                    {expanded && (
                      <tr>
                        <td colSpan={4}>
                          <FindingEvidence finding={finding} />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
