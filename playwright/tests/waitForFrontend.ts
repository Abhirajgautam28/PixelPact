import { Page } from '@playwright/test'

export async function waitForFrontend(page: Page, ports: number[] = [5173, 4173], timeout = 30000) {
  const start = Date.now()
  const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))
  while (Date.now() - start < timeout) {
    for (const p of ports) {
      try {
        const url = `http://localhost:${p}/`
        const resp = await page.request.get(url)
        if (resp && resp.ok()) return `http://localhost:${p}`
      } catch (e) {
        // ignore and try next port
      }
    }
    await delay(500)
  }
  throw new Error(`Could not open frontend preview on known ports (${ports.join('/')})`)
}
