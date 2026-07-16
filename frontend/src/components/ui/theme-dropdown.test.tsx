import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";

import { Theme } from "./theme-dropdown";

afterEach(() => {
  document.documentElement.classList.remove("dark");
});

describe("Theme", () => {
  it("starts light and applies the selected theme", async () => {
    const user = userEvent.setup();
    document.documentElement.classList.add("dark");

    render(<Theme showLabel themes={["light", "dark", "system"]} />);

    expect(document.documentElement).not.toHaveClass("dark");

    await user.click(screen.getByRole("button", { name: "Select theme" }));
    await user.click(screen.getByRole("menuitem", { name: "Dark" }));

    expect(document.documentElement).toHaveClass("dark");
  });
});
