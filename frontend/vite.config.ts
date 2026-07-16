import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // FastAPI and the Vercel function both serve this packaged frontend bundle.
    outDir: path.resolve(__dirname, "../src/cross_examine/static"),
    emptyOutDir: true,
    // Native minifier output differs across operating systems. The committed
    // judge bundle favors byte-for-byte reproducibility over minified size.
    minify: false,
    cssMinify: false,
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
