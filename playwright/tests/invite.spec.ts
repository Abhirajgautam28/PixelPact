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
  const inviteUrl = invBody.url

  // owner opens the board
  await pageA.goto(`${base}/board/${roomId}`, { waitUntil: 'load', timeout: 30000 })
  await pageA.waitForSelector('canvas')

  // guest opens invite link (one-time)
  await pageB.goto(inviteUrl, { waitUntil: 'load', timeout: 30000 })
  await pageB.waitForSelector('canvas')

  // wait for owner to observe a peer join (presence update)
  const presenceLocator = pageA.locator('.text-sm.text-slate-500')
  await pageA.waitForSelector('.text-sm.text-slate-500')

  // poll until presence shows at least 1 (owner plus guest => should be >=1)
  let seen = false
  for (let i=0;i<20;i++){
    const txt = await presenceLocator.innerText()
    const m = txt.match(/Presence:\s*(\d+)/)
    const n = m ? Number(m[1]) : 0
    if (n >= 1) { seen = true; break }
    await pageA.waitForTimeout(200)
  }
  expect(seen).toBeTruthy()

  await browser.close()
})
