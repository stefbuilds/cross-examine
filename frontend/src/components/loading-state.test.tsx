import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import LoadingState from "./loading-state";

afterEach(() => vi.useRealTimers());

describe("LoadingState", () => {
  it("shows the requested thinking pattern and a live elapsed timer", () => {
    vi.useFakeTimers();
    render(<LoadingState label="Thinking" variant="Dots" />);

    expect(screen.getByRole("status")).toHaveTextContent("Thinking0.0s");
    expect(screen.getByTestId("loading-state-grid").children).toHaveLength(9);
    expect(screen.getByTestId("loading-state-grid").firstElementChild).toHaveClass(
      "rounded-full",
    );

    act(() => vi.advanceTimersByTime(1_200));
    expect(screen.getByRole("status")).toHaveTextContent("Thinking1.2s");
  });

  it("falls back when the optional Surfer video cannot play", () => {
    render(<LoadingState variant="Surfer" videoSrc="/missing.mp4" />);
    const video = document.querySelector("video");
    expect(video).not.toBeNull();
    act(() => video?.dispatchEvent(new Event("error")));
    expect(screen.getByText("Video unavailable")).toBeInTheDocument();
  });
});

