import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

export default function Register(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const nav = useNavigate()

  async function submit(e){
    e.preventDefault()
    setLoading(true)
    try{
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ email, password, name })
      })
      if (!res.ok) throw new Error('Registration failed')
      const body = await res.json()
      // token in body.token
      localStorage.setItem('token', body.token)
      nav(`/board/${body.roomId || 'new'}`)
    }catch(err){
      alert(err.message)
    }finally{ setLoading(false) }
  }

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl font-semibold">Create an account</h2>
      <form className="mt-4 space-y-3" onSubmit={submit}>
        <input required placeholder="Name" value={name} onChange={e=>setName(e.target.value)} className="w-full p-2 border rounded" />
        <input required type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full p-2 border rounded" />
        <input required type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full p-2 border rounded" />
        <div className="flex items-center justify-between">
          <button className="px-4 py-2 rounded bg-indigo-600 text-white" disabled={loading}>{loading? 'Creating…':'Create account'}</button>
          <Link to="/login" className="text-sm text-slate-600">Already have an account?</Link>
        </div>
      </form>
    </div>
  )
}
