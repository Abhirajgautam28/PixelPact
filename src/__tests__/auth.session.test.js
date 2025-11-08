import request from 'supertest'
import { describe, test, expect, afterAll } from 'vitest'
import app, { server } from '../../server/index.js'

describe('Auth + session flow', ()=>{
  afterAll(()=>{
    try{ if (server && server.listening) server.close() }catch(e){}
  })

  test('register sets cookie and allows creating room with cookie', async ()=>{
    const agent = request.agent(app)
    const email = `test+${Date.now()}@example.com`
    const res = await agent.post('/api/auth/register').send({ email, password: 'Passw0rd1', name: 'Test' })
    expect([200,201,204].includes(res.status)).toBe(true)
    // server should set cookie header
    const setCookie = res.headers['set-cookie']
    expect(setCookie).toBeTruthy()

    // now create room using the same agent (cookies preserved)
    const create = await agent.post('/api/rooms').send({})
    expect(create.status).toBe(200)
    expect(create.body && create.body.roomId).toBeTruthy()
  })
})
