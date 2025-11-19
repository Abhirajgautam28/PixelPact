import { test, expect } from '@playwright/test'
import { waitForFrontend } from './waitForFrontend'

test('create room via API and open whiteboard', async ({ page }) => {
  // Create a room via backend API (server must be running on :3001)
  const resp = await page.request.post('http://localhost:3001/api/rooms', { data: {} })
  expect(resp.ok()).toBeTruthy()
  const body = await resp.json()
  const roomId = body.roomId || body.id || body._id
  expect(roomId).toBeTruthy()

  // Wait for frontend to become available and resolve its base URL
  const base = await waitForFrontend(page, [5173, 4173], 30000)
  // navigate to board once frontend is responsive
  await page.goto(`${base}/board/${roomId}`, { waitUntil: 'load', timeout: 30000 })
  // wait for the canvas or the labelled whiteboard application to appear (less fragile across builds)
  await page.waitForSelector('canvas, [aria-label="Whiteboard canvas"], [role="application"]', { timeout: 30000 })
  // optionally check that title contains Whiteboard if present
  const title = await page.title()
  // log to make failures easier to debug
  console.log('page title:', title)
})
