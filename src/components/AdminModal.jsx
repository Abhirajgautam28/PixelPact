import React, { useState, Suspense, lazy, useEffect } from 'react'

const AdminPanel = lazy(()=> import('../pages/AdminTestimonials'))

export default function AdminModal({ envMode = import.meta.env.MODE }){
  const [open, setOpen] = useState(false)

  // Show only when non-production or explicitly enabled
  const enabled = (envMode !== 'production') || (import.meta.env.VITE_ENABLE_ADMIN === 'true')

  useEffect(()=>{
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return ()=> { document.body.style.overflow = '' }
  }, [open])

  if (!enabled) return null

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-semibold">Admin</h3>
          <p className="text-slate-600 mt-2">Manage testimonials and site data. This panel requires an admin token or password and runs in-browser.</p>
        </div>
        <div>
          <button onClick={()=> setOpen(true)} className="px-3 py-2 rounded-md border">Open Admin</button>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={()=> setOpen(false)} aria-hidden="true" />
          <div role="dialog" aria-modal="true" className="relative w-[min(900px,95%)] max-h-[85vh] overflow-auto modal-animate">
            <div className="glass p-4">
              <div className="flex items-start justify-between mb-3">
                <h4 className="text-lg font-semibold">Site Admin</h4>
                <button aria-label="Close admin" onClick={()=> setOpen(false)} className="px-2 py-1 rounded border">Close</button>
              </div>

              <Suspense fallback={<div className="text-sm text-slate-500">Loading admin…</div>}>
                <AdminPanel />
              </Suspense>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
