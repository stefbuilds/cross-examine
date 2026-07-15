import "@testing-library/jest-dom/vitest";
import { createElement } from "react";
import { vi } from "vitest";

vi.mock("@paper-design/shaders-react", () => ({
  Dithering: () => createElement("div", { "data-testid": "dithering-shader" }),
}));

class ResizeObserverStub implements ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

globalThis.ResizeObserver = ResizeObserverStub;

Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
  value: () => ({ clearRect() {}, fillRect() {}, fillStyle: "" }) as unknown as CanvasRenderingContext2D,
});

HTMLElement.prototype.animate = () =>
  ({ onfinish: null, playState: "finished" }) as unknown as Animation;

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: () => ({
    matches: false,
    media: "",
    onchange: null,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    dispatchEvent: () => false,
  }),
});
