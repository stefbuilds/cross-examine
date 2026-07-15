import { useLoaderData } from "react-router-dom";

import type { FixtureResponse, RunResponse } from "@/app/api";
import { Card } from "@/components/ui/card";
import { ErrorMessage } from "@/components/ui/error-message";
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
    <main className="page-shell">
      <header className="page-header">
        <div>
        <p className="eyebrow">
          Live verification · {run.id}
        </p>
        <h1 className="mt-4 max-w-3xl text-4xl font-semibold uppercase tracking-[-0.04em] md:text-6xl">
          {failed ? "Verification stopped" : "Cross-examination in progress"}
        </h1>
        <p className="page-copy mt-4">
          No verdict appears until executed findings have been aggregated.
        </p>
        </div>
      </header>

      {failed && (
        <ErrorMessage message={run.message} title="The worker could not finish this run" />
      )}

      <Card className="p-6 md:p-8">
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
    </main>
  );
}

export function RunPage() {
  const initialRun = useLoaderData() as RunResponse;
  const { run, events } = useRunEvents(initialRun);
  if (run.report) return <ReportPage report={run.report} />;
  return <RunProgressView events={events} run={run} />;
}
