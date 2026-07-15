import { render, screen } from "@testing-library/react";
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
    claims: [
      {
        id: "preserve-empty",
        text: "preserves empty-list normalization",
        target_symbol: "normalizer:normalize",
        risk: "high",
        proposed_check: "deterministic hero fixture",
        preserve_critical: true,
        kind: "preservation",
      },
    ],
    findings: [
      {
        claim_id: "preserve-empty",
        layer: "behavioral_diff",
        outcome: "refuted",
        command: "python -m cross_examine.probe_runner",
        output: "base=[] head=null",
        repro_input: "[]",
        expected: "[]",
        actual: "null",
        confidence: 1,
      },
    ],
    corpus: null,
  },
};

describe("application routes", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("loads the grounded fixture inside the sourced dashboard shell", async () => {
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
    expect(screen.queryByText("Independent verification harness")).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Created By Deerflow" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Expand sidebar" })).toBeInTheDocument();

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

  it("loads the documented trials page from primary navigation", async () => {
    const router = createMemoryRouter(appRoutes, { initialEntries: ["/trials"] });

    render(<RouterProvider router={router} />);

    expect(
      await screen.findByRole("heading", {
        name: "Real-world compatibility trials",
      }),
    ).toBeInTheDocument();
    for (const link of screen.getAllByRole("link", { name: "Trials" })) {
      expect(link).toHaveAttribute("href", "/trials");
    }
    expect(
      screen
        .getAllByRole("link", { name: "Trials" })
        .some((link) => link.getAttribute("aria-current") === "page"),
    ).toBe(true);
  });

  it("routes evidence to root, submissions to /run, and method to /about", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify(fixtureResponse), { status: 200 })),
    );
    const router = createMemoryRouter(appRoutes, { initialEntries: ["/"] });

    render(<RouterProvider router={router} />);

    expect(await screen.findByRole("heading", { name: "The catch is the product." })).toBeInTheDocument();
    expect(screen.getByText("Exact command")).toBeInTheDocument();
    for (const link of screen.getAllByRole("link", { name: "Run locally" })) {
      expect(link).toHaveAttribute("href", "/run");
    }
    expect(
      screen
        .getAllByRole("link", { name: "Run locally" })
        .some((link) => link.classList.contains("min-w-56") && link.classList.contains("rounded-2xl")),
    ).toBe(true);
    for (const link of screen.getAllByRole("link", { name: "Evidence catch" })) {
      expect(link).toHaveAttribute("href", "/");
    }

    await router.navigate("/run");
    expect(await screen.findByText("Hosted evidence explorer only")).toBeInTheDocument();

    await router.navigate("/about");
    expect(await screen.findByRole("heading", { name: "How it works" })).toBeInTheDocument();
  });
});
