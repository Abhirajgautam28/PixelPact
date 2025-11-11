import React, { useState } from 'react'
import { useToast } from '../components/ToastContext'
import { useNavigate, Link } from 'react-router-dom'

export default function Register(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const nav = useNavigate()
  const toast = useToast()

  async function submit(e){
    e.preventDefault()
    setLoading(true)
    try{
      // client-side validation
      if (!name || !name.trim()) throw new Error('Please enter your name')
      if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error('Please enter a valid email')
      if (!password || password.length < 8) throw new Error('Password must be at least 8 characters')

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        credentials: 'include',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ email, password, name })
      })
      // try to parse server response for helpful messages
      let body = null
      try{ body = await res.json() }catch(e){ /* non-json response */ }
      if (!res.ok) {
        const serverMsg = body && (body.message || body.error || body.msg) ? (body.message || body.error || body.msg) : res.statusText || 'Registration failed'
        throw new Error(serverMsg)
      }
      // server sets httpOnly cookie and may return a roomId
      nav(`/board/${(body && body.roomId) || 'new'}`)
    }catch(err){
      toast.show(err.message || 'Registration failed', { type: 'error' })
    }finally{ setLoading(false) }
  }

  return (
    <main className="space-y-12" role="main" aria-labelledby="register-heading">
      <header className="text-center max-w-4xl mx-auto">
        <h1 id="register-heading" className="text-3xl font-extrabold">Create an account</h1>
        <p className="mt-2 text-slate-600">Join PixelPact to collaborate on whiteboards, templates and more.</p>
      </header>

  <section className="max-w-md mx-auto glass p-6 shadow-elevation-1">
        <form className="mt-2 space-y-4" onSubmit={submit} aria-labelledby="register-heading" role="form">
          <label htmlFor="name" className="sr-only">Full name</label>
            <input id="name" name="name" autoComplete="name" required placeholder="Name" value={name} onChange={e=>setName(e.target.value)} className="w-full p-3 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30" disabled={loading} autoFocus />

          <label htmlFor="email" className="sr-only">Email</label>
          <input id="email" name="email" type="email" autoComplete="email" required placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full p-3 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30" disabled={loading} />

          <label htmlFor="password" className="sr-only">Password</label>
          <input id="password" name="password" type="password" autoComplete="new-password" required placeholder="Password (min 8 chars)" value={password} onChange={e=>setPassword(e.target.value)} className="w-full p-3 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30" disabled={loading} />

          <div className="flex items-center justify-between">
            <button type="submit" className="px-4 py-2 rounded bg-primary text-white disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary/30" aria-busy={loading} disabled={loading}>{loading? 'Creating…':'Create account'}</button>
            <Link to="/login" className="text-sm text-slate-600">Already have an account?</Link>
          </div>
        </form>
      </section>
    </main>
  )
}