import request from 'supertest'
import app from '../index.js'

test('invite is single-use: first join 200 then 410 on reuse', async ()=>{
  const createRes = await request(app).post('/api/rooms').send({ name: 'test-room' })
  expect(createRes.status).toBe(200)
  const room = createRes.body && createRes.body.roomId || createRes.body && createRes.body.room && createRes.body.room._id
  expect(room).toBeTruthy()

  const invRes = await request(app).post(`/api/rooms/${room}/invite`).send({})
  expect(invRes.status).toBe(200)
  const token = invRes.body && (invRes.body.invite || invRes.body.token)
  expect(token).toBeTruthy()

  const join1 = await request(app).post('/api/rooms/join-invite').send({ invite: token })
  expect(join1.status).toBe(200)

  const join2 = await request(app).post('/api/rooms/join-invite').send({ invite: token })
  expect(join2.status).toBe(410)
})
