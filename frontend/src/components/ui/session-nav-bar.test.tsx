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
    expect(navigation.queryByRole("link", { name: "Evidence catch" })).not.toBeInTheDocument();
    expect(navigation.getByRole("link", { name: "Trials" })).toHaveAttribute("aria-current", "page");
    expect(navigation.getByRole("link", { name: "Runs" })).toHaveAttribute("href", "/runs");
    expect(navigation.queryByRole("link", { name: "About" })).not.toBeInTheDocument();
  });

  it("leads Runs to the default view while the disclosure reveals the specific pages", () => {
    const { container } = render(
      <MemoryRouter>
        <SessionNavBar />
      </MemoryRouter>,
    );

    const sidebar = within(container);
    fireEvent.click(sidebar.getByRole("button", { name: "Expand sidebar" }));

    expect(sidebar.getByRole("link", { name: "Runs" })).toHaveAttribute("href", "/runs");

    fireEvent.click(sidebar.getByRole("button", { name: "Expand runs" }));

    expect(sidebar.getByRole("link", { name: "View runs" })).toHaveAttribute("href", "/runs");
    expect(sidebar.getByRole("link", { name: "Run locally" })).toHaveAttribute("href", "/run");
  });

  it("surfaces a prominent New Run action directly below the header", () => {
    const onSelect = vi.fn();
    const { container } = render(
      <MemoryRouter>
        <SessionNavBar onSelect={onSelect} />
      </MemoryRouter>,
    );

    const newRun = within(container).getByRole("link", { name: "New Run" });
    expect(newRun).toHaveAttribute("href", "/run");
    fireEvent.click(newRun);
    expect(onSelect).toHaveBeenCalledWith("run");
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

  it("renders a single onboarding banner with one primary action that dismisses", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    window.localStorage.removeItem("cross-examine-help-dismissed");

    const { container } = render(
      <MemoryRouter>
        <SessionNavBar onSelect={onSelect} />
      </MemoryRouter>,
    );

    const sidebar = within(container);
    fireEvent.click(sidebar.getByRole("button", { name: "Expand sidebar" }));

    expect(sidebar.getByText("How to use Cross-Examine")).toBeInTheDocument();
    const start = sidebar.getByRole("link", { name: "Start a verification" });
    expect(start).toHaveAttribute("href", "/run");

    fireEvent.click(start);
    expect(onSelect).toHaveBeenCalledWith("run");

    await user.click(sidebar.getByRole("button", { name: "Dismiss help" }));
    expect(sidebar.queryByText("How to use Cross-Examine")).not.toBeInTheDocument();
  });

  it("keeps the navigation list scrollable and anchors one Settings destination with appearance controls", () => {
    window.localStorage.removeItem("cross-examine-help-dismissed");
    const { container } = render(
      <MemoryRouter>
        <SessionNavBar />
      </MemoryRouter>,
    );

    const sidebar = within(container);
    fireEvent.click(sidebar.getByRole("button", { name: "Expand sidebar" }));

    expect(sidebar.getByTestId("sidebar-navigation")).toHaveClass("min-h-0", "flex-1", "overflow-y-auto");
    expect(sidebar.getByText("Local workspace")).toBeInTheDocument();
    expect(sidebar.getAllByRole("link", { name: "Settings" })).toHaveLength(1);
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
