import { test, expect } from "@playwright/test";

/**
 * Journey: Create Trip
 * Doc: _project_specs/journeys/critical/create-trip.md
 *
 * Unauthenticated: redirect to sign-in. Form tests require auth (run with test user).
 */
test.describe("@critical Journey: Create Trip", () => {
  test("Unauthenticated user going to /trips/new redirects to sign-in", async ({
    page,
  }) => {
    await page.goto("/trips/new");

    await expect(page).toHaveURL(/\/sign-in/, { timeout: 15000 });
    expect(page.url()).toMatch(/next=.*trips.*new/);
  });
});
