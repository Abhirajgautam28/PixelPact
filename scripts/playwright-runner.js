// Lightweight E2E runner using Playwright core (not the @playwright/test runner)
// This avoids conflicts with test-runner environment in this repo.
const { chromium } = require('playwright');

async function main(){
  try{
    // create room via backend
    const resp = await fetch('http://localhost:3001/api/rooms', { method: 'POST' })
    if (!resp.ok) throw new Error('failed create room')
    const body = await resp.json()
    const roomId = body.roomId || body.id || body._id
    if (!roomId) throw new Error('no room id')

    const possiblePorts = [5173, 4173]
    let opened = false
    let page
    const browser = await chromium.launch()
    const context = await browser.newContext()
    page = await context.newPage()

    for (const p of possiblePorts){
      const url = `http://localhost:${p}/board/${roomId}`
      try{
        const r = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 5000 })
        if (r && r.status() < 400){ opened = true; break }
      }catch(e){ /* continue */ }
    }
    if (!opened) throw new Error('frontend not reachable on known ports')

    await page.waitForSelector('canvas', { timeout: 5000 })
    const title = await page.textContent('text=Whiteboard')
    console.log('Loaded board, title snippet:', title?.slice(0,40))
    await browser.close()
    console.log('E2E runner succeeded')
    process.exit(0)
  }catch(err){
    console.error('E2E runner failed:', err)
    process.exit(2)
  }
}

main()
