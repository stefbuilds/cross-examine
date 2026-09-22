import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import type { RunResponse } from "@/app/api";
import type { RunEvent } from "./useRunEvents";
import { RunProgressView } from "./RunPage";

const running: RunResponse = {
  id: "run-1",
  repo: "C:\\code\\project",
  base_ref: "main",
  head_ref: "feature/candidate",
  status: "running",
  stage: "characterizing",
  message: "Deriving claims",
  report: null,
};

const events: RunEvent[] = [
  { run_id: "run-1", stage: "ingesting", message: "Cloning", elapsed_seconds: 0.1 },
  {
    run_id: "run-1",
    stage: "characterizing",
    message: "Deriving claims",
    elapsed_seconds: 0.2,
  },
];

describe("RunProgressView", () => {
  it("shows stage progress without speculating about a verdict", () => {
    render(
      <MemoryRouter>
        <RunProgressView events={events} run={running} />
      </MemoryRouter>,
    );

    expect(screen.getByText("Ingest")).toBeInTheDocument();
    expect(screen.getByText("Characterize")).toBeInTheDocument();
    expect(screen.getByText("Repository tests")).toBeInTheDocument();
    expect(screen.getByLabelText("Deriving claims")).toBeInTheDocument();
    expect(screen.getByRole("progressbar", { name: "Verification progress" })).toHaveAttribute("aria-valuenow", "24");
    expect(screen.getByLabelText("Preparing report")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "See how the run works" })).toBeInTheDocument();
    expect(screen.getByText("main → feature/candidate")).toBeInTheDocument();
    expect(screen.queryByText(/^(SAFE|RISKY|BROKEN)$/)).not.toBeInTheDocument();
  });

  it("surfaces a persisted worker failure with recovery actions, not a verdict", () => {
    render(
      <MemoryRouter>
        <RunProgressView
          events={[]}
          run={{
            ...running,
            status: "failed",
            stage: "failed",
            message: "OpenAIError: missing API key",
          }}
        />
      </MemoryRouter>,
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "OpenAIError: missing API key",
    );
    const retry = screen.getByRole("link", { name: "Retry with the same inputs" });
    expect(retry.getAttribute("href")).toContain("/run?repo=");
    expect(retry.getAttribute("href")).toContain("base=main");
    expect(screen.getByRole("link", { name: "View run history" })).toHaveAttribute("href", "/runs");
    expect(screen.queryByText(/^(SAFE|RISKY|BROKEN)$/)).not.toBeInTheDocument();
  });
});
