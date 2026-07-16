// Provenance: derived from docs/trials.md's Results table. Regenerate by
// parsing every table row; never hand-edit values to improve presentation.
import fixture from "./trials.fixture.json";

export type TrialVerdict = "SAFE" | "RISKY" | "BROKEN";

export type Trial = {
  repository: string;
  repositoryUrl: string;
  change: string;
  baseRef: string;
  headRef: string;
  setup: string;
  layerA: { summary: string; verdict: TrialVerdict };
  layerAB: { summary: string; verdict: TrialVerdict };
  limitation: string;
};

export const trials = fixture as Trial[];
