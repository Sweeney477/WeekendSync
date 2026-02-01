import { test, expect } from "@playwright/test";
import { validateCTAVisible } from "../utils/ux-validators";

/**
 * Journey: Signup to First Value
 * Doc: _project_specs/journeys/critical/signup-to-first-value.md
 *
 * Covers unauthenticated steps 1–3; step 4 (trip plan) requires auth.
 */
test.describe("@critical Journey: Signup to First Value", () => {
  test("Step 1: Landing has primary CTAs visible", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: /weekend.*sync/i })).toBeVisible();

    await validateCTAVisible(page, /join trip/i);
    await validateCTAVisible(page, /create new trip/i);
  });

  test("Step 1: Trip code input and hint visible", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByLabel(/trip code/i)).toBeVisible();
    await expect(page.getByText(/8–12 letters and numbers/i)).toBeVisible();
  });

  test("Step 2: Sign-in page has minimal form and Send sign-in link", async ({ page }) => {
    await page.goto("/sign-in");

    await expect(page.getByRole("heading", { name: /sign in/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(
      page.getByRole("button", { name: /send sign-in link/i })
    ).toBeVisible();
    await expect(page.getByText(/one-time sign-in link/i)).toBeVisible();
  });

  test("Step 3: Unauthenticated user going to onboarding redirects to sign-in", async ({
    page,
  }) => {
    await page.goto("/onboarding");

    await expect(page).toHaveURL(/\/sign-in/, { timeout: 15000 });
    expect(page.url()).toContain("next=");
  });
});
