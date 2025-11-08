import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const ToastContext = createContext(null)

let idCounter = 1

export function ToastProvider({ children }){
  const [toasts, setToasts] = useState([])

  const show = useCallback((message, opts = {}) => {
    const id = String(idCounter++)
    const toast = { id, message, type: opts.type || 'info', duration: opts.duration ?? 4000 }
    setToasts(t => [...t, toast])
    if (toast.duration > 0) setTimeout(()=> setToasts(t => t.filter(x=> x.id !== id)), toast.duration)
    return id
  }, [])

  const remove = useCallback((id) => setToasts(t => t.filter(x=> x.id !== id)), [])

  const value = useMemo(()=> ({ show, remove }), [show, remove])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div aria-live="polite" className="fixed right-4 bottom-4 z-60 flex flex-col gap-2">
        {toasts.map(t => (
          <div key={t.id} className={`p-3 rounded shadow-md max-w-xs text-sm ${t.type === 'error' ? 'bg-red-50 text-red-800' : 'bg-slate-50 text-slate-800'}`}>
            {t.message}
            <button aria-label="dismiss" onClick={()=> remove(t.id)} className="ml-2 text-xs opacity-60">✕</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(){
  const ctx = useContext(ToastContext)
  if (!ctx) {
    // tests or non-wrapped renders: provide a harmless fallback to avoid throwing
    return { show: (m, o) => { if (typeof console !== 'undefined') console.warn('[toast]', m) }, remove: ()=>{} }
  }
  return ctx
}

export default ToastProvider
