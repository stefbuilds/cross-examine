import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { TrialsPage } from "./TrialsPage";

describe("TrialsPage", () => {
  afterEach(cleanup);

  it("labels the rows as historical manual, unblinded shadow evidence", () => {
    render(<TrialsPage />);

    expect(
      screen.getByText("Historical manual trials · unblinded shadow evidence"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /not qualification evidence or proof of model-authored characterization/i,
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText("Product evidence")).not.toBeInTheDocument();
    expect(screen.queryByText(/These are real runs/i)).not.toBeInTheDocument();
  });

  it("frames RISKY trials as correct abstention and shows lessons", () => {
    render(<TrialsPage />);

    expect(
      screen.getByRole("heading", { name: "Real-world compatibility trials" }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("RISKY")).toHaveLength(5);
    expect(
      screen.getByText(/abstained rather than claiming safety/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "What the trials taught us" }),
    ).toBeInTheDocument();
    expect(screen.getAllByText(/Windows cp1252/i)).toHaveLength(2);
    expect(
      screen.getByRole("heading", {
        name: "Missing optional dependencies are not a broken PR",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(/rename denial/i)).toBeInTheDocument();
  });
});
