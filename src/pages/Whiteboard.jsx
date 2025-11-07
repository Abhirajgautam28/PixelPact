import React, { useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'

export default function Whiteboard(){
  const canvasRef = useRef(null)
  const [socket, setSocket] = useState(null)
  const [connected, setConnected] = useState(false)
  const [presence, setPresence] = useState([])
  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviteLink, setInviteLink] = useState('')
  const [undoStack, setUndoStack] = useState([])
  const [redoStack, setRedoStack] = useState([])
  const [currentLayer, setCurrentLayer] = useState('default')

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
      ctx.strokeStyle = data.color || '#000'
      ctx.lineWidth = data.lineWidth || 2
      ctx.beginPath()
      ctx.moveTo(data.from.x, data.from.y)
      ctx.lineTo(data.to.x, data.to.y)
      ctx.stroke()
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

  function start(e){ drawing.current = true; last.current = getPos(e); pushUndo() }
  function move(e){
    if(!drawing.current) return
    const pos = getPos(e)
    const c = canvasRef.current
    const ctx = c.getContext && c.getContext('2d')
    if(!ctx) return
    ctx.beginPath()
    ctx.moveTo(last.current.x, last.current.y)
    ctx.lineTo(pos.x, pos.y)
    ctx.stroke()
    if (socket && socket.connected) socket.emit('draw', { room: currentLayer, from: last.current, to: pos, color: '#111', lineWidth: 2 })
    last.current = pos
  }
  function end(){ drawing.current = false; last.current = null }

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
    }catch(err){ alert('Invite failed') }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div>Whiteboard — {connected? 'Connected':'Offline'}</div>
          <div className="text-sm text-slate-500">Presence: {presence.length}</div>
        </div>
        <div className="flex items-center gap-2">
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
              <button onClick={()=> { navigator.clipboard?.writeText(inviteLink); alert('copied') }} className="px-3 py-1 bg-slate-100 rounded">Copy</button>
              <button onClick={()=> setInviteOpen(false)} className="px-3 py-1 bg-slate-200 rounded">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
