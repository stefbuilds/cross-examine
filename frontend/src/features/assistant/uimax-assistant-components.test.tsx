import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import { UimaxFindingCard, UimaxRunActivityCard } from "./uimax-assistant-components";

const finding = {
  claim_id: "preserve-empty",
  layer: "behavioral_diff" as const,
  outcome: "refuted" as const,
  command: "python -m pytest -q tests/test_normalize.py -k empty",
  output: "FAILED tests/test_normalize.py::test_empty\nAssertionError: assert None == []",
  repro_input: "[]",
  expected: "[]",
  actual: "None",
  confidence: 1,
};

describe("UImaxxing assistant evidence adapters", () => {
  it("reveals a finding's grounded receipt on demand", async () => {
    const user = userEvent.setup();
    render(
      <UimaxFindingCard
        finding={finding}
        claim="preserves empty-list normalization"
        repo="hero-repo"
      />,
    );

    const disclosure = screen.getByRole("button", { name: /refuted.*preserves empty-list/i });
    expect(disclosure).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText("Exact command", { exact: true })).not.toBeInTheDocument();

    await user.click(disclosure);

    expect(disclosure).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Expected", { exact: true })).toBeInTheDocument();
    expect(screen.getAllByText("[]", { exact: true })).toHaveLength(2);
    expect(screen.getByText("Actual", { exact: true })).toBeInTheDocument();
    expect(screen.getByText("None", { exact: true })).toBeInTheDocument();
    expect(screen.getByText(finding.command, { exact: true })).toBeInTheDocument();
    expect(screen.getByText(/FAILED tests\/test_normalize\.py::test_empty\s+AssertionError: assert None == \[\]/)).toBeInTheDocument();
  });

  it("renders run progress and links the saved investigation", () => {
    render(
      <MemoryRouter>
        <UimaxRunActivityCard
          runId="run-123"
          repo="hero-repo"
          source="local execution"
          status="complete"
          stage="render"
          message="Verification finished"
          verdict="broken"
        />
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: "BROKEN" })).toBeInTheDocument();
    expect(screen.getByText("run-123", { exact: true })).toBeInTheDocument();
    expect(screen.getByText("local execution", { exact: true })).toBeInTheDocument();
    expect(screen.getByText("Verification finished", { exact: true })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Open full report" })).toHaveAttribute("href", "/runs/run-123");
  });
});
