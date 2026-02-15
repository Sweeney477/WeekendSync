import { test, expect } from "@playwright/test";
import { validateNextStepVisible } from "../utils/ux-validators";

/**
 * Journey: First Value (Activation)
 * Goal: First trip created → user reaches "first value" (e.g. submits availability or a vote).
 *
 * Steps (require authenticated test user + existing trip):
 * 1. User has completed onboarding and created a trip (or joined via invite).
 * 2. User lands on trip dashboard and sees next-step CTA (e.g. "Mark Your Availability" or "Continue").
 * 3. User navigates to availability (or voting) and submits at least one value.
 *
 * These tests are skipped until an auth fixture (e.g. storageState with test user) is available.
 */
test.describe("@critical Journey: First Value", () => {
  test.skip("Step 2: Dashboard shows next-step CTA after trip created", async ({
    page,
  }) => {
    // TODO: Use auth fixture and create trip via API or UI, then:
    await page.goto("/trip/REQUIRES_TRIP_ID/dashboard");
    await expect(page).toHaveURL(/\/trip\/[^/]+\/dashboard/);
    await validateNextStepVisible(page, /mark your availability|continue|add your availability/i);
  });

  test.skip("Step 3: User can open availability page and see date grid", async ({
    page,
  }) => {
    // TODO: Use auth fixture + trip ID, then:
    await page.goto("/trip/REQUIRES_TRIP_ID/availability");
    await expect(page).toHaveURL(/\/trip\/[^/]+\/availability/);
    await expect(
      page.getByRole("button", { name: /yes|maybe|no|save/i }).first()
    ).toBeVisible({ timeout: 15000 });
  });
});
