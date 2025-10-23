import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  // Ensure the dev server is running separately on http://localhost:5173
  await page.goto('/')
})

test('navigate header links and capture hero & features screenshots', async ({ page }) => {
  // Click About
  await page.click('a[href="/about"]')
  await expect(page.locator('h1, h2')).toContainText(/About/i)

  // Back home
  await page.click('a[href="/"]')
  // Wait for hero heading
  const hero = page.locator('header, main').first()
  await expect(hero).toBeVisible()
  await page.screenshot({ path: 'e2e-screenshots/hero.png', fullPage: false })

  // Scroll to features section and screenshot
  const features = page.locator('[data-testid="features"]')
  if (await features.count() > 0) {
    await features.scrollIntoViewIfNeeded()
    await page.screenshot({ path: 'e2e-screenshots/features.png', fullPage: false })
  }
})
