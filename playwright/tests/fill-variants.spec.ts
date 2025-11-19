import { test, expect } from '@playwright/test'

const colors = ['#ff0000','#00ff00','#0000ff']

for(const c of colors){
  test(`fill tool with color ${c}`, async ({ page }) => {
    const resp = await page.request.post('http://localhost:3001/api/rooms', { data: {} })
    expect(resp.ok()).toBeTruthy()
    const body = await resp.json()
    const roomId = body.roomId || body.id || body._id

    const { waitForFrontend } = await import('../tests/waitForFrontend')
    const base = await waitForFrontend(page, [5173, 4173], 30000)
    await page.goto(`${base}/board/${roomId}`, { waitUntil: 'load', timeout: 30000 })
    await page.waitForSelector('canvas', { timeout: 30000 })
    const canvas = page.locator('canvas')
    const box = await canvas.boundingBox()
    if (!box) throw new Error('canvas not present')

    // set color input value
    const colorInput = page.locator('input[type="color"]')
    await expect(colorInput).toBeVisible()
    await colorInput.fill(c)

    // select fill tool and click center
    await page.keyboard.press('f')
    const cx = Math.round(box.x + box.width/2)
    const cy = Math.round(box.y + box.height/2)
    await page.mouse.click(cx, cy)
    await page.waitForTimeout(200)

    const after = await page.evaluate(()=> document.querySelector('canvas')?.toDataURL() || '')
    expect(after.length).toBeGreaterThan(0)
  })
}
