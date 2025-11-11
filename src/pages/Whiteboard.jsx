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
  const [tool, setTool] = useState('brush') // brush, eraser, rect, ellipse, line, text, select, fill
  const [color, setColor] = useState('#111111')
  const [size, setSize] = useState(4)
  const shapeStart = useRef(null)
  const shapeSnapshot = useRef(null)
  const selectionRect = useRef(null)
  const selectionImage = useRef(null)
  const [textInput, setTextInput] = useState({ visible: false, x: 0, y: 0, value: '' })
  const [liveMessage, setLiveMessage] = useState('')
  const toolbarRef = useRef(null)

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
    s.on('clear', (data)=>{
      try{
        const c = canvasRef.current
        if (!c) return
        const ctx = c.getContext && c.getContext('2d')
        if (!ctx) return
        // push current snapshot for undo then clear
        try{ setUndoStack(s => [...s, c.toDataURL()]) }catch(e){}
        ctx.clearRect(0,0,c.width,c.height)
        toast.show('Board cleared by another participant', { type: 'info' })
      }catch(e){}
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
    setLiveMessage('Drawing started')
    // for shapes, capture snapshot
    if (tool === 'rect' || tool === 'ellipse' || tool === 'line'){
      const c = canvasRef.current
      try{ shapeSnapshot.current = c.toDataURL() }catch(e){ shapeSnapshot.current = null }
      shapeStart.current = pos
    }
    // selection tool
    if (tool === 'select'){
      const c = canvasRef.current
      try{ shapeSnapshot.current = c.toDataURL() }catch(e){ shapeSnapshot.current = null }
      shapeStart.current = pos
    }
    // for text, prompt immediately
    if (tool === 'text'){
      // open inline text input positioned over canvas
      setTextInput({ visible: true, x: pos.x, y: pos.y, value: '' })
      drawing.current = false
    }
    // fill tool: perform on click (no dragging)
    if (tool === 'fill'){
      const c = canvasRef.current; const ctx = c.getContext && c.getContext('2d')
      if (ctx){ floodFillAt(Math.round(pos.x), Math.round(pos.y), hexToRgba(color)) ; if (socket && socket.connected) socket.emit('draw', { room: currentLayer, fill: true, at: pos, color }) }
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
    if (tool === 'rect' || tool === 'ellipse' || tool === 'line' || tool === 'select'){
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
          else if (tool === 'select'){
            // draw selection dashed rect
            ctx.setLineDash([6,4])
            ctx.strokeStyle = '#333'
            ctx.strokeRect(sx, sy, ex - sx, ey - sy)
            ctx.setLineDash([])
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
    if (tool === 'select'){
      // capture selected image region for potential delete/move
      const c = canvasRef.current; const ctx = c.getContext && c.getContext('2d')
      try{
        const sx = Math.min(shapeStart.current.x, last.current.x)
        const sy = Math.min(shapeStart.current.y, last.current.y)
        const w = Math.abs(shapeStart.current.x - last.current.x)
        const h = Math.abs(shapeStart.current.y - last.current.y)
        if (w > 0 && h > 0){
          const data = ctx.getImageData(sx, sy, w, h)
          selectionImage.current = { x: sx, y: sy, w, h, data }
          selectionRect.current = { x: sx, y: sy, w, h }
          setLiveMessage('Selection created')
        }
      }catch(e){}
      shapeSnapshot.current = null
      shapeStart.current = null
    }
    drawing.current = false; last.current = null
  }

  function undo(){
    setUndoStack(prev => {
      if (!prev || prev.length === 0) return prev
      const lastImg = prev[prev.length - 1]
      try{ setRedoStack(r => [...r, canvasRef.current.toDataURL()]) }catch(e){}
      // draw lastImg
      const img = new Image()
      img.onload = ()=>{
        const c = canvasRef.current
        const ctx = c.getContext('2d')
        ctx.clearRect(0,0,c.width,c.height)
        ctx.drawImage(img, 0,0, c.width, c.height)
      }
      img.src = lastImg
      return prev.slice(0, -1)
    })
  }

  function redo(){
    setRedoStack(prev => {
      if (!prev || prev.length === 0) return prev
      const lastImg = prev[prev.length - 1]
      try{ setUndoStack(u => [...u, canvasRef.current.toDataURL()]) }catch(e){}
      const img = new Image()
      img.onload = ()=>{
        const c = canvasRef.current
        const ctx = c.getContext('2d')
        ctx.clearRect(0,0,c.width,c.height)
        ctx.drawImage(img, 0,0, c.width, c.height)
      }
      img.src = lastImg
      return prev.slice(0, -1)
    })
  }

  function deleteSelection(){
    if (!selectionRect.current) return
    const c = canvasRef.current; const ctx = c.getContext && c.getContext('2d')
    if (!ctx) return
    const { x, y, w, h } = selectionRect.current
    pushUndo()
    ctx.clearRect(x, y, w, h)
    selectionRect.current = null
    selectionImage.current = null
    setLiveMessage('Selection deleted')
    if (socket && socket.connected) socket.emit('draw', { room: currentLayer, clearRegion: { x,y,w,h } })
  }

  // basic flood fill (seed fill) - naive implementation, limited to avoid huge loops
  function hexToRgba(hex){
    const h = hex.replace('#','')
    const bigint = parseInt(h.length === 3 ? h.split('').map(c=>c+c).join('') : h, 16)
    return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255, a: 255 }
  }

  function floodFillAt(sx, sy, fillColor){
    const c = canvasRef.current; const ctx = c.getContext && c.getContext('2d')
    if (!ctx) return
    try{
      const w = c.width, h = c.height
      const image = ctx.getImageData(0,0,w,h)
      const data = image.data
      const getIdx = (x,y)=> (y*w + x) * 4
      const startIdx = getIdx(sx, sy)
      const sr = data[startIdx], sg = data[startIdx+1], sb = data[startIdx+2], sa = data[startIdx+3]
      const target = [sr, sg, sb, sa]
      const fill = [fillColor.r, fillColor.g, fillColor.b, fillColor.a]
      if (target[0] === fill[0] && target[1] === fill[1] && target[2] === fill[2] && target[3] === fill[3]) return
      const stack = [[sx,sy]]
      const maxPixels = 2000000
      let popped = 0
      while(stack.length && popped++ < maxPixels){
        const [x,y] = stack.pop()
        if (x < 0 || x >= w || y < 0 || y >= h) continue
        const idx = getIdx(x,y)
        if (data[idx]===target[0] && data[idx+1]===target[1] && data[idx+2]===target[2] && data[idx+3]===target[3]){
          data[idx]=fill[0]; data[idx+1]=fill[1]; data[idx+2]=fill[2]; data[idx+3]=fill[3]
          stack.push([x+1,y]); stack.push([x-1,y]); stack.push([x,y+1]); stack.push([x,y-1])
        }
      }
      ctx.putImageData(image, 0,0)
    }catch(e){ console.warn('fill failed', e) }
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
          <div ref={toolbarRef} className="flex items-center gap-2" role="toolbar" aria-label="Whiteboard tools" onKeyDown={(e)=>{
            // arrow navigation between toolbar buttons
            const focusables = Array.from(toolbarRef.current?.querySelectorAll('button, input'))
            const idx = focusables.indexOf(document.activeElement)
            if (e.key === 'ArrowRight'){
              e.preventDefault(); const next = focusables[(idx+1) % focusables.length]; next?.focus()
            }
            if (e.key === 'ArrowLeft'){
              e.preventDefault(); const prev = focusables[(idx-1 + focusables.length) % focusables.length]; prev?.focus()
            }
          }}>
            <button aria-label="Brush tool" title="Brush (B)" onClick={()=> setTool('brush')} aria-pressed={tool==='brush'} className={`px-2 py-1 rounded ${tool==='brush'?'bg-slate-200':''}`}>Brush</button>
            <button aria-label="Eraser tool" title="Eraser (E)" onClick={()=> setTool('eraser')} aria-pressed={tool==='eraser'} className={`px-2 py-1 rounded ${tool==='eraser'?'bg-slate-200':''}`}>Eraser</button>
            <button aria-label="Rectangle tool" title="Rectangle (R)" onClick={()=> setTool('rect')} aria-pressed={tool==='rect'} className={`px-2 py-1 rounded ${tool==='rect'?'bg-slate-200':''}`}>Rect</button>
            <button aria-label="Ellipse tool" title="Ellipse (O)" onClick={()=> setTool('ellipse')} aria-pressed={tool==='ellipse'} className={`px-2 py-1 rounded ${tool==='ellipse'?'bg-slate-200':''}`}>Ellipse</button>
            <button aria-label="Line tool" title="Line (L)" onClick={()=> setTool('line')} aria-pressed={tool==='line'} className={`px-2 py-1 rounded ${tool==='line'?'bg-slate-200':''}`}>Line</button>
            <button aria-label="Text tool" title="Text (T)" onClick={()=> setTool('text')} aria-pressed={tool==='text'} className={`px-2 py-1 rounded ${tool==='text'?'bg-slate-200':''}`}>Text</button>
            <button aria-label="Select tool" title="Select (S)" onClick={()=> setTool('select')} aria-pressed={tool==='select'} className={`px-2 py-1 rounded ${tool==='select'?'bg-slate-200':''}`}>Select</button>
            <button aria-label="Fill tool" title="Fill (F)" onClick={()=> setTool('fill')} aria-pressed={tool==='fill'} className={`px-2 py-1 rounded ${tool==='fill'?'bg-slate-200':''}`}>Fill</button>
            <input aria-label="Select color" title="Color" type="color" value={color} onChange={(e)=> setColor(e.target.value)} className="w-8 h-8 p-0 border-0" />
            <input aria-label="Brush size" title="Size" type="range" min="1" max="64" value={size} onChange={(e)=> setSize(Number(e.target.value))} />
            <button aria-label="Clear board" title="Clear board" onClick={clearBoard} className="px-2 py-1 bg-red-100 rounded">Clear</button>
            <div className="relative inline-flex">
              <button aria-label="Export" title="Export" className="px-2 py-1 bg-slate-100 rounded">Export</button>
              <div className="absolute left-0 -bottom-12 hidden group-hover:block">
                <button onClick={exportPNG} className="block px-2 py-1 bg-white border">PNG</button>
                <button onClick={exportHighRes} className="block px-2 py-1 bg-white border">High-res PNG</button>
              </div>
            </div>
          </div>
          <div aria-live="polite" className="sr-only">{liveMessage}</div>
          <button onClick={undo} className="px-3 py-1 bg-slate-100 rounded">Undo</button>
          <button onClick={redo} className="px-3 py-1 bg-slate-100 rounded">Redo</button>
          {selectionRect.current && <button onClick={deleteSelection} className="px-3 py-1 bg-amber-100 rounded">Delete Selection</button>}
          <button onClick={()=> setCurrentLayer(l => l === 'default' ? 'annotations' : 'default')} className="px-3 py-1 bg-slate-100 rounded">Toggle Layer</button>
          <button onClick={createInvite} className="px-3 py-1 bg-indigo-600 text-white rounded">Invite</button>
        </div>
      </div>

      <div style={{height: '70vh'}} className="rounded border overflow-hidden">
        <canvas ref={canvasRef} style={{width: '100%', height: '100%'}} onMouseDown={start} onMouseMove={move} onMouseUp={end} onMouseLeave={end} onTouchStart={start} onTouchMove={move} onTouchEnd={end}
          tabIndex={0} role="application" aria-label="Whiteboard canvas" onKeyDown={(e)=>{
            // basic keyboard shortcuts: Ctrl+Z undo, Ctrl+Y redo, C clear
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z'){ e.preventDefault(); undo(); }
            if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 'y' || (e.shiftKey && e.key.toLowerCase() === 'z'))){ e.preventDefault(); redo(); }
            if (!e.ctrlKey && !e.metaKey && e.key.toLowerCase() === 'c'){ e.preventDefault(); clearBoard() }
          }} />
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
