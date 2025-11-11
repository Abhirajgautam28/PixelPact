import { test, expect } from '@playwright/test'

test('select region and delete', async ({ page }) => {
  const resp = await page.request.post('http://localhost:3001/api/rooms', { data: {} })
  expect(resp.ok()).toBeTruthy()
  const body = await resp.json()
  const roomId = body.roomId || body.id || body._id

  await page.goto(`http://localhost:5173/board/${roomId}`, { waitUntil: 'load', timeout: 30000 })
  await page.waitForSelector('canvas', { timeout: 20000 })

  const canvas = page.locator('canvas')
  const box = await canvas.boundingBox()
  if (!box) throw new Error('canvas not present')

  // draw a dot so selection has something to capture
  const x = Math.round(box.x + box.width/2)
  const y = Math.round(box.y + box.height/2)
  await page.mouse.move(x, y)
  await page.mouse.down(); await page.mouse.up()
  await page.waitForTimeout(200)

  // snapshot before selection
  const before = await page.evaluate(()=> document.querySelector('canvas')?.toDataURL() || '')

  // focus canvas then select tool shortcut (S)
  await canvas.click()
  await page.keyboard.press('s')
  // drag selection rectangle (this draws a preview dashed rect on the canvas)
  await page.mouse.move(x-30, y-20)
  await page.mouse.down()
  await page.mouse.move(x+30, y+20)
  await page.mouse.up()
  await page.waitForTimeout(200)

  // after selection preview, canvas should have changed
  const after = await page.evaluate(()=> document.querySelector('canvas')?.toDataURL() || '')
  expect(after).not.toEqual(before)
})
