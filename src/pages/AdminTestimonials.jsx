import React, { useEffect, useState } from 'react'
import { useToast } from '../components/ToastContext'
import useStaggeredInView from '../hooks/useStaggeredInView'

function Field({label, value, onChange}){
  return (
    <label className="block text-sm">
      <div className="text-xs text-slate-600">{label}</div>
      <input className="w-full mt-1 p-2 border border-slate-200 rounded" value={value} onChange={e=> onChange(e.target.value)} />
    </label>
  )
}

export default function AdminTestimonials(){
  const [ref, inView, getDelayProps] = useStaggeredInView({threshold: 0.1})
  const toast = useToast()
  const [testimonials, setTestimonials] = useState([])
  const [loading, setLoading] = useState(true)
  const [authToken, setAuthToken] = useState(() => sessionStorage.getItem('adminToken') || '')
  const [passphrase, setPassphrase] = useState('')

  useEffect(()=>{
    async function load(){
      setLoading(true)
      try{
        const res = await fetch('/api/testimonials')
        const body = await res.json()
        setTestimonials(Array.isArray(body) ? body : [])
      }catch(e){
        console.warn('Failed to load testimonials', e)
      }finally{ setLoading(false) }
    }
    load()
  },[])

  function saveToken(token){
    setAuthToken(token)
    sessionStorage.setItem('adminToken', token)
  }

  function normalizeToken(input){
    if (!input) return ''
    if (input.startsWith('Bearer ')) return input
    // simple JWT detection (three dot parts)
    if ((input.match(/\./g) || []).length === 2) return `Bearer ${input}`
    return input
  }

  async function attemptLogin(){
    if (!passphrase){ toast.show('Enter admin password or token', { type: 'error' }); return }
    try{
      // Try password exchange first
      const res = await fetch('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: passphrase }) })
      if (res.ok){
        const body = await res.json()
        if (body && body.token){
          saveToken(`Bearer ${body.token}`)
          setPassphrase('')
          return
        }
      }
      // Fallback: treat input as a token (legacy token or raw JWT)
      saveToken(normalizeToken(passphrase))
      setPassphrase('')
    }catch(e){
      console.warn('Login error', e)
      toast.show('Login failed', { type: 'error' })
    }
  }

  async function addTestimonial(t){
    try{
      const res = await fetch('/api/testimonials', { method: 'POST', headers: { 'Content-Type':'application/json', 'Authorization': authToken }, body: JSON.stringify(t) })
      if (!res.ok) throw new Error('failed')
      const body = await res.json()
      setTestimonials(body)
    }catch(e){ toast.show('Failed to add testimonial (check admin token)', { type: 'error' }) }
  }

  async function updateTestimonial(idx, t){
    try{
      const res = await fetch(`/api/testimonials/${idx}`, { method: 'PUT', headers: { 'Content-Type':'application/json', 'Authorization': authToken }, body: JSON.stringify(t) })
      if (!res.ok) throw new Error('failed')
      const body = await res.json()
      setTestimonials(body)
    }catch(e){ toast.show('Failed to update testimonial (check admin token)', { type: 'error' }) }
  }

  async function removeTestimonial(idx){
    try{
      const res = await fetch(`/api/testimonials/${idx}`, { method: 'DELETE', headers: { 'Authorization': authToken } })
      if (!res.ok) throw new Error('failed')
      const body = await res.json()
      setTestimonials(body)
    }catch(e){ toast.show('Failed to remove testimonial (check admin token)', { type: 'error' }) }
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Testimonials Admin</h2>
        <div className="w-80">
          <div className="text-xs text-slate-500 mb-1">Admin token (session)</div>
          <input className="w-full p-2 border border-slate-200 rounded" value={passphrase} onChange={e=> setPassphrase(e.target.value)} placeholder="Admin password or token (paste JWT or legacy token)" />
          <div className="mt-2 flex gap-2">
            <button className="px-3 py-2 rounded bg-[#6C5CE7] text-white" onClick={attemptLogin}>Login / Save</button>
            <button className="px-3 py-2 rounded border" onClick={()=>{ setAuthToken(''); sessionStorage.removeItem('adminToken'); setPassphrase('') }}>Logout</button>
          </div>
          {authToken && <div className="mt-2 text-xs text-slate-500">Logged in token: <span className="font-mono text-[10px] break-all">{authToken}</span></div>}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="glass p-4">
          <h3 className="font-semibold">Existing testimonials</h3>
          <div className="mt-4 space-y-3" ref={ref}>
            {loading && <div className="text-sm text-slate-500">Loading…</div>}
            {!loading && testimonials.length === 0 && <div className="text-sm text-slate-500">No testimonials yet.</div>}
            {testimonials.map((t, i)=>{
              const { className, style } = getDelayProps(i)
              return (
                <div key={i} className={`p-3 glass ${className}`} style={style}>
                  <InlineEditor
                    index={i}
                    testimonial={t}
                    onSave={(updated) => updateTestimonial(i, updated)}
                    onDelete={() => removeTestimonial(i)}
                  />
                </div>
              )
            })}
          </div>
        </div>

        <div className="glass p-4">
          <h3 className="font-semibold">Add testimonial</h3>
          <AddForm onAdd={addTestimonial} />
        </div>
      </div>
    </section>
  )
}

  function AddForm({onAdd}){
  const toast = useToast()
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [text, setText] = useState('')

  function submit(e){
    e.preventDefault()
      if (!name || !role || !text){ toast.show('Fill all fields', { type: 'error' }); return }
      onAdd({ name, role, text })
    setName(''); setRole(''); setText('')
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <Field label="Name" value={name} onChange={setName} />
      <Field label="Role" value={role} onChange={setRole} />
      <label className="block text-sm">
        <div className="text-xs text-slate-600">Text</div>
        <textarea className="w-full mt-1 p-2 border border-slate-200 rounded" value={text} onChange={e=> setText(e.target.value)} />
      </label>
      <div>
        <button className="px-4 py-2 rounded bg-[#6C5CE7] text-white" type="submit">Add testimonial</button>
      </div>
    </form>
  )
}

function InlineEditor({index, testimonial, onSave, onDelete}){
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(testimonial.name || '')
  const [role, setRole] = useState(testimonial.role || '')
  const [text, setText] = useState(testimonial.text || '')
  const [confirming, setConfirming] = useState(false)

  const toast = useToast()

  useEffect(()=>{
    setName(testimonial.name || '')
    setRole(testimonial.role || '')
    setText(testimonial.text || '')
  }, [testimonial])

    function save(){
      if (!name.trim() || !text.trim()){ toast.show('Name and text required', { type: 'error' }); return }
      onSave({ name: name.trim(), role: role.trim(), text: text.trim() })
      setEditing(false)
    }

  return (
    <div>
      {!editing && (
        <div className="flex justify-between items-start">
          <div>
            <div className="font-semibold">{testimonial.name} <span className="text-xs text-slate-500">• {testimonial.role}</span></div>
            <div className="text-sm text-slate-700 mt-2">{testimonial.text}</div>
          </div>
            <div className="ml-4 flex flex-col gap-2">
              <button className="px-2 py-1 text-sm border rounded" onClick={()=> setEditing(true)}>Edit</button>
              {!confirming && (
                <button className="px-2 py-1 text-sm bg-red-50 text-red-700 rounded" onClick={()=> setConfirming(true)}>Delete</button>
              )}
              {confirming && (
                <div className="flex gap-2">
                  <button className="px-2 py-1 text-sm bg-red-600 text-white rounded" onClick={()=> { onDelete(); setConfirming(false) }}>Confirm</button>
                  <button className="px-2 py-1 text-sm border rounded" onClick={()=> setConfirming(false)}>Cancel</button>
                </div>
              )}
            </div>
        </div>
      )}
      {editing && (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <input className="p-2 border border-slate-200 rounded" value={name} onChange={e=> setName(e.target.value)} />
            <input className="p-2 border border-slate-200 rounded" value={role} onChange={e=> setRole(e.target.value)} />
          </div>
          <textarea className="w-full p-2 border border-slate-200 rounded" rows={3} value={text} onChange={e=> setText(e.target.value)} />
          <div className="flex gap-2">
            <button className="px-3 py-1 rounded bg-[#6C5CE7] text-white" onClick={save}>Save</button>
            <button className="px-3 py-1 rounded border" onClick={()=> { setEditing(false); setName(testimonial.name||''); setRole(testimonial.role||''); setText(testimonial.text||'') }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  )
}
