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

test("onboarding page a11y smoke", async ({ page }) => {
  await page.goto("/onboarding");
  await expect(page).toHaveURL(/\/sign-in/, { timeout: 15000 });
  const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
  expect(accessibilityScanResults.violations).toEqual([]);
});

test("trip dashboard entry a11y smoke", async ({ page }) => {
  await page.goto("/trip/a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/dashboard");
  await expect(page).toHaveURL(/\/sign-in/, { timeout: 15000 });
  const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
  expect(accessibilityScanResults.violations).toEqual([]);
});
