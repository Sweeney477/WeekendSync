import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("landing page a11y smoke", async ({ page }) => {
  await page.goto("/");
  const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
  expect(accessibilityScanResults.violations).toEqual([]);
});

test("sign-in page a11y smoke", async ({ page }) => {
  await page.goto("/sign-in");
  const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
  expect(accessibilityScanResults.violations).toEqual([]);
});
