import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { FindingEvidence } from "./FindingEvidence";
import type { Finding } from "./report-model";

const finding: Finding = {
  claim_id: "preserve-empty",
  layer: "behavioral_diff",
  outcome: "refuted",
  command: "python -m pytest -q tests/test_normalize.py -k empty",
  output: "AssertionError: assert None == []",
  repro_input: "[]",
  expected: "[]",
  actual: "null",
  confidence: 1,
  receipts: [
    {
      command: "python -m pytest -q tests/test_normalize.py -k empty",
      output: "AssertionError: assert None == []",
      evidence_hash: "abc123",
    },
  ],
};

describe("FindingEvidence", () => {
  it("renders every grounded receipt field", async () => {
    render(<FindingEvidence finding={finding} />);

    await waitFor(() => {
      expect(
        screen.getByText("Exact command").closest("[data-language]"),
      ).toHaveTextContent("python -m pytest");
      expect(
        screen.getByText("Captured output").closest("[data-language]"),
      ).toHaveTextContent("AssertionError");
    });
    expect(screen.getByText("Reproducing input")).toBeInTheDocument();
    expect(screen.getByText("Expected")).toBeInTheDocument();
    expect(screen.getByText("Actual")).toBeInTheDocument();
    expect(screen.getByText("Evidence receipt hash")).toBeInTheDocument();
    expect(screen.getByText("abc123")).toBeInTheDocument();
  });
});
