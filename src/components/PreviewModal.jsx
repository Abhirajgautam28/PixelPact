import React, { useEffect } from 'react'

export default function PreviewModal({open, onClose, title, img, desc, onOpen}){
  useEffect(()=>{
    function onKey(e){ if(e.key === 'Escape') onClose && onClose() }
    if(open) document.addEventListener('keydown', onKey)
    return ()=> document.removeEventListener('keydown', onKey)
  },[open, onClose])

  if(!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" role="dialog" aria-modal="true">
      <div className="bg-white rounded-lg max-w-3xl w-full mx-4 overflow-hidden shadow-xl transform transition-all duration-200 scale-95 opacity-0 modal-animate">
        <div className="flex items-start justify-between p-4 border-b">
          <div>
            <h3 className="text-lg font-semibold">{title}</h3>
            {desc && <p className="text-sm text-slate-600 mt-1">{desc}</p>}
          </div>
          <button aria-label="Close preview" className="text-slate-500" onClick={onClose}>✕</button>
        </div>
        <div className="p-4">
          {img ? (
            <img src={img} alt={`${title} preview`} className="w-full h-80 object-cover rounded" />
          ) : (
            <div className="w-full h-80 bg-slate-100 rounded flex items-center justify-center text-slate-400">No preview</div>
          )}
        </div>
        <div className="p-4 flex justify-end gap-2 border-t">
          <button className="px-4 py-2 rounded-md border" onClick={onClose}>Close</button>
          <button className="px-4 py-2 rounded-md bg-[#6C5CE7] text-white" onClick={() => onOpen && onOpen()}>Open in editor</button>
        </div>
      </div>
    </div>
  )
}
