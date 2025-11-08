import React, { useState } from 'react'
import { useToast } from './ToastContext'

export default function AuthModal({ open, onClose, onSuccess }){
  const [tab, setTab] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const toast = useToast()

  if (!open) return null

  async function submit(e){
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try{
      const url = tab === 'login' ? '/api/auth/login' : '/api/auth/register'
      const payload = tab === 'login' ? { email, password } : { email, password, name }
      const headers = { 'Content-Type': 'application/json' }
      // include CSRF header when present (register/login don't require it but harmless)
      try{ const t = (await import('../utils/csrf')).getCsrfToken(); if (t) headers['X-CSRF-Token'] = t }catch(e){}
      const res = await fetch(url, {
        method: 'POST',
        credentials: 'include',
        headers,
        body: JSON.stringify(payload)
      })
      const body = await res.json()
      if (!res.ok) throw new Error(body && body.message ? body.message : 'Authentication failed')
      // server sets httpOnly cookie; body may contain roomId
      toast.show(tab === 'login' ? 'Signed in' : 'Account created', { type: 'success' })
      onClose()
      onSuccess && onSuccess(body && body.roomId ? body.roomId : null)
    }catch(err){
      toast.show(err.message || 'Authentication failed', { type: 'error' })
    }finally{ setLoading(false) }
  }
  const [error, setError] = useState('')

  function validate(){
    setError('')
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return setError('Please enter a valid email')
    if (!password || password.length < 8) return setError('Password must be at least 8 characters')
    // basic strength: number + letter
    if (!/[0-9]/.test(password) || !/[a-zA-Z]/.test(password)) return setError('Password should include letters and numbers')
    return true
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{tab === 'login' ? 'Sign in' : 'Create account'}</h3>
          <button aria-label="Close" onClick={onClose} className="text-slate-500">✕</button>
        </div>
        <div className="mb-4">
          <nav className="flex gap-2">
            <button onClick={()=>setTab('login')} className={`px-3 py-1 rounded ${tab==='login' ? 'bg-slate-100' : ''}`}>Sign in</button>
            <button onClick={()=>setTab('register')} className={`px-3 py-1 rounded ${tab==='register' ? 'bg-slate-100' : ''}`}>Register</button>
          </nav>
        </div>

        <form onSubmit={submit} className="space-y-3">
          {tab === 'register' && (
            <input required placeholder="Name" value={name} onChange={e=>setName(e.target.value)} className="w-full p-2 border rounded" />
          )}
          <input required type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full p-2 border rounded" />
          <input required type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full p-2 border rounded" />
          {error && <div className="text-sm text-red-600">{error}</div>}
          <div className="flex items-center justify-end">
            <button type="submit" className="px-4 py-2 rounded bg-indigo-600 text-white" disabled={loading}>{loading ? 'Please wait…' : (tab==='login' ? 'Sign in' : 'Create')}</button>
            <button type="button" onClick={()=>{ onClose(); onSuccess && onSuccess(null) }} className="text-sm text-slate-600">Continue as guest</button>
          </div>
          <div className="pt-2 border-t mt-2">
            <div className="text-sm text-slate-500 mb-2">Or sign in with</div>
            <div className="flex gap-2">
              <button type="button" onClick={()=>{
                // redirect to server oauth (if configured)
                fetch('/api/auth/oauth/google').then(r=>{
                  if (r.status === 501) toast.show('Google OAuth not configured on server', { type: 'info' })
                  else window.location = '/api/auth/oauth/google'
                }).catch(()=> toast.show('OAuth not available', { type: 'error' }))
              }} className="px-3 py-2 border rounded">Google</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
