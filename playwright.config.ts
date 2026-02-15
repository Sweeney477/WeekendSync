import { defineConfig } from "@playwright/test";

const baseURL = process.env.E2E_BASE_URL || "http://localhost:3004";

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 30_000,
  expect: {
    timeout: 10_000,
  },
  use: {
    baseURL,
    headless: true,
    trace: "retain-on-failure",
  },
  reporter: [["list"]],
  webServer: {
    command: "npx next dev -p 3004 --turbo",
    url: "http://localhost:3004",
    reuseExistingServer: !process.env.CI || !!process.env.E2E_BASE_URL,
    timeout: 120 * 1000,
  },
});
