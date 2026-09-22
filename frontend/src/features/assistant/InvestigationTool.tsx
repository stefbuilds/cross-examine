import type { ToolCallMessagePartComponent } from "@assistant-ui/react";
import { Link } from "react-router-dom";
import { ToolFallback } from "@/components/tool-fallback.aui";
import LoadingState from "@/components/loading-state";
import { Card } from "@/components/ui/card";
import { ErrorMessage } from "@/components/ui/error-message";
import type { Report } from "@/features/report/report-model";
import { UimaxFindingCard, UimaxRunActivityCard } from "./uimax-assistant-components";

interface ToolResult {
  run_id?: string;
  status?: string;
  stage?: string;
  message?: string;
  source?: string;
  error?: string;
  report?: Report | null;
  runs?: { id: string; repo: string; status: string; verdict: Report["verdict"] | null }[];
  corpus?: { repo: string; corpus_total: number; latest_growth: number }[];
}

export const InvestigationTool: ToolCallMessagePartComponent = (props) => {
  const result = props.result as ToolResult | undefined;
  if (!result && props.status?.type === "running") {
    return <LoadingState label="Running verification" variant="Drive" />;
  }
  if (!result) return <ToolFallback {...props} />;
  if (result.error) return <ErrorMessage title="Investigation could not complete" message={result.error} />;
  if (result.runs) return <div className="grid gap-3">
    {result.runs.length === 0 && <Card><Card.Description>No saved runs yet.</Card.Description></Card>}
    {result.runs.map((run) => (
      <UimaxRunActivityCard key={run.id} runId={run.id} repo={run.repo} status={run.status} verdict={run.verdict} />
    ))}
  </div>;
  if (result.corpus) return (
    <Card>
      <Card.Title>Pinned checks</Card.Title>
      {result.corpus.length === 0 && <Card.Description>No pinned checks yet.</Card.Description>}
      {result.corpus.map((item) => <Card.Description key={item.repo}>
        {item.repo}: {item.corpus_total} checks, +{item.latest_growth} last run
      </Card.Description>)}
      <Link className="text-sm underline" to="/corpus">Open corpus</Link>
    </Card>
  );
  if (!result.run_id) return <ToolFallback {...props} />;
  return <div className="grid min-w-0 gap-3" aria-label="Verification evidence">
    <UimaxRunActivityCard
      runId={result.run_id}
      repo={result.report?.repo}
      source={result.source}
      status={result.status}
      stage={result.stage}
      message={result.message}
      verdict={result.report?.verdict}
    />
    {result.status === "failed" && <ErrorMessage title="Run failed" message={result.message ?? "No report was produced"} />}
    {result.report?.findings.map((finding, index) => (
      <UimaxFindingCard
        key={`${finding.claim_id}-${index}`}
        finding={finding}
        claim={result.report?.claims.find((claim) => claim.id === finding.claim_id)?.text ?? finding.claim_id}
        repo={result.report?.repo ?? "repository"}
      />
    ))}
  </div>;
};
