import request from 'supertest'
import fs from 'fs'
import path from 'path'
import { describe, test, expect, beforeEach, afterAll } from 'vitest'
import app, { server } from '../../server/index.js'

const TEST_FILE = path.resolve(process.cwd(), 'server', 'testimonials.json')
const ADMIN = process.env.ADMIN_TOKEN || 'dev-admin-token'

function writeFile(arr){
  fs.writeFileSync(TEST_FILE, JSON.stringify(arr, null, 2), 'utf8')
}

describe('Testimonials admin endpoints', ()=>{
  beforeEach(()=>{
    writeFile([
      { name: 'Alice', role: 'PM', text: 'Initial testimonial' }
    ])
  })

  // Ensure we close the server if it was started by the module (older behavior); safe even if not listening.
  afterAll(()=>{
    try{
      if (server && server.listening) server.close()
    }catch(e){ /* ignore */ }
  })

  test('GET /api/testimonials returns array', async ()=>{
    const res = await request(app).get('/api/testimonials')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body.length).toBeGreaterThanOrEqual(0)
  })

  test('POST without auth returns 401', async ()=>{
    const res = await request(app).post('/api/testimonials').send({ name: 'X', text: 'Y' })
    expect(res.status).toBe(401)
  })

  test('POST with invalid body returns 400', async ()=>{
    const res = await request(app).post('/api/testimonials').set('Authorization', ADMIN).send({ name: '', text: '' })
    expect(res.status).toBe(400)
  })

  test('POST with valid body adds testimonial', async ()=>{
    const res = await request(app).post('/api/testimonials').set('Authorization', ADMIN).send({ name: 'Bob', role: 'Dev', text: 'Great!' })
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body.find(t=> t.name === 'Bob')).toBeTruthy()
  })

  test('PUT updates testimonial', async ()=>{
    const res = await request(app).put('/api/testimonials/0').set('Authorization', ADMIN).send({ name: 'Alice Updated', text: 'Updated text' })
    expect(res.status).toBe(200)
    const body = res.body
    expect(body[0].name).toBe('Alice Updated')
  })

  test('DELETE removes testimonial', async ()=>{
    const res = await request(app).delete('/api/testimonials/0').set('Authorization', ADMIN)
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body.find(t=> t.name === 'Alice')).toBeFalsy()
  })
})
