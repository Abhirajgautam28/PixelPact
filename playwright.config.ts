import { defineConfig } from '@playwright/test'

export default defineConfig({
	testDir: './playwright/tests',
	timeout: 30_000,
	use: {
		headless: true,
		actionTimeout: 10_000,
		ignoreHTTPSErrors: true,
	},
	reporter: [['list'], ['html', { open: 'never' }]],
	projects: [
		{ name: 'chromium', use: { browserName: 'chromium' } },
		{ name: 'webkit', use: { browserName: 'webkit' } },
		{ name: 'firefox', use: { browserName: 'firefox' } }
	],
})
