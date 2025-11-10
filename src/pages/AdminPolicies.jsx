import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function AdminPolicies(){
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [editing, setEditing] = useState('')
  const [token, setToken] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loginPwd, setLoginPwd] = useState('')
  const navigate = useNavigate()

  useEffect(()=>{
    let cancelled = false
    // check admin first
    fetch('/api/admin/me', { credentials: 'include' })
      .then(r => {
        if (r.status === 200) return r.json()
        throw new Error('not admin')
      })
      .then(j => { if (!cancelled) setIsAdmin(true) })
      .catch(()=>{
        // still attempt to fetch public policy.json for preview
        fetch('/policy.json', { credentials: 'include' })
          .then(r=> r.json())
          .then(j => { if (!cancelled) setData(j); if (!cancelled) setEditing(JSON.stringify(j, null, 2)) })
          .catch(e => { if (!cancelled) setError(e.message || 'failed') })
      })
    // if admin, also fetch policy.json
    fetch('/policy.json', { credentials: 'include' })
      .then(r=> r.json())
      .then(j => { if (!cancelled) { setData(j); setEditing(JSON.stringify(j, null, 2)) } })
      .catch(e => { if (!cancelled) setError(e.message || 'failed') })

    return ()=> { cancelled = true }
  }, [])

  async function handleLogin(e){
    e.preventDefault()
    try{
      const res = await fetch('/api/admin/login', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ password: loginPwd }) })
      const j = await res.json()
      if (res.status === 200 && j.token){
        setToken(j.token)
        setIsAdmin(true)
      } else {
        setError('Login failed')
      }
    }catch(err){ setError(err.message || 'login error') }
  }

  async function save(){
    setSaving(true)
    setError(null)
    try{
      const parsed = JSON.parse(editing)
      const headers = { 'Content-Type':'application/json' }
      if (token) headers.Authorization = `Bearer ${token}`
      const res = await fetch('/api/admin/policy', { method: 'POST', headers, body: JSON.stringify(parsed) })
      if (res.status === 200) {
        setData(parsed)
        setError(null)
      } else {
        const j = await res.json().catch(()=>({ message: 'save failed' }))
        setError(j.message || 'save failed')
      }
    }catch(err){ setError(err.message || 'invalid json') }
    setSaving(false)
  }

  function download(){
    if (!data) return
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'policy.json'
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Policy metadata</h1>
        <div className="flex items-center gap-2">
          <button className="btn" onClick={()=>navigate('/admin/testimonials')}>Back</button>
          <button className="btn btn-primary" onClick={download} disabled={!data}>Download JSON</button>
        </div>
      </div>

      {error && <div className="text-red-600 mb-3">Error: {error}</div>}

      {!isAdmin && (
        <form onSubmit={handleLogin} className="mb-4">
          <label className="block text-sm text-slate-700">Admin password to edit policies</label>
          <div className="flex gap-2 mt-2">
            <input value={loginPwd} onChange={e=>setLoginPwd(e.target.value)} className="input" type="password" placeholder="Admin password" />
            <button className="btn" type="submit">Login</button>
          </div>
        </form>
      )}

      {!data && !error && (
        <div className="text-sm text-slate-600">Loading…</div>
      )}

      {data && (
        <section className="bg-white border rounded p-4 shadow-sm">
          <h2 className="text-lg font-semibold">Summary</h2>
          <p className="text-slate-700">Last updated: <strong>{data.updatedAt || 'unknown'}</strong></p>

          <div className="mt-4">
            <h3 className="font-medium">Policies</h3>
            <ul className="list-disc pl-6 mt-2 text-slate-700">
              <li>Privacy effective: {data.privacy?.effective || 'n/a'} — <a className="text-sky-600" href="/privacy">View</a></li>
              <li>Terms effective: {data.terms?.effective || 'n/a'} — <a className="text-sky-600" href="/terms">View</a></li>
            </ul>
          </div>

          <div className="mt-4">
            <h3 className="font-medium">Changelog</h3>
            {Array.isArray(data.changelog) && data.changelog.length > 0 ? (
              <ol className="list-decimal pl-6 mt-2 text-slate-700">
                {data.changelog.map((c, idx)=> (
                  <li key={idx} className="mb-2">
                    <div className="font-medium">{c.date} — {c.title || c.summary}</div>
                    {c.details && <div className="text-sm text-slate-600">{c.details}</div>}
                  </li>
                ))}
              </ol>
            ) : (
              <div className="text-sm text-slate-600 mt-2">No changelog entries.</div>
            )}
          </div>

          {isAdmin && (
            <div className="mt-4">
              <h3 className="font-medium">Edit policy (JSON)</h3>
              <textarea className="w-full font-mono text-sm p-3 mt-2 border rounded" rows={14} value={editing} onChange={e=>setEditing(e.target.value)} />
              <div className="mt-3 flex items-center gap-2">
                <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
                <button className="btn" onClick={()=>{ setEditing(JSON.stringify(data, null, 2)); setError(null) }}>Reset</button>
              </div>
            </div>
          )}

          <div className="mt-4">
            <h3 className="font-medium">Raw JSON</h3>
            <pre className="overflow-auto max-h-80 bg-slate-50 p-3 rounded text-sm">{JSON.stringify(data, null, 2)}</pre>
          </div>
        </section>
      )}
    </div>
  )
}
