import { render, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import { News } from "./sidebar-news";

describe("News", () => {
  it("reserves room for the hover-revealed action so it cannot overlap the profile below", () => {
    const { container } = render(
      <MemoryRouter>
        <News
          articles={[
            { href: "/run", title: "Run", summary: "Start a local verification." },
            { href: "/runs", title: "Runs", summary: "Review captured evidence." },
          ]}
        />
      </MemoryRouter>,
    );

    const section = within(container).getByRole("region", { name: "How to use Cross-Examine" });
    expect(section.querySelector("div.relative")).toHaveClass("h-60");
    expect(section.querySelector("div.absolute")).toHaveClass("flex", "flex-col", "justify-end");
  });
});
