import { test, expect, request } from '@playwright/test'

const BASE = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173'
const API_BASE = process.env.PLAYWRIGHT_API_BASE || 'http://localhost:3001'

test.describe('invite flow', ()=>{
  test('create invite and accept (single-use)', async ({ browser }) => {
    // create a room via server API
    const req = await request.newContext({ baseURL: API_BASE })
    const r1 = await req.post('/api/rooms', { data: {} })
    expect(r1.ok()).toBeTruthy()
    const body1 = await r1.json()
    const roomId = body1.roomId
    expect(roomId).toBeTruthy()

    // create invite
    const r2 = await req.post(`/api/rooms/${encodeURIComponent(roomId)}/invite`, { data: {} })
    expect(r2.ok()).toBeTruthy()
    const body2 = await r2.json()
    const invite = body2.invite
    const url = body2.url
    expect(invite).toBeTruthy()
    expect(url).toContain(`/board/${roomId}`)

    // consume invite in a browser context by navigating to URL
    const context1 = await browser.newContext()
    const page1 = await context1.newPage()
    await page1.goto(url, { waitUntil: 'networkidle' })
    // give client a moment to exchange invite and set cookie
    await page1.waitForTimeout(500)
    const cookies1 = await context1.cookies()
    const tokenCookie1 = cookies1.find(c=> c.name === 'token')
    expect(tokenCookie1).toBeTruthy()
    await context1.close()

    // second consumer should not be allowed (single-use)
    const context2 = await browser.newContext()
    const page2 = await context2.newPage()
    const resp = await page2.goto(url, { waitUntil: 'networkidle' })
    // client will attempt exchange; we expect no token cookie set
    await page2.waitForTimeout(500)
    const cookies2 = await context2.cookies()
    const tokenCookie2 = cookies2.find(c=> c.name === 'token')
    expect(tokenCookie2).toBeFalsy()
    await context2.close()

    await req.dispose()
  })
})
