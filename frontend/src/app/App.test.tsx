import { cleanup, render, screen } from "@testing-library/react";
import axe from "axe-core";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import userEvent from "@testing-library/user-event";
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
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

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
    expect(screen.getByRole("button", { name: "Runs" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Corpus" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "About" })).not.toBeInTheDocument();
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

  it("renders the welcome hero outside the dashboard shell", async () => {
    const router = createMemoryRouter(appRoutes, { initialEntries: ["/welcome"] });

    render(<RouterProvider router={router} />);

    expect(await screen.findByRole("heading", { name: "Evidence, examined." })).toBeInTheDocument();
    expect(screen.queryByRole("navigation", { name: "Primary" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Enter dashboard" })).toHaveAttribute("href", "/");
  });

  it("renders the sourced verification-run empty state when no runs exist", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify([]), { status: 200 })),
    );
    const router = createMemoryRouter(appRoutes, { initialEntries: ["/runs"] });

    render(<RouterProvider router={router} />);

    expect(await screen.findByRole("heading", { name: "No verification runs yet" })).toBeInTheDocument();
    expect(
      screen.getByText("Create a run to capture exact commands, outputs, and grounded verdicts."),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "New verification run" })).toHaveAttribute("href", "/run");
    expect(document.querySelector('[class*="[--duration:12s]"]')).toBeInTheDocument();
  });

  it("shows the same empty-run state before opening the local verification flow", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify([]), { status: 200 })),
    );
    const router = createMemoryRouter(appRoutes, { initialEntries: ["/run"] });

    render(<RouterProvider router={router} />);

    expect(await screen.findByRole("heading", { name: "No verification runs yet" })).toBeInTheDocument();
    expect(await screen.findByRole("button", { name: "Start local verification" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "New verification run" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Start local verification" }));
    expect(await screen.findByRole("heading", { name: "New verification run" })).toBeInTheDocument();
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

  it("renders the sourced pinned-check empty state when the corpus is empty", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify([]), { status: 200 })),
    );
    const router = createMemoryRouter(appRoutes, { initialEntries: ["/corpus"] });

    render(<RouterProvider router={router} />);

    expect(await screen.findByRole("heading", { name: "Behavioral corpus" })).toBeInTheDocument();
    expect(screen.getByText("No pinned checks yet")).toHaveAttribute("data-slot", "empty-title");
    expect(
      screen.getByText("Run a verification to begin accumulating grounded behavioral checks."),
    ).toHaveAttribute("data-slot", "empty-description");
    expect(document.querySelector('[data-slot="empty"][data-corpus-empty]')).toBeInTheDocument();
  });

  it("routes evidence to root and submissions to /run without retaining an About route", async () => {
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
    expect(screen.queryByRole("link", { name: "Evidence catch" })).not.toBeInTheDocument();

    expect(
      appRoutes.find((route) => route.children)?.children?.some((route) => route.path === "about"),
    ).toBe(false);
  });
});
