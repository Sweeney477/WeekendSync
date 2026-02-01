import { Page, expect } from "@playwright/test";

/**
 * Assert page load time is under threshold (navigation timing).
 * Use in journey specs where doc calls for "Page loads in < 2 seconds".
 */
export async function validatePageLoad(
  page: Page,
  maxMs = 2000
): Promise<void> {
  const timing = await page.evaluate(() => {
    const nav = performance.getEntriesByType(
      "navigation"
    )[0] as PerformanceNavigationTiming;
    return nav ? nav.loadEventEnd - nav.startTime : 0;
  });
  expect(timing).toBeLessThan(maxMs);
}

/**
 * Assert a CTA (button or link) with the given name is visible.
 * Use where doc calls for "Primary CTA visible". Optionally assert in viewport
 * when the page layout keeps the CTA above the fold.
 */
export async function validateCTAVisible(
  page: Page,
  ctaText: RegExp | string,
  options?: { inViewport?: boolean }
): Promise<void> {
  const cta = page.getByRole("button", { name: ctaText }).or(
    page.getByRole("link", { name: ctaText })
  );
  await expect(cta).toBeVisible();
  if (options?.inViewport) {
    await expect(cta).toBeInViewport();
  }
}
