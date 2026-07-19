import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";

import { defineConfig, devices } from "@playwright/test";

const workspaceEnvironmentKey = "CROSS_EXAMINE_INTERNAL_PLAYWRIGHT_WORKSPACE";
const workspacePrefix = "cross-examine-playwright-";
const inheritedWorkspace = process.env[workspaceEnvironmentKey];
const resolvedTempRoot = resolve(tmpdir());
const canReuseInheritedWorkspace =
  inheritedWorkspace !== undefined &&
  dirname(resolve(inheritedWorkspace)) === resolvedTempRoot &&
  basename(resolve(inheritedWorkspace)).startsWith(workspacePrefix);
const playwrightWorkspace = canReuseInheritedWorkspace
  ? resolve(inheritedWorkspace)
  : mkdtempSync(join(resolvedTempRoot, workspacePrefix));

process.env[workspaceEnvironmentKey] = playwrightWorkspace;
if (!canReuseInheritedWorkspace) {
  process.once("exit", () => {
    rmSync(playwrightWorkspace, { force: true, recursive: true });
  });
}

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  retries: 0,
  reporter: "line",
  expect: {
    timeout: 30_000,
  },
  use: {
    ...devices["Desktop Chrome"],
    baseURL: "http://127.0.0.1:8765",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "uv run cross-examine serve --no-open",
    cwd: "..",
    env: {
      CROSS_EXAMINE_DB: join(playwrightWorkspace, "cross-examine.db"),
      CROSS_EXAMINE_RUNS: join(playwrightWorkspace, "runs"),
      OPENAI_API_KEY: "",
    },
    url: "http://127.0.0.1:8765/api/health",
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
