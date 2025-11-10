import React, { useState } from 'react'
import { useToast } from '../components/ToastContext'
import { useNavigate, Link } from 'react-router-dom'

export default function Login(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const nav = useNavigate()
  const toast = useToast()

  async function submit(e){
    e.preventDefault()
    setLoading(true)
    try{
      // client validation
      if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error('Please enter a valid email')
      if (!password || password.length < 8) throw new Error('Password must be at least 8 characters')

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ email, password })
      })
      if (!res.ok) throw new Error('Login failed')
      const body = await res.json()
      // server sets httpOnly cookie; navigate to room if provided
      nav(`/board/${body.roomId || 'new'}`)
    }catch(err){
      toast.show(err.message || 'Login failed', { type: 'error' })
    }finally{ setLoading(false) }
  }

  return (
    <main className="space-y-12" role="main" aria-labelledby="login-heading">
      <header className="text-center max-w-4xl mx-auto">
        <h1 id="login-heading" className="text-3xl font-extrabold">Sign in</h1>
        <p className="mt-2 text-slate-600">Welcome back — sign in to continue to your rooms and boards.</p>
      </header>

  <section className="max-w-md mx-auto glass p-6 shadow-elevation-1">
        <form className="mt-2 space-y-4" onSubmit={submit} aria-labelledby="login-heading" role="form">
          <label htmlFor="login-email" className="sr-only">Email</label>
          <input id="login-email" name="email" required type="email" autoComplete="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full p-3 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" disabled={loading} autoFocus />

          <label htmlFor="login-password" className="sr-only">Password</label>
          <input id="login-password" name="password" required type="password" autoComplete="current-password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full p-3 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" disabled={loading} />

          <div className="flex items-center justify-between">
            <button type="submit" className="px-4 py-2 rounded bg-indigo-600 text-white disabled:opacity-50" aria-busy={loading} disabled={loading}>{loading? 'Signing in…':'Sign in'}</button>
            <Link to="/register" className="text-sm text-slate-600">Create account</Link>
          </div>
        </form>
      </section>
    </main>
  )
}

// no helper required; toast is provided via hook above
