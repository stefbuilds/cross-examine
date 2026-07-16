import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TrialsPage } from "./TrialsPage";

describe("TrialsPage", () => {
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
