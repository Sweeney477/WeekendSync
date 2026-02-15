import { test, expect } from "@playwright/test";

/**
 * Journey: Voting with Availability
 * Plan: availability_first_voting_ux
 *
 * Voting page shows Section A (Mark Your Availability) first, then Section B (Vote for Weekend),
 * then Section C (Vote for Destination). User can mark availability directly on the voting page.
 *
 * These tests are skipped until an auth fixture (e.g. storageState with test user)
 * and trip with weekends exist.
 */
test.describe("@critical Journey: Voting with Availability", () => {
  test.skip("Voting page shows Section A (Mark Your Availability) first", async ({
    page,
  }) => {
    // TODO: Use auth fixture and trip ID with weekends, then:
    await page.goto("/trip/REQUIRES_TRIP_ID/voting");
    await expect(page).toHaveURL(/\/trip\/[^/]+\/voting/);

    const sectionA = page.getByRole("heading", {
      name: /section a:? mark your availability/i,
    });
    await expect(sectionA).toBeVisible({ timeout: 15000 });
    await expect(sectionA).toBeInViewport();

    const availabilityButtons = page.getByRole("group", {
      name: /mark availability/i,
    });
    await expect(availabilityButtons.first()).toBeVisible();
  });

  test.skip("Voting page shows availability Yes/Maybe/No controls", async ({
    page,
  }) => {
    await page.goto("/trip/REQUIRES_TRIP_ID/voting");
    await expect(page).toHaveURL(/\/trip\/[^/]+\/voting/);

    const yesButton = page.getByRole("button", { name: /available/i }).first();
    const maybeButton = page.getByRole("button", { name: /maybe available/i }).first();
    const noButton = page.getByRole("button", { name: /not available/i }).first();

    await expect(yesButton).toBeVisible({ timeout: 15000 });
    await expect(maybeButton).toBeVisible();
    await expect(noButton).toBeVisible();
  });

  test.skip("Voting page shows Section B (Vote for Weekend) and Section C (Vote for Destination)", async ({
    page,
  }) => {
    await page.goto("/trip/REQUIRES_TRIP_ID/voting");
    await expect(page).toHaveURL(/\/trip\/[^/]+\/voting/);

    const sectionB = page.getByRole("heading", {
      name: /section b:? vote for weekend/i,
    });
    const sectionC = page.getByRole("heading", {
      name: /section c:? vote for destination/i,
    });

    await expect(sectionB).toBeVisible({ timeout: 15000 });
    await expect(sectionC).toBeVisible();
  });

  test.skip("Submit Vote button enabled when availability marked", async ({
    page,
  }) => {
    await page.goto("/trip/REQUIRES_TRIP_ID/voting");
    await expect(page).toHaveURL(/\/trip\/[^/]+\/voting/);

    const yesButton = page.getByRole("button", { name: /available/i }).first();
    await yesButton.click();

    const submitButton = page.getByRole("button", { name: /submit vote/i });
    await expect(submitButton).toBeEnabled({ timeout: 5000 });
  });
});
