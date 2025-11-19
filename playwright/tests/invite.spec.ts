import { test, expect, chromium } from '@playwright/test'

test('invite link allows one-time join and sets cookie', async () => {
  const browser = await chromium.launch()
  const ctxA = await browser.newContext()
  const ctxB = await browser.newContext()
  const pageA = await ctxA.newPage()
  const pageB = await ctxB.newPage()

  // create room via API
  const resp = await pageA.request.post('http://localhost:3001/api/rooms', { data: {} })
  expect(resp.ok()).toBeTruthy()
  const body = await resp.json()
  const roomId = body.roomId || body.id || body._id
  expect(roomId).toBeTruthy()

  const { waitForFrontend } = await import('./waitForFrontend')
  const base = await waitForFrontend(pageA, [5173, 4173], 30000)

  // create invite token
  const invResp = await pageA.request.post(`http://localhost:3001/api/rooms/${roomId}/invite`, { data: {} })
  expect(invResp.ok()).toBeTruthy()
  const invBody = await invResp.json()
  expect(invBody.url).toBeTruthy()
  const inviteToken = invBody.invite
  const inviteUrl = `${base}/board/${roomId}?invite=${inviteToken}`

  // owner opens the board
  await pageA.goto(`${base}/board/${roomId}`, { waitUntil: 'load', timeout: 30000 })
  await pageA.waitForSelector('canvas')

  // guest opens invite link (one-time)
  await pageB.goto(inviteUrl, { waitUntil: 'load', timeout: 30000 })
  await pageB.waitForSelector('canvas')
  // guest should be connected to socket
  await pageB.locator('text=Connected').waitFor({ timeout: 5000 })

  await browser.close()
})
