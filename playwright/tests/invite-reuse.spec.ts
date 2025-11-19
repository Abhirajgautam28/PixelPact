import { test, expect } from '@playwright/test'

test('invite token is single-use: second exchange returns 410', async ({ request }) => {
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
  expect(ex1.ok()).toBeTruthy()

  // second exchange should return 410 (used)
  const ex2 = await request.post('http://localhost:3001/api/rooms/join-invite', {
    data: JSON.stringify({ invite: token }),
    headers: { 'Content-Type': 'application/json' }
  })
  expect(ex2.status()).toBe(410)
})
