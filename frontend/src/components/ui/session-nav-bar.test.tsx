import { fireEvent, render, within } from "@testing-library/react";
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

  it("renders product-use cards at the bottom and keeps their links in-app", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    const { container } = render(
      <MemoryRouter>
        <SessionNavBar onSelect={onSelect} />
      </MemoryRouter>,
    );

    const sidebar = within(container);
    fireEvent.click(sidebar.getByRole("button", { name: "Expand sidebar" }));

    expect(sidebar.getByText("How to use Cross-Examine")).toBeInTheDocument();
    expect(sidebar.getByRole("link", { name: "Open Run a local verification" })).toHaveAttribute("href", "/run");
    expect(sidebar.getByRole("link", { name: "Open Inspect the evidence" })).toHaveAttribute("href", "/fixtures/broken");

    await user.click(sidebar.getByRole("link", { name: "Open Run a local verification" }));
    expect(onSelect).toHaveBeenCalledWith("run");
  });

  it("keeps the navigation list scrollable while exposing the workspace profile shortcuts", () => {
    const { container } = render(
      <MemoryRouter>
        <SessionNavBar />
      </MemoryRouter>,
    );

    const sidebar = within(container);
    fireEvent.click(sidebar.getByRole("button", { name: "Expand sidebar" }));

    expect(sidebar.getByTestId("sidebar-navigation")).toHaveClass("min-h-0", "flex-1", "overflow-y-auto");
    expect(sidebar.getByRole("button", { name: "Workspace shortcuts" })).toBeInTheDocument();
    expect(sidebar.getByText("Settings")).toBeInTheDocument();
    expect(sidebar.getByRole("button", { name: "Select theme" })).toBeInTheDocument();
  });

  it("keeps the sidebar toggle inside the sourced sidebar", async () => {
    const onCollapsedChange = vi.fn();

    const { container } = render(
      <MemoryRouter>
        <SessionNavBar onCollapsedChange={onCollapsedChange} />
      </MemoryRouter>,
    );

    const sidebar = within(container);
    fireEvent.click(sidebar.getByRole("button", { name: "Expand sidebar" }));

    expect(onCollapsedChange).toHaveBeenCalledWith(false);
    expect(sidebar.getByRole("button", { name: "Collapse sidebar" })).toBeInTheDocument();
  });
});
