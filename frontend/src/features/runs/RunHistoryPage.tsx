import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useLoaderData, useNavigate } from "react-router-dom";

import type { RunSummary } from "@/app/api";
import { Button } from "@/components/ui/button";
import EmptyState from "@/components/ui/empty-state-04";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { VerdictStatus } from "@/features/report/VerdictStatus";

const FILTER_STORAGE_KEY = "cross-examine-runs-filter";

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return iso;
  const seconds = Math.round((Date.now() - then) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 14) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

function RunState({ run }: { run: RunSummary }) {
  if (run.verdict) return <VerdictStatus verdict={run.verdict} />;
  if (run.status === "failed") {
    return (
      <span className="font-mono text-xs font-semibold uppercase text-destructive">
        Failed
      </span>
    );
  }
  if (run.status === "running") {
    return (
      <span className="font-mono text-xs font-semibold uppercase text-muted-foreground">
        Running · {run.stage.replace("_", " ")}
      </span>
    );
  }
  return (
    <span className="font-mono text-xs font-semibold uppercase text-muted-foreground">
      {run.status}
    </span>
  );
}

export function RunHistoryPage() {
  const runs = useLoaderData() as RunSummary[];
  const navigate = useNavigate();
  const [filter, setFilter] = useState(() => {
    if (typeof window === "undefined") return "";
    return window.sessionStorage.getItem(FILTER_STORAGE_KEY) ?? "";
  });

  const visibleRuns = useMemo(() => {
    const needle = filter.trim().toLowerCase();
    if (!needle) return runs;
    return runs.filter((run) =>
      [run.repo, run.base_ref, run.head_ref, run.status, run.stage, run.verdict ?? "", run.id]
        .join(" ")
        .toLowerCase()
        .includes(needle),
    );
  }, [runs, filter]);

  const updateFilter = (value: string) => {
    setFilter(value);
    window.sessionStorage.setItem(FILTER_STORAGE_KEY, value);
  };

  return (
    <main className="page-shell">
      <header className="page-header">
        <div>
          <p className="eyebrow">Restart-safe evidence</p>
          <h1 className="page-title mt-4">Run history</h1>
          <p className="page-copy mt-4">
            Reopen persisted reports and their exact execution receipts.
          </p>
        </div>
        <Button asChild>
          <Link to="/run">
            <Plus aria-hidden="true" />
            New verification
          </Link>
        </Button>
      </header>

      {runs.length > 0 && (
        <div className="max-w-sm">
          <Input
            aria-label="Filter runs"
            onChange={(event) => updateFilter(event.target.value)}
            placeholder="Filter by repository, ref, status, or verdict…"
            type="search"
            value={filter}
          />
        </div>
      )}

      <section className="surface-frame">
        {runs.length === 0 ? (
          <EmptyState />
        ) : visibleRuns.length === 0 ? (
          <div className="grid gap-3 px-6 py-12 text-center">
            <p className="text-sm font-medium text-foreground">No runs match “{filter.trim()}”.</p>
            <p className="text-sm text-muted-foreground">
              Try a repository name, a ref, a status such as running or failed, or a verdict.
            </p>
            <div>
              <Button onClick={() => updateFilter("")} size="sm" type="button" variant="outline">
                Clear filter
              </Button>
            </div>
          </div>
        ) : (
            <Table className="w-full">
              <TableHeader className="bg-secondary/70">
                <TableRow>
                  <TableHead>Repository</TableHead>
                  <TableHead className="hidden md:table-cell">Refs</TableHead>
                  <TableHead>State</TableHead>
                  <TableHead className="hidden sm:table-cell">Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleRuns.map((run) => (
                  <TableRow
                    className="cursor-pointer"
                    key={run.id}
                    onClick={() => navigate(`/runs/${run.id}`)}
                  >
                    <TableCell>
                      <div className="max-w-[40vw] sm:max-w-none">
                        <Link
                          className="block break-words font-medium text-foreground underline-offset-4 hover:underline"
                          onClick={(event) => event.stopPropagation()}
                          to={`/runs/${run.id}`}
                        >
                          {run.repo}
                        </Link>
                        <p className="mt-1 font-mono text-xs text-muted-foreground">
                          {run.id.slice(0, 12)}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden font-mono text-xs text-muted-foreground md:table-cell">
                      {run.base_ref} → {run.head_ref}
                    </TableCell>
                    <TableCell>
                      <RunState run={run} />
                    </TableCell>
                    <TableCell className="hidden text-xs text-muted-foreground sm:table-cell">
                      <time
                        dateTime={run.updated_at}
                        title={new Date(run.updated_at).toLocaleString()}
                      >
                        {relativeTime(run.updated_at)}
                      </time>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
        )}
      </section>
    </main>
  );
}
