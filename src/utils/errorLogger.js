// Lightweight client-side error logger.
// Attempts to send errors to /api/logs via navigator.sendBeacon or fetch.
export async function logRouteError(err, meta = {}){
  try{
    if (typeof window === 'undefined') return
    const payload = {
      type: 'route-error',
      message: err && (err.message || String(err)) || 'unknown',
      stack: err && err.stack || null,
      meta,
      ts: new Date().toISOString()
    }
    const url = '/api/logs'
    const data = JSON.stringify(payload)
    // prefer sendBeacon for reliability on unload
    if (navigator && typeof navigator.sendBeacon === 'function'){
      try{
        const blob = new Blob([data], { type: 'application/json' })
        navigator.sendBeacon(url, blob)
        return
      }catch(e){ /* fall back to fetch */ }
    }
    // fallback to fetch (fire-and-forget)
    fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: data }).catch(()=>{})
  }catch(e){
    // swallow logger errors
     
    console.warn('logRouteError failed', e)
  }
}

export async function logUnhandledError(err, meta = {}){
  try{
    if (typeof window === 'undefined') return
    const payload = {
      type: 'unhandled-error',
      message: err && (err.message || String(err)) || 'unknown',
      stack: err && err.stack || null,
      meta,
      ts: new Date().toISOString()
    }
    const url = '/api/logs'
    const data = JSON.stringify(payload)
    if (navigator && typeof navigator.sendBeacon === 'function'){
      try{
        const blob = new Blob([data], { type: 'application/json' })
        navigator.sendBeacon(url, blob)
        return
      }catch(e){ }
    }
    fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: data }).catch(()=>{})
  }catch(e){
     
    console.warn('logUnhandledError failed', e)
  }
}
