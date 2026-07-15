import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { PaperDesignBackground } from "@/components/ui/neon-dither";
import { PixelHero } from "@/components/ui/pixel-perfect-hero";

const originalMatchMedia = window.matchMedia;

function preferReducedMotion() {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: query === "(prefers-reduced-motion: reduce)",
      media: query,
      addEventListener() {},
      removeEventListener() {},
    })),
  });
}

describe("welcome source reduced-motion behavior", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    Object.defineProperty(window, "matchMedia", { configurable: true, value: originalMatchMedia });
  });

  it("disables the hero shimmer and CTA delay when reduced motion is preferred", () => {
    preferReducedMotion();

    render(
      <PixelHero
        primaryAction={<a href="/">Enter dashboard</a>}
        word1="Evidence,"
        word2="examined."
      />,
    );

    expect(document.querySelector("style")?.textContent).toContain("animation: none");
    const ctaFrame = screen.getByRole("link", { name: "Enter dashboard" }).parentElement;
    expect(ctaFrame).toHaveClass("motion-reduce:transition-none");
    expect(ctaFrame).toHaveStyle({ transitionDelay: "0ms" });
  });

  it("does not attach dither parallax or color transitions when reduced motion is preferred", () => {
    preferReducedMotion();
    const addEventListener = vi.spyOn(window, "addEventListener");

    render(<PaperDesignBackground parallax />);

    expect(addEventListener).not.toHaveBeenCalledWith("mousemove", expect.any(Function));
    expect(document.getElementById("paper-bg-parallax")).not.toHaveClass("transition-colors");
  });
});
