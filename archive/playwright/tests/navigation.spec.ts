import { test, expect } from '@playwright/test'

test.describe('Site navigation (archived)', () => {
  test('header navigation (archived copy)', async ({ page }) => {
    // Archived Playwright test - kept for history only.
    await page.goto('/')
    await expect(page).toHaveTitle(/PixelPact|PixelPact Home|Home/i)
  })
})
