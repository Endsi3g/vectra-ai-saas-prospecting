import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false, // Run tests sequentially to avoid database/mock conflicts
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1, // Use single worker for simplicity
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: false, // Ensure it restarts with our environment variable
    stdout: 'ignore',
    stderr: 'pipe',
    timeout: 30000,
    env: {
      PLAYWRIGHT_TEST: 'true',
      E2E_TESTING: 'true',
    },
  },
});
