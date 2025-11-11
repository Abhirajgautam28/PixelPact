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
      await page.goto(`http://localhost:${p}/board/${roomId}`, { waitUntil: 'domcontentloaded', timeout: 4000 })
      opened = true
      break
    }catch(e){ /* try next */ }
  }
  if (!opened) throw new Error('Could not open frontend preview on known ports (5173/4173)')
  await page.waitForSelector('canvas')
  await expect(page.locator('text=Whiteboard')).toBeVisible()
})
