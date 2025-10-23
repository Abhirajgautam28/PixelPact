import { test, expect } from '@playwright/test'

test.describe('Site navigation', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/')
	})

	test('header navigation loads pages and matches visual snapshots', async ({ page }) => {
		// Home snapshot
		await expect(page).toHaveTitle(/PixelPact|PixelPact Home|Home/i)
		await expect(page).toHaveScreenshot('home.png', { fullPage: true })

		const about = page.getByRole('link', { name: /about/i })
		if (await about.count() > 0) {
			await about.first().click()
			await page.waitForLoadState('networkidle')
				await expect(page).toHaveScreenshot('about.png', { fullPage: true })
		}

		const pricing = page.getByRole('link', { name: /pricing/i })
		if (await pricing.count() > 0) {
			await pricing.first().click()
			await page.waitForLoadState('networkidle')
				await expect(page).toHaveScreenshot('pricing.png', { fullPage: true })
		}

		const demo = page.getByRole('link', { name: /demo/i })
		if (await demo.count() > 0) {
			await demo.first().click()
			await page.waitForLoadState('networkidle')
				await expect(page).toHaveScreenshot('demo.png', { fullPage: true })
		}
	})
})
