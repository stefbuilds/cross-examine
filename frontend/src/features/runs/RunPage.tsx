import { useLoaderData } from "react-router-dom";
import { Skeleton as BoneyardSkeleton } from "boneyard-js/react";

import type { FixtureResponse, RunResponse } from "@/app/api";
import { Card } from "@/components/ui/card";
import { ErrorMessage } from "@/components/ui/error-message";
import { GradientShimmer } from "@/components/ui/gradient-shimmer";
import { LoaderDotMatrix } from "@/components/ui/loader-dot-matrix";
import { ProgressiveFluxLoader } from "@/components/ui/progressive-flux-loader";
import { ReportLoadingSkeleton } from "@/components/ui/report-loading-skeleton";
import { VerificationMethodDialog } from "@/components/ui/verification-method-dialog";
import {
  Timeline,
  TimelineContent,
  TimelineDot,
  TimelineHeading,
  TimelineItem,
  TimelineLine,
} from "@/components/ui/timeline";
import { ReportPage } from "@/features/report/ReportPage";

import { useRunEvents, type RunEvent } from "./useRunEvents";

const STAGES = [
  ["ingesting", "Ingest", "Resolve revisions and inspect the Python diff"],
  [
    "characterizing",
    "Characterize",
    "Derive schema-constrained behavioral claims",
  ],
  [
    "capturing",
    "Capture base",
    "Execute deterministic probes against the base",
  ],
  ["layer_a", "Layer A replay", "Compare captured behavior with the head"],
  ["layer_b", "Layer B hunt", "Generate and shrink adversarial inputs"],
  [
    "testing",
    "Repository tests",
    "Execute conservatively discovered tests against the head",
  ],
  [
    "aggregating",
    "Aggregate",
    "Apply the pure verdict function and pin evidence",
  ],
] as const;

function stageIndex(stage: string) {
  if (stage === "complete") return STAGES.length;
  return STAGES.findIndex(([id]) => id === stage);
}

const PROGRESS_BY_STAGE: Record<string, number> = {
  queued: 3,
  ingesting: 10,
  characterizing: 24,
  capturing: 39,
  layer_a: 54,
  layer_b: 68,
  testing: 82,
  aggregating: 94,
  complete: 100,
};

const PROGRESS_PHASES = [
  { at: 0, label: "Preparing the examination" },
  { at: 10, label: "Reading the changed Python surface" },
  { at: 24, label: "Characterizing behavioral claims" },
  { at: 39, label: "Capturing the base behavior" },
  { at: 54, label: "Replaying evidence against the head" },
  { at: 68, label: "Hunting adversarial boundaries" },
  { at: 82, label: "Executing repository tests" },
  { at: 94, label: "Aggregating the grounded verdict" },
  { at: 100, label: "Report ready" },
];

export function FixtureRunPage() {
  const payload = useLoaderData() as FixtureResponse;
  return <ReportPage fixture={payload.fixture} report={payload.report} />;
}

export function RunProgressView({
  run,
  events,
}: {
  run: RunResponse;
  events: RunEvent[];
}) {
  const currentIndex = stageIndex(run.stage);
  const failed = run.status === "failed" || run.stage === "failed";
  const latestByStage = new Map(events.map((event) => [event.stage, event]));
  const progress = failed ? Math.max(PROGRESS_BY_STAGE[run.stage] ?? 0, 4) : (PROGRESS_BY_STAGE[run.stage] ?? 4);

  return (
    <main className="page-shell">
      <header className="page-header">
        <div>
        <p className="eyebrow">
          Live verification · {run.id}
        </p>
        <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-[-0.04em] md:text-6xl">
          {failed ? "Verification stopped" : <GradientShimmer>Cross-examination in progress</GradientShimmer>}
        </h1>
        <p className="page-copy mt-4">
          No verdict appears until executed findings have been aggregated.
        </p>
        </div>
        <VerificationMethodDialog />
      </header>

      {failed && (
        <ErrorMessage message={run.message} title="The worker could not finish this run" />
      )}

      <section className="grid gap-5 xl:grid-cols-[minmax(0,.72fr)_minmax(24rem,1.28fr)]">
      <Card className="gap-6 p-6 md:p-8">
        <ProgressiveFluxLoader phases={PROGRESS_PHASES} value={progress} />
        <div className="flex items-center gap-3 rounded-[var(--radius)] border bg-secondary/40 px-4 py-3 text-sm text-muted-foreground">
          <LoaderDotMatrix cols={6} dotSize={2.5} label={run.message} pattern="ripple" />
          <GradientShimmer className="font-medium" gradient="bubble">{run.message}</GradientShimmer>
        </div>
        <Timeline>
          {STAGES.map(([id, label, description], index) => {
            const isDone = currentIndex > index;
            const isCurrent = currentIndex === index;
            const status =
              failed && isCurrent
                ? "error"
                : isDone
                  ? "done"
                  : isCurrent
                    ? "current"
                    : "default";
            const stageEvent = latestByStage.get(id);
            return (
              <TimelineItem key={id} status={isDone ? "done" : "default"}>
                <TimelineHeading>{label}</TimelineHeading>
                <TimelineDot
                  aria-label={`${label}: ${status}`}
                  status={status}
                />
                <TimelineContent>
                  {isCurrent
                    ? run.message
                    : (stageEvent?.message ?? description)}
                </TimelineContent>
                {index < STAGES.length - 1 && <TimelineLine done={isDone} />}
              </TimelineItem>
            );
          })}
        </Timeline>
      </Card>
      <BoneyardSkeleton
        animate="shimmer"
        className="min-w-0"
        fallback={<ReportLoadingSkeleton />}
        loading
        name="verification-report"
        select="viewport"
      >
        <ReportLoadingSkeleton />
      </BoneyardSkeleton>
      </section>
    </main>
  );
}

export function RunPage() {
  const initialRun = useLoaderData() as RunResponse;
  const { run, events } = useRunEvents(initialRun);
  if (run.report) return <ReportPage report={run.report} />;
  return <RunProgressView events={events} run={run} />;
}
