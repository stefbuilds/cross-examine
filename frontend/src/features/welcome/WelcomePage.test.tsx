import { act, cleanup, render, screen } from "@testing-library/react";
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

function motionPreference(initiallyReduced: boolean) {
  const changeListeners = new Set<(event: MediaQueryListEvent) => void>();
  const query = {
    matches: initiallyReduced,
    media: "(prefers-reduced-motion: reduce)",
    addEventListener: vi.fn((event: string, listener: (event: MediaQueryListEvent) => void) => {
      if (event === "change") changeListeners.add(listener);
    }),
    removeEventListener: vi.fn((event: string, listener: (event: MediaQueryListEvent) => void) => {
      if (event === "change") changeListeners.delete(listener);
    }),
  };
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: vi.fn().mockReturnValue(query),
  });

  return {
    change(matches: boolean) {
      query.matches = matches;
      for (const listener of changeListeners) listener({ matches } as MediaQueryListEvent);
    },
  };
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

  it("updates both sourced layers when the reduced-motion preference changes", async () => {
    const preference = motionPreference(false);
    const removeEventListener = vi.spyOn(window, "removeEventListener");

    render(
      <>
        <PixelHero primaryAction={<a href="/">Enter dashboard</a>} />
        <PaperDesignBackground parallax />
      </>,
    );

    act(() => {
      preference.change(true);
    });

    expect(document.querySelector("style")?.textContent).toContain("animation: none");
    expect(screen.getByRole("link", { name: "Enter dashboard" }).parentElement).toHaveStyle({ transitionDelay: "0ms" });
    expect(document.getElementById("paper-bg-parallax")).not.toHaveClass("transition-colors");
    expect(removeEventListener).toHaveBeenCalledWith("mousemove", expect.any(Function));
  });
});
