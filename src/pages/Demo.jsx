import React, { useRef, useEffect, useState } from 'react'

function Canvas({ className }){
  const canvasRef = useRef(null)
  const [drawing, setDrawing] = useState(false)
  const [color, setColor] = useState('#111827')
  const [lineWidth, setLineWidth] = useState(3)

  useEffect(()=>{
    const c = canvasRef.current
    if(!c) return
    let ctx = null
    try { ctx = c.getContext('2d') } catch (e) { ctx = null }
    const resize = ()=>{
      if (!c) return
      const { width, height } = c.getBoundingClientRect()
      const ratio = window.devicePixelRatio || 1
      c.width = Math.floor(width * ratio)
      c.height = Math.floor(height * ratio)
      if (ctx && typeof ctx.scale === 'function') {
        ctx.scale(ratio, ratio)
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
      }
    }
    resize()
    window.addEventListener('resize', resize)
    return ()=> window.removeEventListener('resize', resize)
  }, [])

  useEffect(()=>{
    const c = canvasRef.current
    if(!c) return
    let ctx = null
    try { ctx = c.getContext('2d') } catch (e) { ctx = null }
    if (!ctx) return
    ctx.strokeStyle = color
    ctx.lineWidth = lineWidth
  }, [color, lineWidth])

  function getPos(e){
    const rect = canvasRef.current.getBoundingClientRect()
    return {
      x: (e.clientX ?? e.touches?.[0]?.clientX) - rect.left,
      y: (e.clientY ?? e.touches?.[0]?.clientY) - rect.top
    }
  }

  let last = useRef(null)
  function start(e){
    setDrawing(true)
    const pos = getPos(e)
    last.current = pos
  }
  function move(e){
    if(!drawing) return
    const pos = getPos(e)
    let ctx = null
    try { ctx = canvasRef.current.getContext('2d') } catch (err) { ctx = null }
    if (!ctx) return
    ctx.strokeStyle = color
    ctx.lineWidth = lineWidth
    ctx.beginPath()
    ctx.moveTo(last.current.x, last.current.y)
    ctx.lineTo(pos.x, pos.y)
    ctx.stroke()
    last.current = pos
  }
  function end(){ setDrawing(false); last.current = null }
  function clear(){
    const c = canvasRef.current
    let ctx = null
    try { ctx = c.getContext('2d') } catch (err) { ctx = null }
    if (!ctx) return
    ctx.clearRect(0,0,c.width,c.height)
  }

  return (
    <div className={className}>
      <div className="flex gap-3 items-center mb-3">
        <label className="text-sm">Color</label>
        <input aria-label="color" type="color" value={color} onChange={e=>setColor(e.target.value)} />
        <label className="text-sm ml-2">Brush</label>
        <input aria-label="width" type="range" min={1} max={12} value={lineWidth} onChange={e=>setLineWidth(+e.target.value)} />
        <button onClick={clear} className="ml-auto px-3 py-1 rounded bg-slate-100">Clear</button>
      </div>
      <div className="rounded border border-slate-200 overflow-hidden" style={{height: '360px'}}>
        <canvas
          role="img"
          aria-label="demo-canvas"
          ref={canvasRef}
          onMouseDown={start}
          onMouseMove={move}
          onMouseUp={end}
          onMouseLeave={end}
          onTouchStart={start}
          onTouchMove={move}
          onTouchEnd={end}
          style={{width: '100%', height: '100%', touchAction: 'none'}}
        />
      </div>
    </div>
  )
}

export default function Demo(){
  return (
    <section>
      <h2 className="text-2xl font-semibold">Demo</h2>
      <p className="mt-2 text-slate-700">Try a small interactive drawing canvas below — click/touch and drag to draw.</p>
      <div className="mt-6">
        <div className="glass p-4">
          <Canvas />
        </div>
      </div>
    </section>
  )
}
