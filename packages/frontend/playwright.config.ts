import { defineConfig } from "@playwright/test";

export default defineConfig({
  expect: {
    timeout: 5_000,
  },
  testDir: "./e2e",
  timeout: 30_000,
  use: {
    baseURL: "http://localhost:5173",
    screenshot: "only-on-failure",
    testIdAttribute: "data-test-id",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { browserName: "chromium" },
    },
  ],
  retries: 0,
  reporter: "list",
});
