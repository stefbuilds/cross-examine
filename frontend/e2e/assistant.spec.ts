import { expect, test } from "@playwright/test";

test("shows the pixel-grid thinking state while the assistant is responding", async ({ page }) => {
  await page.route("**/api/chat", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    await route.fulfill({
      contentType: "application/x-ndjson",
      body: [
        JSON.stringify({ type: "snapshot", content: [{ type: "text", text: "Ready." }] }),
        JSON.stringify({ type: "done" }),
        "",
      ].join("\n"),
    });
  });
  await page.goto("/assistant");
  await page.getByRole("textbox", { name: "Message input" }).fill("Think about this change");
  await page.getByRole("button", { name: "Send message", exact: true }).click();
  const thinking = page.getByRole("status").filter({ hasText: "Thinking" });
  await expect(thinking).toBeVisible();
  await expect(thinking.locator('[data-testid="loading-state-grid"] > span')).toHaveCount(9);
  await expect(page.getByText("Ready.")).toBeVisible();
});

test("chat executes the real hero, exposes receipts, and restores its conversation", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/assistant");
  await page.getByRole("textbox", { name: "Message input" }).fill("Run offline hero demo");
  await page.getByRole("button", { name: "Send message", exact: true }).click();
  await expect(page.getByRole("heading", { name: "BROKEN", exact: true })).toBeVisible({ timeout: 40_000 });
  await page.getByRole("button", { name: /REFUTED.*preserves empty-list/i }).first().click();
  await expect(page.getByText("Exact command", { exact: true })).toBeVisible();
  await expect(page.getByText("Captured output", { exact: true })).toBeVisible();
  await expect(page.getByText("Reproducing input", { exact: true })).toBeVisible();
  await page.getByRole("textbox", { name: "Message input" }).fill("Explain the result");
  await page.getByRole("button", { name: "Send message", exact: true }).click();
  await expect(page.getByRole("heading", { name: "BROKEN", exact: true })).toHaveCount(2);
  await expect(page.getByRole("button", { name: "Stop generating" })).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole("heading", { name: "BROKEN", exact: true })).toHaveCount(2);
  await expect(page.getByText("Explain the result", { exact: true })).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole("textbox", { name: "Message input" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});
