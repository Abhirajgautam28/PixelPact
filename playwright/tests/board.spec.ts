import { test, expect } from '@playwright/test'

test('create room via API and open whiteboard', async ({ page }) => {
  // Create a room via backend API (server must be running on :3001)
  const resp = await page.request.post('http://localhost:3001/api/rooms', { data: {} })
  expect(resp.ok()).toBeTruthy()
  const body = await resp.json()
  const roomId = body.roomId || body.id || body._id
  expect(roomId).toBeTruthy()

  // Determine frontend host/port: prefer 5173 but fallback to 4173 (vite preview sometimes uses 4173)
  const tryPorts = [5173, 4173]
  let opened = false
  for (const p of tryPorts){
    try{
      // allow more time for vite preview to start and assets to load
      await page.goto(`http://localhost:${p}/board/${roomId}`, { waitUntil: 'load', timeout: 15000 })
      opened = true
      break
    }catch(e){ /* try next */ }
  }
  if (!opened) throw new Error('Could not open frontend preview on known ports (5173/4173)')
  // wait for the canvas or the labelled whiteboard application to appear (less fragile across builds)
  await page.waitForSelector('canvas, [aria-label="Whiteboard canvas"], [role="application"]', { timeout: 20000 })
  // optionally check that title contains Whiteboard if present
  const title = await page.title()
  // log to make failures easier to debug
  console.log('page title:', title)
})
