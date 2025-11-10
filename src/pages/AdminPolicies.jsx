import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function AdminPolicies(){
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(()=>{
    let cancelled = false
    fetch('/policy.json', { credentials: 'include' })
      .then(r => r.json())
      .then(j => { if (!cancelled) setData(j) })
      .catch(e => { if (!cancelled) setError(e.message || 'failed') })
    return ()=> { cancelled = true }
  }, [])

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

      {error && <div className="text-red-600">Error: {error}</div>}

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

          <div className="mt-4">
            <h3 className="font-medium">Raw JSON</h3>
            <pre className="overflow-auto max-h-80 bg-slate-50 p-3 rounded text-sm">{JSON.stringify(data, null, 2)}</pre>
          </div>
        </section>
      )}
    </div>
  )
}
