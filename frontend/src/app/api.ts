import type { Report } from "@/features/report/report-model";

export interface FixtureResponse {
  fixture: true;
  report: Report;
}

export interface RunResponse {
  id: string;
  repo: string;
  base_ref: string;
  head_ref: string;
  status: string;
  stage: string;
  message: string;
  report: Report | null;
}

export interface RunCreate {
  repo: string;
  base_ref: string;
  head_ref: string;
  layer_b: boolean;
}

export interface RunAccepted {
  id: string;
  status: string;
}

export interface RunSummary {
  id: string;
  repo: string;
  base_ref: string;
  head_ref: string;
  status: string;
  stage: string;
  message: string;
  created_at: string;
  updated_at: string;
  verdict: "safe" | "risky" | "broken" | null;
}

export interface CorpusSummary {
  repo: string;
  corpus_total: number;
  latest_growth: number;
  last_run_id: string;
  updated_at: string;
}

async function jsonResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let detail = `Request failed (${response.status})`;
    try {
      const body = (await response.json()) as { detail?: string };
      if (body.detail) detail = body.detail;
    } catch {
      // The status remains useful when an intermediary returns a non-JSON error.
    }
    throw new Error(detail);
  }
  return response.json() as Promise<T>;
}

async function getJson<T>(path: string): Promise<T> {
  return jsonResponse<T>(
    await fetch(path, { headers: { Accept: "application/json" } }),
  );
}

export interface HealthResponse {
  status: string;
  hosted: boolean;
}

export function loadHealth(): Promise<HealthResponse> {
  return getJson("/api/health");
}

export function loadBrokenFixture(): Promise<FixtureResponse> {
  return getJson("/api/fixtures/broken");
}

export function loadRun(runId: string): Promise<RunResponse> {
  return getJson(`/api/runs/${encodeURIComponent(runId)}`);
}

export const getRun = loadRun;

export async function createRun(input: RunCreate): Promise<RunAccepted> {
  return jsonResponse<RunAccepted>(
    await fetch("/api/runs", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    }),
  );
}

export async function createHeroRun(): Promise<RunAccepted> {
  return jsonResponse<RunAccepted>(
    await fetch("/api/hero-runs", {
      method: "POST",
      headers: { Accept: "application/json" },
    }),
  );
}

export function loadCorpus(): Promise<CorpusSummary[]> {
  return getJson("/api/corpus");
}

export function loadRuns(): Promise<RunSummary[]> {
  return getJson("/api/runs?limit=50");
}
