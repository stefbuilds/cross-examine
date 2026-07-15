import { render, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

import { SessionNavBar } from "./session-nav-bar";

describe("SessionNavBar", () => {
  it("uses real routes and exposes the active route to assistive technology", () => {
    const { container } = render(
      <MemoryRouter>
        <SessionNavBar activeId="trials" />
      </MemoryRouter>,
    );

    const navigation = within(container);
    expect(navigation.getByRole("link", { name: "Evidence catch" })).toHaveAttribute("href", "/");
    expect(navigation.getByRole("link", { name: "Run locally" })).toHaveAttribute("href", "/run");
    expect(navigation.getByRole("link", { name: "Trials" })).toHaveAttribute("aria-current", "page");
    expect(navigation.getByRole("link", { name: "About" })).toHaveAttribute("href", "/about");
  });

  it("gives Run locally the larger sourced card treatment without changing its route", () => {
    const { container } = render(
      <MemoryRouter>
        <SessionNavBar />
      </MemoryRouter>,
    );

    const runLocally = within(container).getByRole("link", { name: "Run locally" });
    expect(runLocally).toHaveAttribute("href", "/run");
    expect(runLocally).toHaveClass("min-h-12", "rounded-2xl", "bg-card");
  });

  it("notifies the shell after a navigation choice so mobile can close", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    const { container } = render(
      <MemoryRouter>
        <SessionNavBar onSelect={onSelect} />
      </MemoryRouter>,
    );

    await user.click(within(container).getByRole("link", { name: "Trials" }));
    expect(onSelect).toHaveBeenCalledWith("trials");
  });

  it("keeps the sidebar toggle inside the sourced sidebar", async () => {
    const user = userEvent.setup();
    const onCollapsedChange = vi.fn();

    const { container } = render(
      <MemoryRouter>
        <SessionNavBar onCollapsedChange={onCollapsedChange} />
      </MemoryRouter>,
    );

    const sidebar = within(container);
    await user.click(sidebar.getByRole("button", { name: "Expand sidebar" }));

    expect(onCollapsedChange).toHaveBeenCalledWith(false);
    expect(sidebar.getByRole("button", { name: "Collapse sidebar" })).toBeInTheDocument();
  });
});
