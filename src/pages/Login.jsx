import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

export default function Login(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const nav = useNavigate()

  async function submit(e){
    e.preventDefault()
    setLoading(true)
    try{
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ email, password })
      })
      if (!res.ok) throw new Error('Login failed')
      const body = await res.json()
      localStorage.setItem('token', body.token)
      nav(`/board/${body.roomId || 'new'}`)
    }catch(err){
      alert(err.message)
    }finally{ setLoading(false) }
  }

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl font-semibold">Sign in</h2>
      <form className="mt-4 space-y-3" onSubmit={submit}>
        <input required type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full p-2 border rounded" />
        <input required type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full p-2 border rounded" />
        <div className="flex items-center justify-between">
          <button className="px-4 py-2 rounded bg-indigo-600 text-white" disabled={loading}>{loading? 'Signing in…':'Sign in'}</button>
          <Link to="/register" className="text-sm text-slate-600">Create account</Link>
        </div>
      </form>
    </div>
  )
}
