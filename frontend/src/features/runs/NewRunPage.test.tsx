import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";

import { NewRunPage } from "./NewRunPage";

describe("NewRunPage", () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("validates required inputs and starts a run", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn(async () =>
      new Response(JSON.stringify({ id: "run-created", status: "queued" }), {
        status: 202,
      }),
    );
    vi.stubGlobal("fetch", fetchMock);
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<NewRunPage />} />
          <Route path="/runs/:runId" element={<p>Run opened</p>} />
        </Routes>
      </MemoryRouter>,
    );

    await user.click(screen.getByRole("button", { name: "Cross-examine PR" }));
    expect(screen.getByText("Repository is required")).toBeInTheDocument();
    expect(screen.getByLabelText(/Repository URL or path/)).toHaveAttribute(
      "aria-invalid",
      "true",
    );

    await user.type(screen.getByLabelText(/Repository URL or path/), "C:\\repo");
    await user.type(screen.getByLabelText(/Base ref/), "main");
    await user.type(screen.getByLabelText(/Head ref/), "feature");
    await user.click(screen.getByRole("button", { name: "Cross-examine PR" }));

    expect(await screen.findByText("Run opened")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/runs",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("starts the explicitly labeled offline hero without model credentials", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn(async () =>
      new Response(JSON.stringify({ id: "hero-created", status: "queued" }), {
        status: 202,
      }),
    );
    vi.stubGlobal("fetch", fetchMock);
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<NewRunPage />} />
          <Route path="/runs/:runId" element={<p>Hero opened</p>} />
        </Routes>
      </MemoryRouter>,
    );

    await user.click(
      screen.getByRole("button", { name: "Run offline hero demo" }),
    );

    expect(await screen.findByText("Hero opened")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/hero-runs",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("renders the new verification run as a checkout-style summary", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<NewRunPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: "New verification run" })).toBeInTheDocument();
    expect(screen.getByText("Verification target")).toBeInTheDocument();
    expect(screen.getByText("Execution method")).toBeInTheDocument();
    expect(screen.getByText("Layer selection")).toBeInTheDocument();
    expect(screen.getByText("Run summary")).toBeInTheDocument();
    expect(screen.getByText("Ready")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Layer A" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Layer A + B" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cross-examine PR" })).toBeInTheDocument();
  });
});
