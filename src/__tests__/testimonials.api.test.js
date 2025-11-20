import request from 'supertest'
import { app, server } from '../../server/index.js'
import { describe, it, expect, afterAll } from 'vitest'

describe('Testimonials API', () => {
  const adminToken = 'dev-admin-token'

  afterAll(() => {
    server.close()
  })

  it('allows clearing the role field (setting it to empty string)', async () => {
    // 1. Create a testimonial
    const createRes = await request(app)
      .post('/api/testimonials')
      .set('Authorization', adminToken)
      .send({ name: 'Test User', role: 'Developer', text: 'Initial text' })

    expect(createRes.status).toBe(200)
    const testimonials = createRes.body
    const index = testimonials.length - 1
    expect(testimonials[index].role).toBe('Developer')

    // 2. Update it with empty role
    const updateRes = await request(app)
      .put(`/api/testimonials/${index}`)
      .set('Authorization', adminToken)
      .send({ role: '' })

    expect(updateRes.status).toBe(200)
    const updatedTestimonials = updateRes.body

    // 3. Verify role is empty
    expect(updatedTestimonials[index].role).toBe('')
    expect(updatedTestimonials[index].name).toBe('Test User') // Should preserve name
  })
})
