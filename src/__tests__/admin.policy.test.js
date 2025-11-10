import request from 'supertest'
import fs from 'fs'
import path from 'path'
import { describe, test, expect, beforeEach, afterAll } from 'vitest'
import app, { server } from '../../server/index.js'

const POLICY_FILE = path.resolve(process.cwd(), 'server', 'policy.json')
const ADMIN = process.env.ADMIN_TOKEN || 'dev-admin-token'

function rmIfExists(p){ if (fs.existsSync(p)) fs.unlinkSync(p) }

describe('Admin policy endpoints', ()=>{
  beforeEach(()=>{
    // ensure a clean state
    rmIfExists(POLICY_FILE)
    rmIfExists(POLICY_FILE + '.tmp')
  })

  afterAll(()=>{
    try{ if (server && server.listening) server.close() }catch(e){}
  })

  test('GET /policy.json returns fallback when missing', async ()=>{
    const res = await request(app).get('/policy.json')
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('privacy')
    expect(res.body).toHaveProperty('terms')
  })

  test('POST /api/admin/policy with admin token writes file atomically and GET returns same', async ()=>{
    const payload = {
      updatedAt: '2025-11-11',
      privacy: { effective: '2025-11-11', path: '/privacy' },
      terms: { effective: '2025-11-11', path: '/terms' },
      changelog: [ { date: '2025-11-11', title: 'Test update' } ],
      source: '/privacy'
    }

    const post = await request(app).post('/api/admin/policy').set('Authorization', ADMIN).send(payload)
    expect(post.status).toBe(200)
    // tmp file should not remain
    expect(fs.existsSync(POLICY_FILE + '.tmp')).toBe(false)
    expect(fs.existsSync(POLICY_FILE)).toBe(true)

    const raw = fs.readFileSync(POLICY_FILE, 'utf8')
    const saved = JSON.parse(raw)
    expect(saved.updatedAt).toBe('2025-11-11')

    const get = await request(app).get('/policy.json')
    expect(get.status).toBe(200)
    expect(get.body.updatedAt).toBe('2025-11-11')
  })
})
