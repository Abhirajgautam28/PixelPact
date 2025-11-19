import { test, expect } from '@playwright/test'

async function waitForBackendReady(request, opts = {}){
  const url = opts.url || 'http://localhost:3001/api/_health'
  for (let i=0;i<20;i++){
    try{
      const r = await request.get(url)
      if (r.ok()) return true
    }catch(e){}
    await new Promise(r=>setTimeout(r, 300))
  }
  return false
}

test('invite token is single-use: second exchange returns 410', async ({ request }) => {
  // Ensure backend is available (CI starts the server); do not spawn the server from the test.
  const ok = await waitForBackendReady(request)
  if (!ok) throw new Error('backend not ready: http://localhost:3001/api/_health')
  // create a room first
  const r = await request.post('http://localhost:3001/api/rooms', { data: {} })
  expect(r.ok()).toBeTruthy()
  const b = await r.json()
  const roomId = b.roomId || b.id || b._id
  expect(roomId).toBeTruthy()

  // create invite
  const inv = await request.post(`http://localhost:3001/api/rooms/${roomId}/invite`, { data: {} })
  expect(inv.ok()).toBeTruthy()
  const invBody = await inv.json()
  expect(invBody.invite).toBeTruthy()
  const token = invBody.invite

  // first exchange should succeed (200)
  const ex1 = await request.post('http://localhost:3001/api/rooms/join-invite', {
    data: JSON.stringify({ invite: token }),
    headers: { 'Content-Type': 'application/json' }
  })
  if (!ex1.ok()){
    const txt = await ex1.text().catch(()=>'<no-body>')
    console.log('DEBUG join-invite first response:', ex1.status(), txt)
  }
  expect(ex1.ok()).toBeTruthy()

  // extract CSRF token from Set-Cookie so we can present it on subsequent requests
  let csrfToken = null
  try{
    const sc = ex1.headers()['set-cookie'] || ex1.headers()['Set-Cookie']
    if (sc){
      const m = Array.isArray(sc) ? sc.join(';') : sc
      const cm = /csrf-token=([^;]+)/.exec(m)
      if (cm) csrfToken = decodeURIComponent(cm[1])
    }
  }catch(e){}

  // second exchange should return 410 (used)
  const ex2Headers = { 'Content-Type': 'application/json' }
  if (csrfToken) ex2Headers['x-csrf-token'] = csrfToken
  const ex2 = await request.post('http://localhost:3001/api/rooms/join-invite', {
    data: JSON.stringify({ invite: token }),
    headers: ex2Headers
  })
  expect(ex2.status()).toBe(410)
  // no spawned server to clean up in CI mode
})
