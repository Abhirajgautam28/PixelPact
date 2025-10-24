import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './playwright/tests',
  timeout: 30_000,
  expect: { timeout: 5000, toHaveScreenshot: { maxDiffPixelRatio: 0.01, maxDiffPixels: 15000 } },
  fullyParallel: false,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'off',
    screenshot: 'only-on-failure',
    actionTimeout: 10000,
    // Stabilize visual tests: fixed viewport width and device scale factor
    viewport: { width: 1280, height: 720 },
    deviceScaleFactor: 1,
    // Disable chromium's background throttling which can cause timing differences
    launchOptions: { args: ['--disable-background-timer-throttling'] },
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
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 },
    }
  ]
})
