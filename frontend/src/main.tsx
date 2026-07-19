import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { configureBoneyard } from "boneyard-js/react";
import "./index.css";
import { App } from "./app/App";
import "./bones/registry";
import { initializeTheme } from "./lib/theme-preference";

initializeTheme();
configureBoneyard({
  animate: "shimmer",
  color: "#e9e8e6",
  darkColor: "#323232",
  darkShimmerColor: "#4b4b4b",
  select: "viewport",
  shimmerAngle: 105,
  shimmerColor: "#f8f7f4",
  speed: "1.6s",
  transition: 280,
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
