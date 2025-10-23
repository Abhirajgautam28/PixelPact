import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './playwright/tests',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'off',
    // keep screenshots on to capture actual images when updating baselines
    screenshot: 'on',
    actionTimeout: 20_000,
    // lock viewport and device scale for deterministic screenshots
    viewport: { width: 1280, height: 1975 },
    deviceScaleFactor: 1,
    // ensure consistent fonts rendering by using a fixed locale and timezone
    locale: 'en-US',
    timezoneId: 'UTC',
    // reduce flakiness by using a stable color scheme
    colorScheme: 'light',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
    timeout: 120_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 1975 }, deviceScaleFactor: 1 },
    }
  ]
})
