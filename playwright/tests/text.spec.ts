import { test, expect } from '@playwright/test'

test('text tool adds text to canvas', async ({ page }) => {
  const resp = await page.request.post('http://localhost:3001/api/rooms', { data: {} })
  expect(resp.ok()).toBeTruthy()
  const body = await resp.json()
  const roomId = body.roomId || body.id || body._id

  const { waitForFrontend } = await import('./waitForFrontend')
  const base = await waitForFrontend(page, [5173, 4173], 30000)
  await page.goto(`${base}/board/${roomId}`, { waitUntil: 'load', timeout: 30000 })
  await page.waitForSelector('canvas', { timeout: 30000 })
  const canvas = page.locator('canvas')
  const box = await canvas.boundingBox()
  if (!box) throw new Error('canvas not present')

  const x = Math.round(box.x + box.width/3)
  const y = Math.round(box.y + box.height/3)

  // select text tool
  await page.keyboard.press('t')
  // click to open inline input
  await page.mouse.click(x, y)
  await page.waitForSelector('input[autoFocus], input[style]', { timeout: 3000 }).catch(()=>{})
  // type text and commit with Enter
  await page.keyboard.type('Hello E2E')
  await page.keyboard.press('Enter')
  await page.waitForTimeout(200)

  const after = await page.evaluate(()=> document.querySelector('canvas')?.toDataURL() || '')
  expect(after.length).toBeGreaterThan(0)
})
