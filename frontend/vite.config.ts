import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
import { boneyardPlugin } from "boneyard-js/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    boneyardPlugin({
      breakpoints: [375, 768, 1280],
      framework: "react",
      out: "./src/bones",
      routes: ["/", "/fixtures/broken", "/run", "/runs", "/corpus", "/trials", "/settings"],
      wait: 900,
    }),
  ],
  build: {
    // FastAPI and the Vercel function both serve this packaged frontend bundle.
    outDir: path.resolve(__dirname, "../src/cross_examine/static"),
    emptyOutDir: true,
    rolldownOptions: {
      output: {
        entryFileNames: "assets/app.js",
        assetFileNames: ({ names }) =>
          names.some((name) => name.endsWith(".css"))
            ? "assets/app.css"
            : "assets/[name]-[hash][extname]",
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/api": "http://127.0.0.1:8765",
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    css: true,
    exclude: ["e2e/**", "**/node_modules/**", "**/dist/**"],
  },
});
