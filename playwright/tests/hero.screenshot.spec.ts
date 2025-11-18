import { test, expect } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'

test('home hero screenshot', async ({ page, browserName }) => {
  // Navigate to home. Prefer PLAYWRIGHT_BASE_URL or fall back to localhost:5173
  const base = process.env.PLAYWRIGHT_BASE_URL || process.env.BASE_URL || 'http://localhost:5173'
  await page.goto(base)
  // wait for hero element to exist
  await page.waitForSelector('#home-hero', { timeout: 10000 })
  // small delay to allow Three.js to finish first-frame renders
  await page.waitForTimeout(700)

  const outDir = path.join('test-results', 'hero-screenshots', String(browserName))
  try{
    fs.mkdirSync(outDir, { recursive: true })
  }catch(e){}
  const outPath = path.join(outDir, 'hero.png')
  await page.screenshot({ path: outPath, fullPage: false })
  // Quick sanity: ensure file written and non-empty
  const stat = fs.statSync(outPath)
  expect(stat.size).toBeGreaterThan(1000)
})
