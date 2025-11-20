import { test } from '@playwright/test'
import fs from 'fs'
import path from 'path'
import { PNG } from 'pngjs'
import pixelmatch from 'pixelmatch'

test('debug draw: capture before/after/afterRedo and write diffs', async ({ page, browserName }) => {
  // create a room
  const resp = await page.request.post('http://127.0.0.1:3001/api/rooms', { data: {} })
  const body = await resp.json()
  const roomId = body.roomId || body.id || body._id

  const { waitForFrontend } = await import('./waitForFrontend')
  const base = await waitForFrontend(page, [5173, 4173], 30000)
  await page.goto(`${base}/board/${roomId}`, { waitUntil: 'load', timeout: 30000 })
  await page.waitForSelector('canvas, [aria-label="Whiteboard canvas"]', { timeout: 20000 })

  const canvas = page.locator('canvas')
  const box = await canvas.boundingBox()
  if (!box) throw new Error('canvas bounding box not available')

  // helper to write dataURL -> file
  const writeDataUrl = (dataUrl: string, outPath: string) => {
    const matches = dataUrl.match(/^data:image\/png;base64,(.*)$/)
    if (!matches) return
    const b = Buffer.from(matches[1], 'base64')
    fs.mkdirSync(path.dirname(outPath), { recursive: true })
    fs.writeFileSync(outPath, b)
  }

  const outDir = path.resolve(process.cwd(), 'test-results', `debug-${Date.now()}-${browserName}`)

  // capture before
  const before = await page.evaluate(() => {
    const c = document.querySelector('canvas') as HTMLCanvasElement | null
    return c ? c.toDataURL() : ''
  })
  writeDataUrl(before, path.join(outDir, 'before.png'))

  // draw
  const startX = Math.round(box.x + box.width / 3)
  const startY = Math.round(box.y + box.height / 2)
  const endX = startX + 80
  const endY = startY + 10

  await page.mouse.move(startX, startY)
  await page.mouse.down()
  await page.mouse.move(endX, endY, { steps: 6 })
  await page.mouse.up()
  await page.waitForTimeout(300)

  const after = await page.evaluate(() => {
    const c = document.querySelector('canvas') as HTMLCanvasElement | null
    return c ? c.toDataURL() : ''
  })
  writeDataUrl(after, path.join(outDir, 'after.png'))

  // undo/redo
  await page.keyboard.down('Control')
  await page.keyboard.press('z')
  await page.keyboard.up('Control')
  await page.waitForTimeout(300)

  await page.keyboard.down('Control')
  await page.keyboard.press('y')
  await page.keyboard.up('Control')
  await page.waitForTimeout(300)

  const afterRedo = await page.evaluate(() => {
    const c = document.querySelector('canvas') as HTMLCanvasElement | null
    return c ? c.toDataURL() : ''
  })
  writeDataUrl(afterRedo, path.join(outDir, 'afterRedo.png'))

  // note: we intentionally avoid importing extra native/image libs here so this test
  // can run in CI without installing extra dependencies. The test writes three PNG
  // artifacts to disk (before.png, after.png, afterRedo.png) for offline inspection.
  // compute pixel diff between after and afterRedo
  try{
  const imgA = (PNG as any).sync.read(fs.readFileSync(path.join(outDir, 'after.png')))
  const imgB = (PNG as any).sync.read(fs.readFileSync(path.join(outDir, 'afterRedo.png')))
    if (imgA.width !== imgB.width || imgA.height !== imgB.height) {
      fs.writeFileSync(path.join(outDir, 'meta.json'), JSON.stringify({ browserName, roomId, diffPixels: -1, note: 'size-mismatch' }, null, 2))
      console.log('Debug outputs written to', outDir, 'note=size-mismatch')
      return
    }
    const { width, height } = imgA
    const diff = new PNG({ width, height })
    const diffPixels = pixelmatch(imgA.data, imgB.data, diff.data, width, height, { threshold: 0.1 })
  fs.writeFileSync(path.join(outDir, 'diff-after-afterRedo.png'), (PNG as any).sync.write(diff))
    fs.writeFileSync(path.join(outDir, 'meta.json'), JSON.stringify({ browserName, roomId, diffPixels }, null, 2))
    console.log('Debug outputs written to', outDir, 'diffPixels=', diffPixels)
  }catch(e){
    console.warn('could not generate pixel diff', e)
    fs.writeFileSync(path.join(outDir, 'meta.json'), JSON.stringify({ browserName, roomId, error: String(e) }, null, 2))
  }
})
