import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import AdminTestimonials from '../../src/pages/AdminTestimonials'
import { describe, test, vi, beforeEach, afterEach, expect } from 'vitest'

describe('AdminTestimonials UI', ()=>{
  beforeEach(()=>{
    // reset sessionStorage
    sessionStorage.clear()
  })

  afterEach(()=>{
    // restore fetch
    if (global.fetch && global.fetch.mockRestore) global.fetch.mockRestore()
  })

  test('attemptLogin exchanges password for token and stores Bearer token', async ()=>{
    // Mock fetch: first call to /api/testimonials (on load), second to /api/admin/login
    const mockFetch = vi.fn()
    mockFetch
      .mockResolvedValueOnce({ ok: true, json: async ()=>[] })
      .mockResolvedValueOnce({ ok: true, json: async ()=>({ token: 'signed.jwt.token' }) })
    global.fetch = mockFetch

    render(<AdminTestimonials />)

    // Type password into input (placeholder text)
    const input = screen.getByPlaceholderText(/Admin password or token/i)
    fireEvent.change(input, { target: { value: 'dev-password' } })

    const btn = screen.getByRole('button', { name: /Login \/ Save/i })
    fireEvent.click(btn)

    // wait for token to be stored and UI to update
    await waitFor(()=>{
      expect(sessionStorage.getItem('adminToken')).toContain('Bearer ')
      expect(screen.getByText(/Logged in token:/i)).toBeInTheDocument()
    })
  })
})
