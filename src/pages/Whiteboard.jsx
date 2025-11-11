import React, { useEffect, useRef, useState } from 'react'
import { useToast } from '../components/ToastContext'
import { io } from 'socket.io-client'

export default function Whiteboard(){
  const canvasRef = useRef(null)
  const toast = useToast()
  const [socket, setSocket] = useState(null)
  const [connected, setConnected] = useState(false)
  const [presence, setPresence] = useState([])
  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviteLink, setInviteLink] = useState('')
  const [undoStack, setUndoStack] = useState([])
  const [redoStack, setRedoStack] = useState([])
  const [currentLayer, setCurrentLayer] = useState('default')
  // drawing tool state
  const [tool, setTool] = useState('brush') // brush, eraser, rect, ellipse, line, text
  const [color, setColor] = useState('#111111')
  const [size, setSize] = useState(4)
  const shapeStart = useRef(null)
  const shapeSnapshot = useRef(null)

  // connect
  useEffect(()=>{
    const s = io(undefined, { path: '/socket' })
    setSocket(s)
    s.on('connect', ()=> setConnected(true))
    s.on('disconnect', ()=> setConnected(false))

    s.on('presence', (list)=> setPresence(list))
    s.on('peer-joined', (p)=> setPresence(prev => Array.from(new Set([...prev, p.id]))))
    s.on('peer-left', (p)=> setPresence(prev => prev.filter(x=> x !== p.id)))

    s.on('draw', (data)=>{
      const c = canvasRef.current
      if (!c) return
      const ctx = c.getContext && c.getContext('2d')
      if (!ctx) return
      ctx.save()
      ctx.strokeStyle = data.color || '#000'
      ctx.lineWidth = data.lineWidth || 2
      ctx.beginPath()
      ctx.moveTo(data.from.x, data.from.y)
      ctx.lineTo(data.to.x, data.to.y)
      ctx.stroke()
      ctx.restore()
    })

    return ()=> s.close()
  }, [])

  useEffect(()=>{
    const c = canvasRef.current
    if (!c) return
    const resize = ()=>{
      c.width = c.clientWidth * (window.devicePixelRatio || 1)
      c.height = c.clientHeight * (window.devicePixelRatio || 1)
    }
    resize()
    window.addEventListener('resize', resize)
    return ()=> window.removeEventListener('resize', resize)
  }, [])

  // load initial template image for the room (if any) when visiting /board/:id
  useEffect(()=>{
    // try to infer room id from path
    try{
      const parts = window.location.pathname.split('/')
      const id = parts[parts.length-1]
      if (!id) return
      fetch(`/api/rooms/${id}`).then(r=> r.json()).then(data=>{
        if (!data || !data.template) return
        const tpl = data.template
        if (tpl.img){
          const img = new Image()
          img.crossOrigin = 'anonymous'
          img.onload = ()=>{
            const c = canvasRef.current
            if (!c) return
            const ctx = c.getContext && c.getContext('2d')
            if (!ctx) return
            // draw image to canvas scaled
            ctx.clearRect(0,0,c.width,c.height)
            // maintain aspect ratio
            const ratio = Math.min(c.width / img.width, c.height / img.height)
            const w = img.width * ratio
            const h = img.height * ratio
            const x = (c.width - w) / 2
            const y = (c.height - h) / 2
            ctx.drawImage(img, x, y, w, h)
          }
          img.src = tpl.img
        }

        // also if template contains structured templateData, render shapes
        if (tpl.templateData && Array.isArray(tpl.templateData.shapes)){
          const c = canvasRef.current
          if (!c) return
          const ctx = c.getContext && c.getContext('2d')
          if (!ctx) return
          // clear then draw each shape (coordinates assume normalized 0..1)
          ctx.clearRect(0,0,c.width,c.height)
          const W = c.width
          const H = c.height
          const drawShape = (s) => {
            const x = (s.x || 0) * W
            const y = (s.y || 0) * H
            const w = (s.w || 0) * W
            const h = (s.h || 0) * H
            if (s.type === 'rect'){
              ctx.fillStyle = s.fill || '#ffffff'
              ctx.fillRect(x, y, w, h)
              if (s.stroke){ ctx.strokeStyle = s.stroke; ctx.strokeRect(x, y, w, h) }
            }else if (s.type === 'text'){
              ctx.fillStyle = s.color || '#111'
              const fontSize = (s.fontSize || 16) * (W/720)
              ctx.font = `${fontSize}px sans-serif`
              ctx.fillText(s.text || '', x, y + (fontSize || 16))
            }
          }
          for(const s of tpl.templateData.shapes) drawShape(s)
        }
      }).catch(()=>{})
    }catch(e){}
  }, [])

  const drawing = useRef(false)
  const last = useRef(null)
  function getPos(e){
    const rect = canvasRef.current.getBoundingClientRect()
    return { x: (e.clientX ?? e.touches?.[0]?.clientX) - rect.left, y: (e.clientY ?? e.touches?.[0]?.clientY) - rect.top }
  }

  function pushUndo(){
    try{
      const c = canvasRef.current
      const data = c.toDataURL()
      setUndoStack(s => [...s, data])
      setRedoStack([])
    }catch(e){ }
  }

  function start(e){
    const pos = getPos(e)
    drawing.current = true
    last.current = pos
    pushUndo()
    // for shapes, capture snapshot
    if (tool === 'rect' || tool === 'ellipse' || tool === 'line'){
      const c = canvasRef.current
      try{ shapeSnapshot.current = c.toDataURL() }catch(e){ shapeSnapshot.current = null }
      shapeStart.current = pos
    }
    // for text, prompt immediately
    if (tool === 'text'){
      const text = window.prompt('Enter text')
      if (text){
        const c = canvasRef.current; const ctx = c.getContext && c.getContext('2d')
        if (ctx){ ctx.fillStyle = color; ctx.font = `${16 * (c.width/720)}px sans-serif`; ctx.fillText(text, pos.x, pos.y + 16) }
      }
      drawing.current = false
    }
  }

  function drawLineBetween(a,b,opts={}){
    const c = canvasRef.current
    const ctx = c.getContext && c.getContext('2d')
    if(!ctx) return
    ctx.save()
    if (opts.eraser) ctx.globalCompositeOperation = 'destination-out'
    ctx.lineCap = 'round'
    ctx.strokeStyle = opts.color || color
    ctx.lineWidth = opts.size || size
    ctx.beginPath()
    ctx.moveTo(a.x, a.y)
    ctx.lineTo(b.x, b.y)
    ctx.stroke()
    ctx.restore()
  }

  function move(e){
    if(!drawing.current) return
    const pos = getPos(e)
    const c = canvasRef.current
    const ctx = c.getContext && c.getContext('2d')
    if(!ctx) return
    if (tool === 'brush' || tool === 'eraser'){
      drawLineBetween(last.current, pos, { color, size, eraser: tool === 'eraser' })
      if (socket && socket.connected) socket.emit('draw', { room: currentLayer, from: last.current, to: pos, color: (tool === 'eraser' ? null : color), lineWidth: size })
      last.current = pos
      return
    }
    // shapes: draw preview by restoring snapshot then drawing shape
    if (tool === 'rect' || tool === 'ellipse' || tool === 'line'){
      if (shapeSnapshot.current){
        const img = new Image()
        img.onload = ()=>{
          ctx.clearRect(0,0,c.width,c.height)
          ctx.drawImage(img,0,0,c.width,c.height)
          ctx.save()
          ctx.strokeStyle = color
          ctx.lineWidth = size
          const sx = shapeStart.current.x, sy = shapeStart.current.y
          const ex = pos.x, ey = pos.y
          if (tool === 'rect') ctx.strokeRect(sx, sy, ex - sx, ey - sy)
          else if (tool === 'line') { ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.stroke() }
          else if (tool === 'ellipse'){
            const rx = Math.abs(ex - sx)/2, ry = Math.abs(ey - sy)/2
            const cx = (sx + ex)/2, cy = (sy + ey)/2
            ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI*2); ctx.stroke()
          }
          ctx.restore()
        }
        img.src = shapeSnapshot.current
      }
    }
  }

  function end(){
    if (!drawing.current) return
    if (tool === 'rect' || tool === 'ellipse' || tool === 'line'){
      // final draw already rendered in preview; just clear snapshot
      shapeSnapshot.current = null
      shapeStart.current = null
    }
    drawing.current = false; last.current = null
  }

  function undo(){
    const u = undoStack.pop()
    if (!u) return
    setRedoStack(r => [...r, canvasRef.current.toDataURL()])
    setUndoStack([...undoStack])
    const img = new Image()
    img.onload = ()=>{
      const c = canvasRef.current
      const ctx = c.getContext('2d')
      ctx.clearRect(0,0,c.width,c.height)
      ctx.drawImage(img, 0,0, c.width, c.height)
    }
    img.src = u
  }

  function redo(){
    const r = redoStack.pop()
    if (!r) return
    setUndoStack(u => [...u, canvasRef.current.toDataURL()])
    setRedoStack([...redoStack])
    const img = new Image()
    img.onload = ()=>{
      const c = canvasRef.current
      const ctx = c.getContext('2d')
      ctx.clearRect(0,0,c.width,c.height)
      ctx.drawImage(img, 0,0, c.width, c.height)
    }
    img.src = r
  }

  async function createInvite(){
    // call server to create invite for a dummy room
    try{
      const resp = await fetch('/api/rooms', { method: 'POST' })
      const { roomId } = await resp.json()
      const inv = await fetch(`/api/rooms/${roomId}/invite`, { method: 'POST' })
      const body = await inv.json()
      setInviteLink(body.url)
      setInviteOpen(true)
  }catch(err){ toast.show('Invite failed', { type: 'error' }) }
  }

  async function clearBoard(){
    try{
      const c = canvasRef.current
      const ctx = c.getContext && c.getContext('2d')
      if (ctx){ ctx.clearRect(0,0,c.width,c.height); pushUndo(); if (socket && socket.connected) socket.emit('clear', { room: currentLayer }) }
    }catch(e){ }
  }

  function exportPNG(){
    try{
      const c = canvasRef.current
      const url = c.toDataURL('image/png')
      const a = document.createElement('a')
      a.href = url
      a.download = `whiteboard-${Date.now()}.png`
      document.body.appendChild(a)
      a.click()
      a.remove()
    }catch(e){ toast.show('Export failed', { type: 'error' }) }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div>Whiteboard — {connected? 'Connected':'Offline'}</div>
          <div className="text-sm text-slate-500">Presence: {presence.length}</div>
        </div>
        <div className="flex items-center gap-2">
          {/* toolbar: tool selection, color, size, clear/export */}
          <div className="flex items-center gap-2">
            <button onClick={()=> setTool('brush')} className={`px-2 py-1 rounded ${tool==='brush'?'bg-slate-200':''}`}>Brush</button>
            <button onClick={()=> setTool('eraser')} className={`px-2 py-1 rounded ${tool==='eraser'?'bg-slate-200':''}`}>Eraser</button>
            <button onClick={()=> setTool('rect')} className={`px-2 py-1 rounded ${tool==='rect'?'bg-slate-200':''}`}>Rect</button>
            <button onClick={()=> setTool('ellipse')} className={`px-2 py-1 rounded ${tool==='ellipse'?'bg-slate-200':''}`}>Ellipse</button>
            <button onClick={()=> setTool('line')} className={`px-2 py-1 rounded ${tool==='line'?'bg-slate-200':''}`}>Line</button>
            <button onClick={()=> setTool('text')} className={`px-2 py-1 rounded ${tool==='text'?'bg-slate-200':''}`}>Text</button>
            <input aria-label="color" type="color" value={color} onChange={(e)=> setColor(e.target.value)} className="w-8 h-8 p-0 border-0" />
            <input aria-label="size" type="range" min="1" max="64" value={size} onChange={(e)=> setSize(Number(e.target.value))} />
            <button onClick={clearBoard} className="px-2 py-1 bg-red-100 rounded">Clear</button>
            <button onClick={exportPNG} className="px-2 py-1 bg-slate-100 rounded">Export</button>
          </div>
          <button onClick={undo} className="px-3 py-1 bg-slate-100 rounded">Undo</button>
          <button onClick={redo} className="px-3 py-1 bg-slate-100 rounded">Redo</button>
          <button onClick={()=> setCurrentLayer(l => l === 'default' ? 'annotations' : 'default')} className="px-3 py-1 bg-slate-100 rounded">Toggle Layer</button>
          <button onClick={createInvite} className="px-3 py-1 bg-indigo-600 text-white rounded">Invite</button>
        </div>
      </div>

      <div style={{height: '70vh'}} className="rounded border overflow-hidden">
        <canvas ref={canvasRef} style={{width: '100%', height: '100%'}} onMouseDown={start} onMouseMove={move} onMouseUp={end} onMouseLeave={end} onTouchStart={start} onTouchMove={move} onTouchEnd={end} />
      </div>

      {inviteOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30">
          <div className="bg-white p-6 rounded shadow max-w-lg w-full">
            <h3 className="font-semibold">Invite link</h3>
            <div className="mt-2">
              <input readOnly value={inviteLink} className="w-full p-2 border rounded" />
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={()=> { navigator.clipboard?.writeText(inviteLink); toast.show('Copied invite link') }} className="px-3 py-1 bg-slate-100 rounded">Copy</button>
              <button onClick={()=> setInviteOpen(false)} className="px-3 py-1 bg-slate-200 rounded">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
