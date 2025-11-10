import React, { useRef, useEffect, useState } from 'react'

function Canvas({ className }){
  const canvasRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [color, setColor] = useState('#111827')
  const [lineWidth, setLineWidth] = useState(3)
  const [tool, setTool] = useState('brush') // brush | line | rect | circle | eraser

  // strokes: array of { tool, color, width, points } where points vary per tool
  const strokesRef = useRef([])
  const currentStrokeRef = useRef(null)

  // sizing
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
      redraw()
    }
    resize()
    window.addEventListener('resize', resize)
    return ()=> window.removeEventListener('resize', resize)
  }, [])

  // helpers
  function getPos(e){
    const rect = canvasRef.current.getBoundingClientRect()
    const clientX = e.clientX ?? e.touches?.[0]?.clientX
    const clientY = e.clientY ?? e.touches?.[0]?.clientY
    return { x: clientX - rect.left, y: clientY - rect.top }
  }

  function start(e){
    const pos = getPos(e)
    setIsDrawing(true)
    if (tool === 'brush' || tool === 'eraser'){
      currentStrokeRef.current = { tool, color: tool === 'eraser' ? '#ffffff' : color, width: lineWidth, points: [pos] }
    }else if (tool === 'line' || tool === 'rect' || tool === 'circle'){
      currentStrokeRef.current = { tool, color, width: lineWidth, from: pos, to: pos }
    }
  }

  function move(e){
    if(!isDrawing || !currentStrokeRef.current) return
    const pos = getPos(e)
    const s = currentStrokeRef.current
    if (s.points) s.points.push(pos)
    else s.to = pos
    // draw preview
    redraw(true)
  }

  function end(){
    setIsDrawing(false)
    if (currentStrokeRef.current){
      strokesRef.current.push(currentStrokeRef.current)
      currentStrokeRef.current = null
    }
    redraw()
  }

  function undo(){
    strokesRef.current.pop()
    redraw()
  }

  function clear(){
    strokesRef.current = []
    currentStrokeRef.current = null
    const c = canvasRef.current
    if (!c) return
    const ctx = c.getContext && c.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0,0,c.width,c.height)
  }

  function redraw(previewOnly = false){
    const c = canvasRef.current
    if (!c) return
    const ctx = c.getContext && c.getContext('2d')
    if (!ctx) return
    // clear then draw strokes
    ctx.clearRect(0,0,c.width,c.height)
    const drawStroke = (s, opts = {})=>{
      if (s.tool === 'brush' || s.tool === 'eraser'){
        ctx.strokeStyle = s.color
        ctx.lineWidth = s.width
        ctx.beginPath()
        for (let i=0;i<s.points.length;i++){
          const p = s.points[i]
          if (i===0) ctx.moveTo(p.x, p.y)
          else ctx.lineTo(p.x, p.y)
        }
        ctx.stroke()
      }else if (s.tool === 'line'){
        ctx.strokeStyle = s.color
        ctx.lineWidth = s.width
        ctx.beginPath()
        ctx.moveTo(s.from.x, s.from.y)
        ctx.lineTo(s.to.x, s.to.y)
        ctx.stroke()
      }else if (s.tool === 'rect'){
        ctx.strokeStyle = s.color
        ctx.lineWidth = s.width
        const x = Math.min(s.from.x, s.to.x)
        const y = Math.min(s.from.y, s.to.y)
        const w = Math.abs(s.to.x - s.from.x)
        const h = Math.abs(s.to.y - s.from.y)
        ctx.strokeRect(x,y,w,h)
      }else if (s.tool === 'circle'){
        ctx.strokeStyle = s.color
        ctx.lineWidth = s.width
        const cx = (s.from.x + s.to.x)/2
        const cy = (s.from.y + s.to.y)/2
        const rx = Math.abs(s.to.x - s.from.x)/2
        const ry = Math.abs(s.to.y - s.from.y)/2
        const r = Math.max(1, Math.sqrt(rx*rx + ry*ry))
        ctx.beginPath()
        ctx.ellipse(cx, cy, r, r, 0, 0, Math.PI*2)
        ctx.stroke()
      }
    }
    for (const s of strokesRef.current) drawStroke(s)
    if (currentStrokeRef.current){
      drawStroke(currentStrokeRef.current)
    }
  }

  // replay animation
  async function replay(){
    const c = canvasRef.current
    if (!c) return
    const ctx = c.getContext && c.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0,0,c.width,c.height)
    for (const s of strokesRef.current){
      if (s.points){
        ctx.strokeStyle = s.color
        ctx.lineWidth = s.width
        ctx.beginPath()
        for (let i=0;i<s.points.length;i++){
          const p = s.points[i]
          if (i===0) ctx.moveTo(p.x,p.y)
          else ctx.lineTo(p.x,p.y)
          ctx.stroke()
          // small delay for animation
          await new Promise(r=>setTimeout(r, 8))
        }
      }else{
        drawImmediate(s)
        await new Promise(r=>setTimeout(r, 80))
      }
    }
  }

  function drawImmediate(s){
    const c = canvasRef.current
    if (!c) return
    const ctx = c.getContext && c.getContext('2d')
    if (!ctx) return
    if (s.tool === 'line'){
      ctx.strokeStyle = s.color; ctx.lineWidth = s.width; ctx.beginPath(); ctx.moveTo(s.from.x,s.from.y); ctx.lineTo(s.to.x,s.to.y); ctx.stroke()
    }else if (s.tool === 'rect'){
      ctx.strokeStyle = s.color; ctx.lineWidth = s.width; const x=Math.min(s.from.x,s.to.x); const y=Math.min(s.from.y,s.to.y); ctx.strokeRect(x,y,Math.abs(s.to.x-s.from.x),Math.abs(s.to.y-s.from.y))
    }else if (s.tool === 'circle'){
      ctx.strokeStyle = s.color; ctx.lineWidth = s.width; const cx=(s.from.x+s.to.x)/2; const cy=(s.from.y+s.to.y)/2; const rx=Math.abs(s.to.x-s.from.x)/2; const r=Math.max(1, Math.sqrt(rx*rx)); ctx.beginPath(); ctx.ellipse(cx,cy,r,r,0,0,Math.PI*2); ctx.stroke()
    }
  }

  // save as image
  function save(){
    const c = canvasRef.current
    if(!c) return
    const data = c.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = data
    a.download = 'pixelpact-demo.png'
    document.body.appendChild(a)
    a.click()
    a.remove()
  }

  // simulate collaborator stroke
  function simulate(){
    const w = canvasRef.current.getBoundingClientRect().width
    const h = canvasRef.current.getBoundingClientRect().height
    const s = { tool: 'brush', color: '#ff6b6b', width: 4, points: [ {x: w*0.2, y: h*0.2}, {x: w*0.4, y: h*0.35}, {x: w*0.6, y: h*0.25}, {x: w*0.8, y: h*0.45} ] }
    strokesRef.current.push(s)
    redraw()
  }

  return (
    <div className={className}>
      <div className="flex flex-col md:flex-row gap-4 mb-3 items-start">
        <div className="flex items-center gap-3">
          <div className="flex gap-2 p-2 bg-white rounded shadow-sm">
            <button aria-pressed={tool==='brush'} onClick={()=>setTool('brush')} title="Brush" className={`px-3 py-1 rounded ${tool==='brush'? 'bg-primary text-white':'bg-slate-50'}`}>Brush</button>
            <button aria-pressed={tool==='line'} onClick={()=>setTool('line')} title="Line" className={`px-3 py-1 rounded ${tool==='line'? 'bg-primary text-white':'bg-slate-50'}`}>Line</button>
            <button aria-pressed={tool==='rect'} onClick={()=>setTool('rect')} title="Rect" className={`px-3 py-1 rounded ${tool==='rect'? 'bg-primary text-white':'bg-slate-50'}`}>Rect</button>
            <button aria-pressed={tool==='circle'} onClick={()=>setTool('circle')} title="Circle" className={`px-3 py-1 rounded ${tool==='circle'? 'bg-primary text-white':'bg-slate-50'}`}>Circle</button>
            <button aria-pressed={tool==='eraser'} onClick={()=>setTool('eraser')} title="Eraser" className={`px-3 py-1 rounded ${tool==='eraser'? 'bg-primary text-white':'bg-slate-50'}`}>Eraser</button>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <label className="text-sm">Color</label>
            <input aria-label="color" type="color" value={color} onChange={e=>setColor(e.target.value)} />
            <label className="text-sm ml-2">Size</label>
            <input aria-label="width" type="range" min={1} max={24} value={lineWidth} onChange={e=>setLineWidth(+e.target.value)} />
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button onClick={undo} className="px-3 py-1 rounded bg-slate-100">Undo</button>
          <button onClick={clear} className="px-3 py-1 rounded bg-slate-100">Clear</button>
          <button onClick={replay} className="px-3 py-1 rounded bg-primary text-white">Play</button>
          <button onClick={save} className="px-3 py-1 rounded border">Save</button>
          <button onClick={simulate} className="px-3 py-1 rounded bg-slate-50">Simulate</button>
        </div>
      </div>

      <div className="rounded border border-slate-200 overflow-hidden relative" style={{height: '420px'}}>
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
          style={{width: '100%', height: '100%', touchAction: 'none', display: 'block'}}
        />
        {/* animated hint */}
        <div className="absolute right-4 bottom-4 bg-white/80 px-3 py-2 rounded shadow text-sm text-slate-700 animate-fade-in">
          <div className="font-semibold">Tip</div>
          <div className="text-xs">Try switching tools, then click Play to replay your strokes.</div>
        </div>
      </div>
    </div>
  )
}

export default function Demo(){
  return (
    <section className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Interactive Demo</h2>
          <p className="mt-2 text-slate-700 max-w-2xl">A lightweight in-browser canvas demonstrating drawing tools, shapes, undo, replay and export. Works with mouse or touch.</p>
        </div>
        <div className="text-sm text-slate-500">Interactive • Animated • Exportable</div>
      </div>

      <div className="mt-2">
  <div className="glass p-4 shadow-elevation-1">
          <Canvas />
        </div>
      </div>
    </section>
  )
}
