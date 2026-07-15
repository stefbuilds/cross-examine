import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";

import { appRoutes } from "./App";

const fixtureResponse = {
  fixture: true,
  report: {
    repo: "cross-examine/hero-normalizer",
    pr_ref: "base..head",
    verdict: "broken",
    claims: [],
    findings: [],
    corpus: null,
  },
};

describe("application routes", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("loads the grounded fixture inside the sourced dashboard shell", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(JSON.stringify(fixtureResponse), { status: 200 }),
      ),
    );
    const router = createMemoryRouter(appRoutes, {
      initialEntries: ["/fixtures/broken"],
    });

    render(<RouterProvider router={router} />);

    expect(await screen.findByText("BROKEN")).toBeInTheDocument();
    expect(
      screen.getByRole("navigation", { name: "Primary" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Runs" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Corpus" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "About" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Collapse sidebar" }));
    expect(
      screen.getByRole("button", { name: "Expand sidebar" }),
    ).toBeInTheDocument();

    const accessibility = await axe.run(document.body, {
      rules: { "color-contrast": { enabled: false } },
    });
    expect(accessibility.violations).toEqual([]);
  });

  it("renders persisted run history from the Runs destination", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(
            JSON.stringify([
              {
                id: "run-history-1",
                repo: "owner/repo",
                base_ref: "main",
                head_ref: "candidate",
                status: "complete",
                stage: "complete",
                message: "Report ready",
                created_at: "2026-07-15T00:00:00Z",
                updated_at: "2026-07-15T00:01:00Z",
                verdict: "risky",
              },
            ]),
            { status: 200 },
          ),
      ),
    );
    const router = createMemoryRouter(appRoutes, { initialEntries: ["/runs"] });

    render(<RouterProvider router={router} />);

    expect(await screen.findByRole("heading", { name: "Run history" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "owner/repo" })).toHaveAttribute(
      "href",
      "/runs/run-history-1",
    );
    expect(screen.getByText("RISKY")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "New verification" })).toHaveAttribute(
      "href",
      "/",
    );
  });
});
