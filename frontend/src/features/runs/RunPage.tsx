import { useLoaderData } from "react-router-dom";
import { AlertTriangle } from "lucide-react";

import type { FixtureResponse, RunResponse } from "@/app/api";
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

  return (
    <main className="mx-auto grid w-full max-w-5xl gap-7 p-4 md:p-8">
      <header className="border-b border-border/50 pb-6">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Live verification · {run.id}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          {failed ? "Verification stopped" : "Cross-examination in progress"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          No verdict appears until executed findings have been aggregated.
        </p>
      </header>

      {failed && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"
        >
          <AlertTriangle
            aria-hidden="true"
            className="mt-0.5 size-4 shrink-0"
          />
          <div>
            <p className="font-semibold">
              The worker could not finish this run.
            </p>
            <p className="mt-1 break-words font-mono text-xs">{run.message}</p>
          </div>
        </div>
      )}

      <section className="rounded-xl border border-border/50 bg-card p-5 shadow-sm md:p-7">
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
