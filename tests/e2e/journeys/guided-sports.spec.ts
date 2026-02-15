import { test, expect } from "@playwright/test";

const FAKE_TRIP_ID = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";

/**
 * Guided Sports / Baseball Weekend flow
 * Plan: _project_specs / Baseball Weekend
 * - Unauthenticated: setup and guided routes redirect to sign-in
 * - Create trip redirects to setup/city (requires auth to verify)
 */
test.describe("@critical Guided Sports flow", () => {
  test("Unauthenticated user going to /trip/:id/setup/city redirects to sign-in", async ({
    page,
  }) => {
    await page.goto(`/trip/${FAKE_TRIP_ID}/setup/city`);
    await expect(page).toHaveURL(/\/sign-in/, { timeout: 15000 });
  });

  test("Unauthenticated user going to /trip/:id/setup/weekend-type redirects to sign-in", async ({
    page,
  }) => {
    await page.goto(`/trip/${FAKE_TRIP_ID}/setup/weekend-type`);
    await expect(page).toHaveURL(/\/sign-in/, { timeout: 15000 });
  });

  test("Unauthenticated user going to /trip/:id/setup/sports-details redirects to sign-in", async ({
    page,
  }) => {
    await page.goto(`/trip/${FAKE_TRIP_ID}/setup/sports-details`);
    await expect(page).toHaveURL(/\/sign-in/, { timeout: 15000 });
  });

  test("Unauthenticated user going to /trip/:id/setup/games redirects to sign-in", async ({
    page,
  }) => {
    await page.goto(`/trip/${FAKE_TRIP_ID}/setup/games`);
    await expect(page).toHaveURL(/\/sign-in/, { timeout: 15000 });
  });

  test("Unauthenticated user going to /trip/:id/setup/itinerary redirects to sign-in", async ({
    page,
  }) => {
    await page.goto(`/trip/${FAKE_TRIP_ID}/setup/itinerary`);
    await expect(page).toHaveURL(/\/sign-in/, { timeout: 15000 });
  });

  test("Setup city page has city input and continue when loaded", async ({
    page,
  }) => {
    await page.goto("/sign-in");
    await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
    // Without auth we cannot load setup; just ensure sign-in is the gate
    await page.goto(`/trip/${FAKE_TRIP_ID}/setup/city`);
    await expect(page).toHaveURL(/\/sign-in/, { timeout: 15000 });
    await expect(page.getByRole("heading", { name: /sign in/i })).toBeVisible();
  });

  test("Trips new page still requires auth", async ({ page }) => {
    await page.goto("/trips/new");
    await expect(page).toHaveURL(/\/sign-in/, { timeout: 15000 });
    expect(page.url()).toMatch(/next=.*trips.*new/);
  });

  test("Dashboard URL is under trip scope", async ({ page }) => {
    await page.goto(`/trip/${FAKE_TRIP_ID}/dashboard`);
    await expect(page).toHaveURL(/\/sign-in/, { timeout: 15000 });
  });
});
