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

    // parse csrf-token cookie and include as header for double-submit validation
    const cookies = res.headers['set-cookie'] || []
    let csrf = null
    for (const c of cookies){
      const m = c.match(/csrf-token=([^;]+)/)
      if (m) { csrf = decodeURIComponent(m[1]); break }
    }
    const req = agent.post('/api/rooms')
    if (csrf) req.set('X-CSRF-Token', csrf)
    const create = await req.send({})
    expect(create.status).toBe(200)
    expect(create.body && create.body.roomId).toBeTruthy()
  })
})
