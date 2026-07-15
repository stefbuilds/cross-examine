import { ArrowRight } from "lucide-react";
import { Link, useLoaderData } from "react-router-dom";

import type { FixtureResponse } from "@/app/api";
import { FindingEvidence } from "@/features/report/FindingEvidence";
import { VerdictStatus } from "@/features/report/VerdictStatus";

export function EvidenceLandingPage() {
  const payload = useLoaderData() as FixtureResponse;
  const finding = payload.report.findings.find(
    (candidate) => candidate.outcome === "refuted",
  );
  const claim = finding
    ? payload.report.claims.find((candidate) => candidate.id === finding.claim_id)
    : undefined;

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
    </main>
  );
}
