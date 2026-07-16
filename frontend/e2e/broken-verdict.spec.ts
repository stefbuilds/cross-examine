import { expect, test } from "@playwright/test";

test("opens every grounded receipt from a packaged direct route", async ({ page }) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));

  await page.goto("/fixtures/broken");
  await expect(page.getByRole("heading", { name: "BROKEN" })).toBeVisible();
  await page
    .getByRole("row", {
      name: /preserves empty-list normalization.*behavioral_diff refuted/i,
    })
    .getByRole("button")
    .click();

  await expect(page.getByText("Exact command")).toBeVisible();
  await expect(
    page.getByText(/probe_runner call normalizer\.core:normalize/).first(),
  ).toBeVisible();
  await expect(page.getByText(/"value": \[\]/).first()).toBeVisible();
  await expect(page.getByText(/"value": null/).first()).toBeVisible();
  await expect(page.getByText("Reproducing input")).toBeVisible();
  expect(pageErrors).toEqual([]);
});

test("runs the offline hero from the browser without model credentials", async ({ page }) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));

  await page.goto("/run");
  await page.getByRole("button", { name: "Run offline hero demo" }).click();

  await expect(page).toHaveURL(/\/runs\/[a-f0-9]+$/);
  await expect(page.getByRole("heading", { name: "BROKEN" })).toBeVisible({
    timeout: 30_000,
  });
  await page
    .getByRole("row", {
      name: /preserves empty-list normalization.*refuted/i,
    })
    .getByRole("button")
    .first()
    .click();
  await expect(page.getByText("Reproducing input")).toBeVisible();
  await expect(page.getByText("[]", { exact: true }).first()).toBeVisible();
  expect(pageErrors).toEqual([]);
});
