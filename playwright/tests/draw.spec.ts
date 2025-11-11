import { test, expect } from '@playwright/test'

test('draw on canvas, undo and redo', async ({ page }) => {
  // create a room
  const resp = await page.request.post('http://localhost:3001/api/rooms', { data: {} })
  expect(resp.ok()).toBeTruthy()
  const body = await resp.json()
  const roomId = body.roomId || body.id || body._id
  expect(roomId).toBeTruthy()

  // open board
  await page.goto(`http://localhost:5173/board/${roomId}`, { waitUntil: 'load', timeout: 30000 })
  await page.waitForSelector('canvas, [aria-label="Whiteboard canvas"]', { timeout: 20000 })

  const canvas = page.locator('canvas')
  const box = await canvas.boundingBox()
  if (!box) throw new Error('canvas bounding box not available')

  // get initial snapshot (guard against null)
  const before = await page.evaluate(() => {
    const c = document.querySelector('canvas') as HTMLCanvasElement | null
    return c ? c.toDataURL() : ''
  })

  // draw a short stroke in the center
  const startX = Math.round(box.x + box.width / 3)
  const startY = Math.round(box.y + box.height / 2)
  const endX = startX + 80
  const endY = startY + 10

  await page.mouse.move(startX, startY)
  await page.mouse.down()
  await page.mouse.move(endX, endY, { steps: 6 })
  await page.mouse.up()

  // allow frame to commit
  await page.waitForTimeout(300)

  const after = await page.evaluate(() => {
    const c = document.querySelector('canvas') as HTMLCanvasElement | null
    return c ? c.toDataURL() : ''
  })
  expect(after.length).toBeGreaterThan(before.length)

  // undo (Ctrl+Z)
  await page.keyboard.down('Control')
  await page.keyboard.press('z')
  await page.keyboard.up('Control')
  await page.waitForTimeout(300)
  const afterUndo = await page.evaluate(() => {
    const c = document.querySelector('canvas') as HTMLCanvasElement | null
    return c ? c.toDataURL() : ''
  })
  expect(afterUndo).not.toEqual(after)

  // redo (Ctrl+Y)
  await page.keyboard.down('Control')
  await page.keyboard.press('y')
  await page.keyboard.up('Control')
  await page.waitForTimeout(300)
  const afterRedo = await page.evaluate(() => {
    const c = document.querySelector('canvas') as HTMLCanvasElement | null
    return c ? c.toDataURL() : ''
  })
  expect(afterRedo).toEqual(after)
})
