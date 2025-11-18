import { test, expect } from '@playwright/test'
import fs from 'fs'
import path from 'path'
import { PNG } from 'pngjs'
import pixelmatch from 'pixelmatch'

// Using pixel-level comparison here because data URL string equality can differ
// across browsers due to encoding metadata even when rendered pixels match.
test('draw on canvas, undo and redo (pixel-accurate)', async ({ page }) => {
  // create a room
  const resp = await page.request.post('http://localhost:3001/api/rooms', { data: {} })
  expect(resp.ok()).toBeTruthy()
  const body = await resp.json()
  const roomId = body.roomId || body.id || body._id
  expect(roomId).toBeTruthy()

  // open board
  // wait for frontend before navigating
  const { waitForFrontend } = await import('./waitForFrontend')
  const base = await waitForFrontend(page, [5173, 4173], 30000)
  await page.goto(`${base}/board/${roomId}`, { waitUntil: 'load', timeout: 30000 })
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
  // wait for undo to apply by detecting that the canvas data URL changed
  await page.waitForFunction((prevDataUrl) => {
    const c = document.querySelector('canvas') as HTMLCanvasElement | null
    try { return !!c && c.toDataURL() !== prevDataUrl }catch(e){ return false }
  }, after, { timeout: 8000 })
  const afterUndo = await page.evaluate(() => {
    const c = document.querySelector('canvas') as HTMLCanvasElement | null
    return c ? c.toDataURL() : ''
  })

  // redo (Ctrl+Y)
  await page.keyboard.down('Control')
  await page.keyboard.press('y')
  await page.keyboard.up('Control')
  // wait for redo to apply by detecting that the canvas data URL changed
  await page.waitForFunction((prevDataUrl) => {
    const c = document.querySelector('canvas') as HTMLCanvasElement | null
    try { return !!c && c.toDataURL() !== prevDataUrl }catch(e){ return false }
  }, afterUndo, { timeout: 8000 })
  const afterRedo = await page.evaluate(() => {
    const c = document.querySelector('canvas') as HTMLCanvasElement | null
    return c ? c.toDataURL() : ''
  })

  // write artifacts for debugging
  let diffPixelsTotal = -1
  try{
    const outDir = path.resolve(process.cwd(), 'test-results', `draw-artifacts-${Date.now()}`)
    const writeDataUrl = (dataUrl: string, outPath: string) => {
      const matches = dataUrl.match(/^data:image\/png;base64,(.*)$/)
      if (!matches) return
      const b = Buffer.from(matches[1], 'base64')
      fs.mkdirSync(path.dirname(outPath), { recursive: true })
      fs.writeFileSync(outPath, b)
    }
    writeDataUrl(after, path.join(outDir, 'after.png'))
    writeDataUrl(afterRedo, path.join(outDir, 'afterRedo.png'))
    // generate pixel diff
    try{
      const imgA = (PNG as any).sync.read(fs.readFileSync(path.join(outDir, 'after.png')))
      const imgB = (PNG as any).sync.read(fs.readFileSync(path.join(outDir, 'afterRedo.png')))
      if (imgA.width === imgB.width && imgA.height === imgB.height){
        const diff = new PNG({ width: imgA.width, height: imgA.height })
        diffPixelsTotal = pixelmatch(imgA.data, imgB.data, diff.data, imgA.width, imgA.height, { threshold: 0.1 })
        fs.writeFileSync(path.join(outDir, 'diff.png'), (PNG as any).sync.write(diff))
        fs.writeFileSync(path.join(outDir, 'meta.json'), JSON.stringify({ diffPixels: diffPixelsTotal }, null, 2))
        console.log('Wrote draw artifacts to', outDir, 'diffPixels=', diffPixelsTotal)
      }
    }catch(e){ console.warn('could not generate diff', e) }
  }catch(e){ console.warn('could not write artifacts', e) }

  // fall back to a pixel-accurate comparison instead of strict base64 string equality
  try{
    if (diffPixelsTotal === -1) {
      // compute directly from data URLs in memory
      const bufA = Buffer.from(after.replace(/^data:image\/png;base64,/, ''), 'base64')
      const bufB = Buffer.from(afterRedo.replace(/^data:image\/png;base64,/, ''), 'base64')
      const imgA = (PNG as any).sync.read(bufA)
      const imgB = (PNG as any).sync.read(bufB)
      if (imgA.width === imgB.width && imgA.height === imgB.height){
        const diff = new PNG({ width: imgA.width, height: imgA.height })
        diffPixelsTotal = pixelmatch(imgA.data, imgB.data, diff.data, imgA.width, imgA.height, { threshold: 0.1 })
      }
    }
  }catch(e){ console.warn('pixel compare failed', e) }

  expect(diffPixelsTotal).toBe(0)
})
