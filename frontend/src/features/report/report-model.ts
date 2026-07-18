export type Verdict = "safe" | "risky" | "broken";
export type Outcome = "verified" | "refuted" | "unverifiable";
export type Layer = "behavioral_diff" | "adversarial";

export interface EvidenceReceipt {
  command: string;
  output: string;
  evidence_hash: string;
}

export interface Claim {
  id: string;
  text: string;
  target_symbol: string;
  risk: "high" | "med" | "low";
  proposed_check: string;
  preserve_critical: boolean;
  kind?: "preservation" | "intended_change";
}

export interface Finding {
  claim_id: string;
  layer: Layer;
  outcome: Outcome;
  command: string;
  output: string;
  repro_input: string | null;
  expected: string | null;
  actual: string | null;
  confidence: number;
  receipts?: EvidenceReceipt[];
}

export interface Report {
  repo: string;
  pr_ref: string;
  verdict: Verdict;
  findings: Finding[];
  claims: Claim[];
  corpus: { pinned_this_run: number; corpus_total: number } | null;
}
