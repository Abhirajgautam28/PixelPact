import { test, expect } from '@playwright/test'

test.describe('Site navigation', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/')
	})

	test('header navigation loads pages and matches visual snapshots', async ({ page }) => {
		// Home snapshot
		await expect(page).toHaveTitle(/PixelPact|PixelPact Home|Home/i)
		// Stabilize visuals: hide dynamic regions before screenshots
		await page.addStyleTag({ content: `
			/* hide or neutralize animation-heavy or dynamic areas */
			[data-testid="lottie-player"], footer { visibility: hidden !important; }
			/* disable CSS animations/transitions used by Tailwind utility classes */
			* { transition: none !important; animation: none !important; }
			/* hide small pulsing indicators */
			button .animate-pulse, button > span[aria-hidden] { display: none !important; }
		` })
		await page.waitForLoadState('networkidle')
		await page.waitForFunction(() => (document as any).fonts ? (document as any).fonts.status === 'loaded' : true)

		// forward page console messages to test output for debugging (fonts/network)
		page.on('console', m => console.log('PAGE:', m.text()));
		const fontsInfo = await page.evaluate(() => Array.from((document as any).fonts || []).map((f: any) => ({ family: f.family, status: f.status })));
		console.log('document.fonts:', JSON.stringify(fontsInfo));

		// Make rotating tagline deterministic and neutralize any JS-driven changes
		await page.evaluate(() => {
			const strong = document.querySelector('.inline-flex strong');
			if (strong) strong.textContent = 'Sketch together ✏️';
			// remove any aria-hidden pulsing badges
			const badge = document.querySelector('button .animate-pulse');
			if (badge && badge.parentElement) badge.parentElement.removeChild(badge);
		});
		await expect(page).toHaveScreenshot('home.png', { fullPage: true, timeout: 15000, mask: [page.locator('footer'), page.locator('[data-testid="lottie-player"]')] })

		const about = page.getByRole('link', { name: /about/i })
		if (await about.count() > 0) {
				await about.first().click()
				await page.waitForLoadState('networkidle')
				await page.waitForFunction(() => (document as any).fonts ? (document as any).fonts.status === 'loaded' : true)
				await expect(page).toHaveScreenshot('about.png', { fullPage: true, timeout: 15000, mask: [page.locator('footer'), page.locator('[data-testid="lottie-player"]')] })
		}

		const pricing = page.getByRole('link', { name: /pricing/i })
		if (await pricing.count() > 0) {
				await pricing.first().click()
				await page.waitForLoadState('networkidle')
				await page.waitForFunction(() => (document as any).fonts ? (document as any).fonts.status === 'loaded' : true)
				await expect(page).toHaveScreenshot('pricing.png', { fullPage: true, timeout: 15000, mask: [page.locator('footer'), page.locator('[data-testid="lottie-player"]')] })
		}

		const demo = page.getByRole('link', { name: /demo/i })
		if (await demo.count() > 0) {
				await demo.first().click()
				await page.waitForLoadState('networkidle')
				await page.waitForFunction(() => (document as any).fonts ? (document as any).fonts.status === 'loaded' : true)
				await expect(page).toHaveScreenshot('demo.png', { fullPage: true, timeout: 15000, mask: [page.locator('footer'), page.locator('[data-testid="lottie-player"]')] })
		}
	})
})
