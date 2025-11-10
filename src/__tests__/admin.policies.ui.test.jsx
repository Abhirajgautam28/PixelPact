import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import AdminPolicies from '../../src/pages/AdminPolicies'
import { MemoryRouter } from 'react-router-dom'
import { describe, test, vi, beforeEach, afterEach, expect } from 'vitest'

describe('AdminPolicies UI', ()=>{
  beforeEach(()=>{
    // clear any stateful globals
    if (global.fetch && global.fetch.mockRestore) global.fetch.mockRestore()
  })

  afterEach(()=>{
    if (global.fetch && global.fetch.mockRestore) global.fetch.mockRestore()
  })

  test('loads policy, allows admin login and save', async ()=>{
    const sample = {
      updatedAt: '2025-11-10',
      privacy: { effective: '2025-11-10', path: '/privacy' },
      terms: { effective: '2025-11-10', path: '/terms' },
      changelog: []
    }

    // mock fetch sequence:
    // 1: GET /api/admin/me  -> 401
    // 2: GET /policy.json   -> sample
    // 3: (after login) POST /api/admin/login -> { token }
    // 4: POST /api/admin/policy -> 200

    const mockFetch = vi.fn()
    mockFetch
      .mockResolvedValueOnce({ status: 401 }) // /api/admin/me
      .mockResolvedValueOnce({ ok: true, json: async ()=> sample }) // /policy.json (first fetch in catch)
      .mockResolvedValueOnce({ ok: true, json: async ()=> sample }) // /policy.json (later fetch)
      .mockResolvedValueOnce({ status: 200, ok: true, json: async ()=> ({ token: 'test-token' }) }) // /api/admin/login
      .mockResolvedValueOnce({ status: 200, ok: true, json: async ()=> ({ ok: true }) }) // POST /api/admin/policy

    global.fetch = mockFetch

    render(
      <MemoryRouter>
        <AdminPolicies />
      </MemoryRouter>
    )

    // initial policy summary should appear
    await waitFor(()=> expect(screen.getByText(/Last updated:/i)).toBeInTheDocument())

    // Admin login form should be present
    const pwdInput = screen.getByPlaceholderText(/Admin password/i)
    fireEvent.change(pwdInput, { target: { value: 'dev-password' } })
    const loginBtn = screen.getByRole('button', { name: /Login/i })
    fireEvent.click(loginBtn)

    // wait for token to be set and edit area to appear
    await waitFor(()=> expect(screen.getByText(/Edit policy \(JSON\)/i)).toBeInTheDocument())

    // change the textarea and click Save
    const ta = screen.getByRole('textbox')
    fireEvent.change(ta, { target: { value: JSON.stringify({ ...sample, updatedAt: '2025-11-11' }, null, 2) } })
    const saveBtn = screen.getByRole('button', { name: /Save/i })
    fireEvent.click(saveBtn)

    // ensure fetch was called for save
    await waitFor(()=>{
      expect(mockFetch).toHaveBeenCalled()
      // last call was POST /api/admin/policy
    })

    // verify the UI reflects updated date (one or more places may contain the date)
    await waitFor(async ()=>{
      const matches = await screen.findAllByText(/2025-11-11/)
      expect(matches.length).toBeGreaterThan(0)
    })
  })
})
