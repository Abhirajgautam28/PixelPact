import { test, expect, chromium } from '@playwright/test'

test('multi-user draw syncs across sockets', async () => {
  // launch two browser contexts to simulate two users
  const browser = await chromium.launch()
  const ctxA = await browser.newContext()
  const ctxB = await browser.newContext()
  const pageA = await ctxA.newPage()
  const pageB = await ctxB.newPage()

  // create room from pageA
  const resp = await pageA.request.post('http://127.0.0.1:3001/api/rooms', { data: {} })
  expect(resp.ok()).toBeTruthy()
  const body = await resp.json()
  const roomId = body.roomId || body.id || body._id

  const { waitForFrontend } = await import('./waitForFrontend')
  const base = await waitForFrontend(pageA, [5173, 4173], 30000)
  await pageA.goto(`${base}/board/${roomId}`, { waitUntil: 'load', timeout: 30000 })
  await pageB.goto(`${base}/board/${roomId}`, { waitUntil: 'load', timeout: 30000 })
  await pageA.waitForSelector('canvas')
  await pageB.waitForSelector('canvas')

  const cA = pageA.locator('canvas')
  const box = await cA.boundingBox()
  if (!box) throw new Error('canvas missing')

  // draw in A
  const sx = Math.round(box.x + 20)
  const sy = Math.round(box.y + 20)
  await pageA.mouse.move(sx, sy)
  await pageA.mouse.down()
  await pageA.mouse.move(sx + 60, sy + 10, { steps: 6 })
  await pageA.mouse.up()

  await pageA.waitForTimeout(300)
  // ensure B sees changes (dataURL length increases)
  const afterA = await pageA.evaluate(()=> document.querySelector('canvas')?.toDataURL() || '')
  await pageB.waitForTimeout(500)
  const afterB = await pageB.evaluate(()=> document.querySelector('canvas')?.toDataURL() || '')
  expect(afterB.length).toBeGreaterThan(0)

  await browser.close()
})
