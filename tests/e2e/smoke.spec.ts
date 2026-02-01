import { test, expect } from "@playwright/test";

test("landing page loads", async ({ page }) => {
  await page.goto("/");
  // Check for the main heading that's always present
  await expect(page.getByRole('heading', { name: /weekend.*sync/i })).toBeVisible();
});

test("sign-in page loads", async ({ page }) => {
  await page.goto("/sign-in");
  await expect(
    page.getByRole("button", { name: /sign in with google/i })
  ).toBeVisible();
  await expect(page.getByText("Send sign-in link", { exact: false })).toBeVisible();
});
