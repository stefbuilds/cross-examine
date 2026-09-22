import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRightIcon,
  ArrowUpRightIcon,
  CaretRightIcon,
  CaretUpIcon,
  CheckCircleIcon,
  ClockIcon,
  CodeIcon,
  FolderIcon,
  XCircleIcon,
} from "@phosphor-icons/react/ssr";

import { cn } from "@/lib/utils";
import type { Finding, Verdict } from "@/features/report/report-model";

export function UimaxFindingCard({
  finding,
  claim,
  repo,
}: {
  finding: Finding;
  claim: string;
  repo: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const refuted = finding.outcome === "refuted";
  const verified = finding.outcome === "verified";

  return (
    <section
      className="stroke-lit w-full max-w-[591px] overflow-hidden rounded-xl bg-surface text-[13px] shadow-xl shadow-black/40"
      aria-label={`${finding.outcome} finding`}
    >
      <div className="flex min-h-12 items-center gap-2.5 border-b border-border px-5 py-2.5">
        <FolderIcon className="size-4 shrink-0 text-fg-muted" />
        <span className="min-w-0 truncate font-medium text-fg">{repo}</span>
        <ArrowRightIcon className="size-3.5 shrink-0 text-fg-muted" />
        <span className={cn("font-medium uppercase", refuted ? "text-code-del" : verified ? "text-code-add" : "text-fg-secondary")}>{finding.outcome}</span>
      </div>

      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        aria-expanded={expanded}
        className={cn(
          "m-2.5 flex min-h-[42px] w-[calc(100%-1.25rem)] items-center gap-3 rounded-lg border px-3 text-left interactive",
          expanded
            ? "border-select-line/70 bg-gradient-to-r from-select-bg to-select-bg-2"
            : "border-transparent hover:bg-white/[0.04]",
        )}
      >
        {expanded ? <CaretUpIcon className="size-4 shrink-0 text-code-accent" weight="bold" /> : <CaretRightIcon className="size-4 shrink-0 text-fg-muted" weight="bold" />}
        <h3 className="min-w-0 flex-1 truncate text-fg">{finding.outcome.toUpperCase()} · {claim}</h3>
        {refuted ? <XCircleIcon className="size-4 shrink-0 text-code-del" weight="fill" /> : verified ? <CheckCircleIcon className="size-4 shrink-0 text-code-add" weight="fill" /> : <CodeIcon className="size-4 shrink-0 text-fg-muted" />}
      </button>

      {expanded && (
        <div className="mx-2.5 mb-2.5 overflow-hidden rounded-lg bg-white/[0.02] font-mono text-xs leading-relaxed">
          {finding.expected !== null && (
            <div className="grid grid-cols-[7rem_minmax(0,1fr)] bg-negative-bg px-3 py-2">
              <span className="text-code-del-dim">Expected</span>
              <pre className="min-w-0 whitespace-pre-wrap break-words text-fg-secondary">{finding.expected}</pre>
            </div>
          )}
          {finding.actual !== null && (
            <div className="grid grid-cols-[7rem_minmax(0,1fr)] bg-positive-bg-strong px-3 py-2">
              <span className="text-code-add-dim">Actual</span>
              <pre className="min-w-0 whitespace-pre-wrap break-words text-fg">{finding.actual}</pre>
            </div>
          )}
          {finding.repro_input !== null && (
            <div className="grid grid-cols-[7rem_minmax(0,1fr)] border-t border-border px-3 py-2">
              <span className="text-fg-muted">Reproducing input</span>
              <pre className="min-w-0 whitespace-pre-wrap break-words text-code-string">{finding.repro_input}</pre>
            </div>
          )}
          <div className="grid grid-cols-[7rem_minmax(0,1fr)] border-t border-border px-3 py-2">
            <span className="text-fg-muted">Exact command</span>
            <pre className="min-w-0 whitespace-pre-wrap break-words text-fg-secondary">{finding.command}</pre>
          </div>
          <div className="grid grid-cols-[7rem_minmax(0,1fr)] border-t border-border px-3 py-2">
            <span className="text-fg-muted">Captured output</span>
            <pre className="min-w-0 whitespace-pre-wrap break-words text-fg-secondary">{finding.output}</pre>
          </div>
        </div>
      )}
    </section>
  );
}

export function UimaxRunActivityCard({
  runId,
  repo,
  source,
  status,
  stage,
  message,
  verdict,
}: {
  runId: string;
  repo?: string;
  source?: string;
  status?: string;
  stage?: string;
  message?: string;
  verdict?: Verdict | null;
}) {
  const finalState = verdict?.toUpperCase() ?? status ?? "running";
  return (
    <section className="hover-raise stroke-lit w-full max-w-sm rounded-[20px] bg-surface bg-gradient-to-bl from-white/[0.05] via-white/[0.02] to-transparent px-7 pb-8 pt-7 font-sans shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)]">
      <div className="row-hover -mx-2 flex items-center gap-3 rounded-lg px-2 py-1">
        <span className="flex size-5 shrink-0 items-center justify-center text-fg-muted"><CodeIcon className="size-4" /></span>
        <p className="min-w-0 flex-1 truncate text-[13px] font-medium text-fg">{runId}</p>
        <h3 className="shrink-0 text-[13px] font-medium text-fg">{finalState}</h3>
      </div>
      <div className="mt-7 space-y-5 text-[12.5px]">
        <div className="row-hover -mx-2 flex items-center gap-3 rounded-lg px-2 py-1">
          <ClockIcon className="size-5 shrink-0 text-fg-muted" />
          <p className="min-w-0 truncate"><span className="font-medium text-fg">{stage ?? "investigation"}</span>{" "}<span className="text-shimmer">{message ?? status ?? "Running verification"}</span></p>
        </div>
        <div className="row-hover -mx-2 flex items-center gap-3 rounded-lg px-2 py-1">
          <ArrowUpRightIcon className="size-5 shrink-0 text-fg-muted" />
          <p className="min-w-0 truncate"><span className="font-medium text-fg">{repo ?? "Cross-Examine"}</span>{" "}<span className="text-shimmer">{source ?? "saved evidence"}</span></p>
        </div>
      </div>
      <Link className="interactive mt-7 inline-flex items-center gap-2 text-xs text-fg-muted hover:text-fg" to={`/runs/${runId}`}>
        Open full report <ArrowUpRightIcon className="size-3" />
      </Link>
    </section>
  );
}
