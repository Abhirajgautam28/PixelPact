import React, { useEffect } from 'react'
import { Link, useRouteError, useLocation } from 'react-router-dom'
import { logRouteError } from '../utils/errorLogger'

export default function RouteError(){
  const err = useRouteError()
  const loc = useLocation()

  useEffect(()=>{
    try{
      logRouteError(err, { path: loc?.pathname })
    }catch(e){ /* ignore */ }
  }, [err, loc?.pathname])
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-3xl w-full bg-white rounded shadow p-6">
        <h2 className="text-2xl font-bold">Unexpected Application Error</h2>
        <p className="mt-2 text-slate-600">The page failed to load. You can try reloading, return to the homepage, or copy the error details to investigate.</p>

        <div className="mt-4 flex gap-2">
          <button className="px-4 py-2 rounded bg-primary text-white" onClick={()=> window.location.reload()}>Reload</button>
          <Link to="/" className="px-4 py-2 rounded border">Go home</Link>
          <button className="px-4 py-2 rounded border" onClick={()=> { navigator.clipboard && navigator.clipboard.writeText(String(err)) }}>Copy error</button>
        </div>

        {import.meta.env.MODE !== 'production' && (
          <details className="mt-4 text-xs text-slate-500 whitespace-pre-wrap">
            <summary className="cursor-pointer">Error details (dev)</summary>
            <pre className="mt-2 text-[12px] text-slate-700">{String(err && (err.message || err))}</pre>
          </details>
        )}
      </div>
    </div>
  )
}
