import React, {useState, useEffect} from 'react'

const rotating = [
  'Sketch together ✏️',
  'Prototype faster ⚡',
  'Share & iterate 🔁',
  'Present beautifully 🎨'
]

export default function Home(){
  const [idx, setIdx] = useState(0)
  useEffect(()=>{
    const t = setInterval(()=> setIdx(i=> (i+1)%rotating.length), 2200)
    return ()=> clearInterval(t)
  },[])

  return (
    <section>
      <div className="grid lg:grid-cols-2 gap-10 items-center">
        <div>
          <h2 className="text-4xl font-extrabold accent-heading">PixelPact — where teams create together</h2>
          <p className="mt-4 text-slate-700 max-w-xl">A modern collaborative whiteboard with realtime sync, beautiful templates, and extensible tools. <span className="emoji">✨</span></p>

          <div className="mt-6">
            <div className="inline-flex items-center gap-3 p-3 bg-gradient-to-r from-[#fff4e6] to-[#eefbff] rounded-full">
              <strong className="text-[#ff7b7b]">{rotating[idx]}</strong>
              <span className="text-sm text-slate-500">• Live cursors • Layers • Undo/Redo</span>
            </div>
          </div>

          <div className="mt-8 flex gap-4">
            <button className="px-6 py-3 rounded-md bg-[#6C5CE7] text-white font-semibold">Create Room 🚀</button>
            <a href="/demo" className="px-6 py-3 rounded-md border border-slate-200 text-slate-700">Watch demo</a>
          </div>
        </div>

        <div>
          <div className="glass p-4">
            <div className="h-64 bg-white rounded-lg flex items-center justify-center text-slate-400">Interactive canvas preview (placeholder)</div>
          </div>
        </div>
      </div>
    </section>
  )
}
