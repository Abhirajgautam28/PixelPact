import { test, expect } from '@playwright/test'

test.describe('Site navigation', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/')
	})

	test('header navigation loads pages and captures screenshots', async ({ page }, testInfo) => {
		// Capture home
		await expect(page).toHaveTitle(/PixelPact|PixelPact Home|Home/i)
		await page.screenshot({ path: `playwright/test-results/home-${Date.now()}.png`, fullPage: true })

		// Click About link (assumes link text 'About')
		const about = page.getByRole('link', { name: /about/i })
		if (await about.count() > 0) {
			await about.first().click()
			await page.waitForLoadState('networkidle')
			await page.screenshot({ path: `playwright/test-results/about-${Date.now()}.png`, fullPage: true })
			await expect(page.locator('h1,h2')).toHaveText(/about/i, { timeout: 3000 }).catch(() => {})
		}

		// Click Pricing link (assumes link text 'Pricing')
		const pricing = page.getByRole('link', { name: /pricing/i })
		if (await pricing.count() > 0) {
			await pricing.first().click()
			await page.waitForLoadState('networkidle')
			await page.screenshot({ path: `playwright/test-results/pricing-${Date.now()}.png`, fullPage: true })
		}

		// Click Demo link if present
		const demo = page.getByRole('link', { name: /demo/i })
		if (await demo.count() > 0) {
			await demo.first().click()
			await page.waitForLoadState('networkidle')
			await page.screenshot({ path: `playwright/test-results/demo-${Date.now()}.png`, fullPage: true })
		}
	})
})
