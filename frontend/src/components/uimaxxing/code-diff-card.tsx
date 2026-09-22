/*!
 * UImaxxing™ — © 2026 Yogi Suria. All rights reserved.
 * Free to use, modify and ship in your own products, commercial ones
 * included. Not for republication as a component library, and not as
 * machine-learning training data. See LICENSE.
 * @author Yogi Suria <yogi@jumper.xyz>
 * @license SEE LICENSE IN LICENSE
 * @preserve
 * provenance-mark: uim1-1ea983e5.c49ab643
 */
"use client";

import { useState } from "react";
import {
  ArrowRightIcon,
  ArrowsOutSimpleIcon,
  CaretRightIcon,
  CaretUpIcon,
  FolderIcon,
  XIcon,
} from "@phosphor-icons/react/ssr";
import { cn } from "@/lib/utils";

const collapsedFiles = [
  { dir: "src/engine/", name: "queue.ts", added: "+7", removed: "−2" },
  { dir: "app/routes/", name: "runs.tsx", added: "+42", removed: "−11" },
  { dir: "lib/format/", name: "duration.ts", added: "+3", removed: "−3" },
];

function DiffCounts({
  added,
  removed,
  className,
}: {
  added: string;
  removed: string;
  className?: string;
}) {
  return (
    <span
      className={cn("flex items-center gap-2.5 font-medium", className)}
    >
      <span className="text-code-add">{added}</span>
      <span className="text-code-del">{removed}</span>
    </span>
  );
}

export function CodeDiffCard() {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="stroke-lit w-full max-w-[591px] overflow-hidden rounded-xl bg-surface text-[13px] shadow-xl shadow-black/40">
      {/* Header */}
      <div className="flex h-12 items-center gap-2.5 border-b border-border px-5">
        <FolderIcon className="size-4 text-fg-muted" />
        <span className="font-medium text-fg">main</span>
        <ArrowRightIcon
          className="size-3.5 text-fg-muted"
        />
        <span className="text-fg-secondary">working tree</span>
        <div className="ml-auto flex items-center gap-2 text-fg-muted">
          <button
            type="button"
            aria-label="Expand"
            className="rounded-md p-1 interactive hover:bg-white/[0.05] hover:text-fg-secondary"
          >
            <ArrowsOutSimpleIcon className="size-3.5" />
          </button>
          <button
            type="button"
            aria-label="Close"
            className="rounded-md p-1 interactive hover:bg-white/[0.05] hover:text-fg-secondary"
          >
            <XIcon className="size-4" />
          </button>
        </div>
      </div>

      {/* Sub-note */}
      <p className="border-b border-border px-5 py-3.5 text-[12px] text-fg-muted">
        Files are collapsed for large diffs. Select a file to expand it.
      </p>

      {/* File list */}
      <div className="p-2.5">
        {/* Expanded file */}
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className={cn(
            "flex h-[38px] w-full items-center gap-3 rounded-lg border px-3 text-left interactive",
            expanded
              ? "border-select-line/70 bg-gradient-to-r from-select-bg to-select-bg-2"
              : "border-transparent hover:bg-white/[0.04]",
          )}
        >
          {expanded ? (
            <CaretUpIcon
              className="size-4 shrink-0 text-code-accent"
      weight="bold"/>
          ) : (
            <CaretRightIcon
              className="size-4 shrink-0 text-fg-muted"
      weight="bold"/>
          )}
          <span className="truncate text-fg">
            src/engine/<span className="font-medium">scheduler.ts</span>
          </span>
          <DiffCounts added="+18" removed="−4" className="ml-auto" />
        </button>

        {/* Diff block */}
        {expanded ? (
          <div className="mb-1 mt-1.5 overflow-hidden rounded-lg bg-white/[0.02] py-2.5 leading-none">
            {/* 214 — context */}
            <div className="flex h-[25px] items-center">
              <span className="w-[53px] shrink-0 pl-4 text-fg-muted">
                214
              </span>
              <span className="w-[15px] shrink-0" />
              <span className="truncate pr-4 text-fg-secondary">
                <span className="text-code-keyword">const</span> plan ={" "}
                <span className="text-code-fn">resolveWindow</span>(job,
                now);
              </span>
            </div>
            {/* 215 — context comment */}
            <div className="flex h-[25px] items-center">
              <span className="w-[53px] shrink-0 pl-4 text-fg-muted">
                215
              </span>
              <span className="w-[15px] shrink-0" />
              <span className="truncate pr-4 italic text-fg-muted">
                {"// jitter the retry so bursts never realign"}
              </span>
            </div>
            {/* 216 — removed */}
            <div className="flex h-[25px] items-center bg-negative-bg">
              <span className="w-[53px] shrink-0 pl-4 text-code-del-dim">
                216
              </span>
              <span className="w-[15px] shrink-0 text-code-del-dim">-</span>
              <span className="truncate pr-4 text-fg-secondary">
                <span className="text-code-keyword">await</span> queue.
                <span className="text-code-fn">push</span>
                {"(job, { delay: "}
                <span className="rounded-[4px] bg-negative-mark px-[5px] py-px text-code-string">
                  0
                </span>
                {" });"}
              </span>
            </div>
            {/* 216 — added */}
            <div className="flex h-[25px] items-center bg-positive-bg-strong">
              <span className="w-[53px] shrink-0 pl-4 text-code-add-dim">
                216
              </span>
              <span className="w-[15px] shrink-0 text-code-add">+</span>
              <span className="truncate pr-4 text-fg-secondary">
                <span className="text-code-keyword">await</span> queue.
                <span className="text-code-fn">push</span>
                {"(job, { delay: "}
                <span className="rounded-[4px] bg-positive-mark px-[5px] py-px text-fg">
                  <span className="text-code-fn">backoff</span>
                  {"(job.attempt) })"}
                </span>
                <span className="text-code-add-dim">;</span>
              </span>
            </div>
            {/* 217 — context */}
            <div className="flex h-[25px] items-center">
              <span className="w-[53px] shrink-0 pl-4 text-fg-muted">
                217
              </span>
              <span className="w-[15px] shrink-0" />
              <span className="truncate pr-4 text-fg-secondary">
                log.<span className="text-code-fn">info</span>(
                <span className="text-code-string">&quot;scheduled&quot;</span>
                {", { id: plan.id });"}
              </span>
            </div>
          </div>
        ) : null}

        {/* Collapsed files */}
        {collapsedFiles.map((file) => (
          <button
            key={file.name}
            type="button"
            className="flex h-10 w-full items-center gap-3 rounded-lg px-3 text-left interactive hover:bg-white/[0.03]"
          >
            <CaretRightIcon
              className="size-4 shrink-0 text-fg-muted"
      weight="bold"/>
            <span className="truncate text-fg-secondary">
              {file.dir}
              <span className="font-medium text-fg">{file.name}</span>
            </span>
            <DiffCounts
              added={file.added}
              removed={file.removed}
              className="ml-auto"
            />
          </button>
        ))}
      </div>
    </div>
  );
}


