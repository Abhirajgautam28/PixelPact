import React, {useState} from 'react'

export default function Demo(){
  const [started, setStarted] = useState(false)
  return (
    <section>
      <h2 className="text-2xl font-semibold">Demo</h2>
      <p className="mt-2 text-slate-700">Try a lightweight mock session below.</p>
      <div className="mt-6">
        <button onClick={()=> setStarted(s=>!s)} className="px-4 py-2 rounded-md bg-[#6C5CE7] text-white">{started? 'End demo':'Start demo'}</button>
      </div>
      {started && <div className="mt-6 p-6 glass">Demo session running — this area would host a live demo canvas.</div>}
    </section>
  )
}
