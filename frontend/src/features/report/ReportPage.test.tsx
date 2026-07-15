import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { ReportPage, type Report } from "./ReportPage";

const brokenReport: Report = {
  repo: "cross-examine/hero-normalizer",
  pr_ref: "base..head",
  verdict: "broken",
  claims: [
    {
      id: "preserve-empty",
      text: "preserves empty-list normalization",
      target_symbol: "normalizer.core:normalize",
      risk: "high",
      proposed_check: "Call normalize with an empty list",
      preserve_critical: true,
    },
  ],
  findings: [
    {
      claim_id: "preserve-empty",
      layer: "behavioral_diff",
      outcome: "refuted",
      command: "python -m pytest -q tests/test_normalize.py -k empty",
      output: "AssertionError: assert None == []",
      repro_input: "[]",
      expected: "[]",
      actual: "None",
      confidence: 1,
    },
  ],
  corpus: { pinned_this_run: 6, corpus_total: 47 },
};

describe("ReportPage", () => {
  it("reveals grounded evidence for a refuted finding", async () => {
    const user = userEvent.setup();
    render(<ReportPage report={brokenReport} fixture />);

    expect(screen.getByText("BROKEN")).toBeInTheDocument();
    expect(screen.getByText("Fixture data")).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", {
        name: /preserves empty-list normalization/i,
      }),
    );

    await waitFor(() => {
      expect(
        screen.getByText("Exact command").closest("[data-language]"),
      ).toHaveTextContent(
        "python -m pytest -q tests/test_normalize.py -k empty",
      );
      expect(
        screen.getByText("Captured output").closest("[data-language]"),
      ).toHaveTextContent("AssertionError: assert None == []");
    });
    expect(screen.getByText("+6 this run · 47 total")).toBeInTheDocument();
  });
});
