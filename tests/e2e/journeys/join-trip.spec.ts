import { test, expect } from "@playwright/test";

/**
 * Journey: Join Trip by Invite
 * Doc: _project_specs/journeys/critical/join-trip.md
 *
 * Covers step 1 (entry, unauthenticated) and error E1 (invalid code).
 * Full join flow requires auth.
 */
test.describe("@critical Journey: Join Trip", () => {
  test("Step 1: /join/[code] shows Join trip and code", async ({ page }) => {
    await page.goto("/join/ABC12XYZ");

    await expect(page.getByRole("heading", { name: /join trip/i })).toBeVisible();
    await expect(page.getByText(/ABC12XYZ/)).toBeVisible();
  });

  test("Step 1: Unauthenticated user sees Sign in to join", async ({ page }) => {
    await page.goto("/join/FAKECODE9");

    await expect(page.getByRole("heading", { name: /join trip/i })).toBeVisible();
    const signInLink = page.getByRole("link", { name: /sign in to join/i });
    await expect(signInLink).toBeVisible();
    await expect(signInLink).toHaveAttribute("href", /inviteCode=FAKECODE9/);
  });

  test("E1: Unauthenticated join page shows Sign in to join (recovery is sign-in)", async ({
    page,
  }) => {
    await page.goto("/join/INVALID99");
    await expect(page.getByRole("heading", { name: /join trip/i })).toBeVisible();
    await expect(page.getByText(/INVALID99/)).toBeVisible();
    await expect(page.getByRole("link", { name: /sign in to join/i })).toBeVisible();
  });
});

test.describe("@critical Journey: Join Trip - Home flow", () => {
  test("Home: Join with code when unauthenticated redirects to sign-in with inviteCode", async ({
    page,
  }) => {
    await page.goto("/");

    const codeInput = page.getByLabel(/trip code/i);
    await codeInput.fill("INVALID99");
    await page.getByRole("button", { name: /join trip/i }).click();

    await expect(page).toHaveURL(/\/sign-in/);
    expect(page.url()).toContain("inviteCode=INVALID99");
  });
});
