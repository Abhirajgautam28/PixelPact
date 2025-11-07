import React, { useEffect } from 'react'

export default function AdminDrawer({ open, onClose, title = 'Admin panel', children }){
  useEffect(()=>{
    function onKey(e){ if (e.key === 'Escape') onClose && onClose() }
    if (open) document.addEventListener('keydown', onKey)
    return ()=> document.removeEventListener('keydown', onKey)
  },[open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <aside className="ml-auto w-full max-w-2xl h-full bg-white shadow-xl overflow-auto transform transition-transform duration-300">
        <div className="p-4 border-b flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">{title}</h3>
            <div className="text-xs text-slate-500">Site admin</div>
          </div>
          <div>
            <button className="px-3 py-1 rounded border" onClick={onClose}>Close</button>
          </div>
        </div>
        <div className="p-4">
          {children}
        </div>
      </aside>
    </div>
  )
}
