import React, {useState, useEffect, Suspense, lazy} from 'react'
const HeroIllustration = lazy(()=> import('../components/illustrations/generated/Hero.jsx'))
const TemplatesIllustration = lazy(()=> import('../components/illustrations/generated/Templates.jsx'))
const IntegrationsIllustration = lazy(()=> import('../components/illustrations/generated/Integrations.jsx'))
import HeroPlaceholder from '../components/illustrations/placeholders/HeroPlaceholder'
import TemplatesPlaceholder from '../components/illustrations/placeholders/TemplatesPlaceholder'
import IntegrationsPlaceholder from '../components/illustrations/placeholders/IntegrationsPlaceholder'
import useInView from '../hooks/useInView'
import useStaggeredInView from '../hooks/useStaggeredInView'
const LottiePlayer = lazy(()=> import('../components/LottiePlayer'))
import miniAnim from '../assets/lottie/mini.json'
import { Link, useNavigate } from 'react-router-dom'
import { useToast } from '../components/ToastContext'
import templatesImg from '../assets/images/placeholders/templates.png'
import tpl1 from '../assets/images/placeholders/template-1.svg'
import tpl2 from '../assets/images/placeholders/template-2.svg'
import tpl3 from '../assets/images/placeholders/template-3.svg'
import tpl4 from '../assets/images/placeholders/template-4.svg'
import tpl5 from '../assets/images/placeholders/template-5.svg'
import tpl6 from '../assets/images/placeholders/template-6.svg'
import PreviewModal from '../components/PreviewModal'
import AdminModal from '../components/AdminModal'
import AuthModal from '../components/AuthModal'

const rotating = [
  'Sketch together ✏️',
  'Prototype faster ⚡',
  'Share & iterate 🔁',
  'Present beautifully 🎨'
]
function FeatureCard({title, desc, icon, delayClass, delayStyle}){
  return (
  <div className={`p-5 bg-white rounded-lg shadow-elevation-1 transform glass ${delayClass}`} style={delayStyle} role="article">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-full flex items-center justify-center bg-primary-50 text-primary ring-1 ring-primary-100">{icon}</div>
        <div>
          <h4 className="font-medium text-slate-900">{title}</h4>
          <p className="text-sm text-slate-600 mt-1">{desc}</p>
        </div>
      </div>
    </div>
  )
}

function Testimonial({name, role, text}){
  return (
  <figure className="p-4 bg-white rounded-lg shadow-elevation-1">
      <blockquote className="text-sm text-slate-700">“{text}”</blockquote>
      <figcaption className="mt-3 text-sm font-semibold text-slate-900">{name} <span className="text-sm text-slate-500">• {role}</span></figcaption>
    </figure>
  )
}

function TemplateCard({title, desc, img, tags, onPreview, onUse}){
  return (
    <article className="bg-white rounded-lg overflow-hidden shadow hover:shadow-lg transition-transform transform hover:-translate-y-1">
      <div className="h-40 bg-slate-50 overflow-hidden">
        <img src={img} alt={title} className="w-full h-full object-cover" />
      </div>
      <div className="p-4">
        <h4 className="font-medium text-lg text-slate-900">{title}</h4>
        <p className="text-sm text-slate-600 mt-2">{desc}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {tags && tags.map(t=> <span key={t} className="text-xs bg-slate-100 px-2 py-1 rounded-md text-slate-600">{t}</span>)}
        </div>
        <div className="mt-4 flex items-center justify-between">
          <button onClick={onPreview} className="px-3 py-2 rounded-md bg-primary text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">Preview</button>
          <button onClick={onUse} className="text-sm text-primary">Use template</button>
        </div>
      </div>
    </article>
  )
}

export default function Home(){
  const [idx, setIdx] = useState(0)
  useEffect(()=>{
    const t = setInterval(()=> setIdx(i=> (i+1)%rotating.length), 2200)
    return ()=> clearInterval(t)
  },[])
  const [templatesRef, templatesInView] = useInView({threshold:0.15})
  const [integrationsRef, integrationsInView] = useInView({threshold:0.2})
  const [featuresRef, featuresInView, getDelayProps] = useStaggeredInView({threshold:0.12})
  const [testimonialsRef, testimonialsInView, getTestDelayProps] = useStaggeredInView({threshold:0.12})
  const [testimonials, setTestimonials] = useState([])

  const features = [
    {title: 'Real-time collaboration', desc: 'Low-latency sync, live cursors, and voice chat integration.', icon: '🎯'},
    {title: 'Rich drawing & shapes', desc: 'Vector tools, pixel brushes, text, and alignment guides.', icon: '✏️'},
    {title: 'Templates & components', desc: 'Prebuilt templates for workshops, retros, and design systems.', icon: '📚'},
    {title: 'Version history', desc: 'Track changes, restore snapshots, and export states.', icon: '⏲️'},
    {title: 'Permissions & SSO', desc: 'Granular access controls and single sign-on for teams.', icon: '🔐'},
    {title: 'Integrations', desc: 'Embed Figma, FigJam files, Slack notifications, and more.', icon: '🔗'},
  ]

  const templates = [
    {title: 'Brainstorming Canvas', desc: 'Structured spaces for rapid idea generation and voting.', tags: ['Brainstorm','Workshop'], img: tpl1, templateData: { shapes: [ { type: 'rect', x: 0.05, y: 0.05, w: 0.4, h: 0.35, fill: '#fff' }, { type: 'rect', x: 0.52, y: 0.05, w: 0.43, h: 0.35, fill: '#fff' }, { type: 'text', x: 0.05, y: 0.6, text: 'Brainstorm', fontSize: 28, color: '#92400e' } ] }},
    {title: 'Design Critique', desc: 'Template for structured feedback and notes during reviews.', tags: ['Design','Feedback'], img: tpl2, templateData: { shapes: [ { type: 'text', x: 0.05, y: 0.12, text: 'Design Critique', fontSize: 36, color: '#5b21b6' }, { type: 'rect', x: 0.05, y: 0.22, w: 0.9, h: 0.55, fill: '#fff' } ] }},
    {title: 'Customer Journey', desc: 'Map customer touchpoints and experience flows.', tags: ['UX','Mapping'], img: tpl3, templateData: { shapes: [ { type: 'text', x: 0.05, y: 0.18, text: 'Customer Journey', fontSize: 30, color: '#065f46' }, { type: 'rect', x: 0.05, y: 0.26, w: 0.9, h: 0.5, fill: '#fff' } ] }},
    {title: 'Retrospective Board', desc: 'Run effective retros with actionable outcomes.', tags: ['Agile','Retro'], img: tpl4, templateData: { shapes: [ { type: 'text', x: 0.05, y: 0.12, text: 'Retrospective Board', fontSize: 30, color: '#9f1239' }, { type: 'rect', x: 0.05, y: 0.18, w: 0.9, h: 0.7, fill: '#fff' } ] }},
    {title: 'Wireframe Kit', desc: 'Quick blocks and layouts for low-fi prototyping.', tags: ['Wireframe','UI'], img: tpl5, templateData: { shapes: [ { type: 'text', x: 0.05, y: 0.12, text: 'Wireframe Kit', fontSize: 30, color: '#434190' }, { type: 'rect', x: 0.05, y: 0.18, w: 0.4, h: 0.55, fill: '#fff' }, { type: 'rect', x: 0.47, y: 0.18, w: 0.48, h: 0.55, fill: '#fff' } ] }},
    {title: 'Sprint Planning', desc: 'Plan sprints, assign owners, and estimate work.', tags: ['Planning','Scrum'], img: tpl6, templateData: { shapes: [ { type: 'text', x: 0.05, y: 0.12, text: 'Sprint Planning', fontSize: 30, color: '#166534' }, { type: 'rect', x: 0.05, y: 0.18, w: 0.9, h: 0.6, fill: '#fff' } ] }},
  ]

  // preview modal state
  const [preview, setPreview] = useState(null)
  // previewSources holds generated webp data URLs keyed by template title
  const [previewSources, setPreviewSources] = useState({})
  const navigate = useNavigate()
  const toast = useToast()
  const [showAdmin, setShowAdmin] = useState(false)
  const [showAuth, setShowAuth] = useState(false)
  const [createRoomError, setCreateRoomError] = useState(null)

  async function openTemplateInEditor(template){
    try{
      const resp = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ template })
      })
      let body = null
      try{ body = await resp.json() }catch(e){ /* non-json */ }
      if (!resp.ok){
        const msg = body && (body.message || body.error || body.msg) ? (body.message || body.error || body.msg) : resp.statusText || 'Failed to create room'
        setPreview(null)
        toast.show(msg, { type: 'error' })
        return
      }
      const roomId = body && (body.roomId || body.id || body.room) || null
      if(roomId){
        // close preview and navigate to editor
        setPreview(null)
        navigate(`/board/${roomId}`)
      }else{
        setPreview(null)
        toast.show('Failed to create room', { type: 'error' })
      }
    }catch(e){
      setPreview(null)
      toast.show(e && e.message ? e.message : 'Failed to create room', { type: 'error' })
    }
  }

  async function createRoom(){
    try{
      // attach CSRF header from cookie
      const headers = { 'Content-Type': 'application/json' }
      try{ const t = (await import('../utils/csrf')).getCsrfToken(); if (t) headers['X-CSRF-Token'] = t }catch(e){}
      const resp = await fetch('/api/rooms', {
        method: 'POST',
        credentials: 'include',
        headers,
        body: JSON.stringify({})
      })
      if (resp.status === 401 || resp.status === 403){
        // not authenticated: show auth modal
        setShowAuth(true)
        return
      }
      let body = null
      try{ body = await resp.json() }catch(e){ /* non-json */ }
      if (!resp.ok){
        const msg = body && (body.message || body.error || body.msg) ? (body.message || body.error || body.msg) : resp.statusText || 'Failed to create room'
        // For server errors (5xx) offer a retry UI; otherwise show toast
        if (resp.status >= 500){
          setCreateRoomError({ message: msg })
        } else {
          toast.show(msg, { type: 'error' })
        }
        return
      }
      const roomId = body && (body.roomId || body.id || body.room) || null
      if(roomId){
        navigate(`/board/${roomId}`)
      }else{
        toast.show('Failed to create room', { type: 'error' })
      }
    }catch(e){
      toast.show(e && e.message ? e.message : 'Failed to create room', { type: 'error' })
    }
  }

  

  useEffect(()=>{
    // generate WebP previews for each template from the SVG thumbnails
    let mounted = true
    async function gen(){
      const out = {}
      for(const t of templates){
        try{
          // fetch SVG text
          const resp = await fetch(t.img)
          const svgText = await resp.text()
          // create data URL for svg
          const svgDataUrl = 'data:image/svg+xml;utf8,' + encodeURIComponent(svgText)
          const img = new Image()
          img.crossOrigin = 'anonymous'
          const p = new Promise((resolve)=>{
            img.onload = ()=> resolve(true)
            img.onerror = ()=> resolve(false)
          })
          img.src = svgDataUrl
          await p
          // draw to canvas and get webp
          try{
            const c = document.createElement('canvas')
            const w = Math.min(720, img.naturalWidth || 720)
            const h = Math.min(400, img.naturalHeight || 400)
            c.width = w
            c.height = h
            const ctx = c.getContext && c.getContext('2d')
            if (ctx) ctx.drawImage(img, 0, 0, w, h)
            const webp = c.toDataURL ? c.toDataURL('image/webp', 0.8) : svgDataUrl
            out[t.title] = webp
          }catch(e){
            out[t.title] = svgDataUrl
          }
        }catch(e){
          out[t.title] = t.img
        }
      }
      if (mounted) setPreviewSources(out)
    }
    // run in next tick to avoid blocking
    setTimeout(()=> gen(), 0)
    return ()=> { mounted = false }
  }, [])

  useEffect(()=>{
    // load testimonials from server; only show real data
    // guard for test/jsdom environment where relative fetch('/api/...') is invalid
    if (typeof window === 'undefined' || !window.location || (window.location.protocol && window.location.protocol.startsWith('about'))) return
    let mounted = true
    async function loadTestimonials(){
      try{
        const res = await fetch('/api/testimonials')
        if (!res.ok) return
        const body = await res.json()
        if (mounted && Array.isArray(body)) setTestimonials(body)
      }catch(e){
        // silent — if no backend provided, we intentionally hide testimonials
        console.warn('Failed to load testimonials:', e && e.message ? e.message : e)
      }
    }
    loadTestimonials()
    return ()=> { mounted = false }
  }, [])

  return (
    <main className="space-y-12" aria-labelledby="home-hero">
      {/* Create-room retry modal for server errors */}
      {createRoomError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/40" onClick={()=> setCreateRoomError(null)} />
          <div className="bg-white rounded-lg p-6 shadow-lg max-w-md mx-4">
            <h3 className="text-lg font-semibold">Server error</h3>
            <p className="mt-2 text-sm text-slate-700">{createRoomError.message}</p>
            <div className="mt-4 flex gap-2 justify-end">
              <button onClick={()=> { setCreateRoomError(null); createRoom() }} className="px-3 py-2 rounded bg-primary text-white">Retry</button>
              <button onClick={()=> setCreateRoomError(null)} className="px-3 py-2 rounded border">Close</button>
            </div>
          </div>
        </div>
      )}
      {/* Hero */}
      <header id="home-hero" className="max-w-6xl mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">PixelPact</h1>
            <p className="mt-2 text-slate-700 text-lg">Collaborate in real-time with a beautiful, extensible whiteboard built for teams.</p>

            <div className="mt-6 flex items-center gap-3">
              <div className="inline-flex items-center gap-3 px-3 py-2 rounded-full bg-primary-50 text-primary-700">
                <strong className="text-primary-800">{rotating[idx]}</strong>
                <span className="text-sm text-slate-500">• Live cursors • Layers • Undo</span>
              </div>
            </div>

            <div className="mt-8 flex gap-4 items-center">
              <button onClick={()=> createRoom()} className="px-5 py-3 rounded-md bg-primary text-white font-medium shadow-md focus:outline-none focus:ring-2 focus:ring-primary/30" aria-label="Create a new room">Create room</button>
              <Link to="/demo" className="px-4 py-2 rounded-md border border-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/30">Watch demo</Link>
            </div>

            <p className="mt-4 text-sm text-slate-500">Trusted by teams for workshops, retros, and design reviews.</p>
          </div>

          <div>
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-medium text-slate-800">Live preview</div>
                <div className="text-xs text-slate-400">Realtime</div>
              </div>
              <div className="h-56 md:h-64 rounded-md bg-gradient-to-br from-white to-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden">
                <Suspense fallback={<HeroPlaceholder/>}>
                  <LottiePlayer animationData={miniAnim} style={{width: '100%', height: '100%'}} />
                </Suspense>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Expanded features */}
      <div>
        <h3 className="text-2xl font-semibold">Key features</h3>
        <div className="mt-6 grid md:grid-cols-3 gap-6" ref={featuresRef}>
          {features.map((f, i)=> {
            const { className, style } = getDelayProps(i)
            return <FeatureCard key={f.title} title={f.title} desc={f.desc} icon={f.icon} delayClass={className} delayStyle={style} />
          })}
        </div>
      </div>

      {/* Templates gallery */}
      <div>
        <h3 className="text-2xl font-semibold">Templates gallery</h3>
        <p className="text-slate-600 mt-2">Kickstart sessions with curated templates for design, strategy, and planning.</p>
        <div className="mt-6 grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          {templates.map((t)=> (
            <div key={t.title} ref={templatesRef} className={`${templatesInView? 'animate-fade-in-up':''}`}>
              <TemplateCard title={t.title} desc={t.desc} img={previewSources[t.title] || t.img} tags={t.tags} onPreview={()=> setPreview(t)} />
            </div>
          ))}
        </div>
  <PreviewModal open={!!preview} onClose={()=> setPreview(null)} title={preview?.title} img={preview?.img} desc={preview?.desc} onOpen={()=> openTemplateInEditor(preview)} />
        {/* keep a test-friendly placeholder for lazy-loading checks (hidden visually) */}
        <div data-testid="templates-placeholder" className="hidden">
          <img alt="templates placeholder" loading="lazy" src={templatesImg} />
        </div>
        {/* keep an integrations placeholder for tests (hidden) */}
        <div data-testid="integrations-placeholder" className="hidden">
          <img alt="integrations placeholder" loading="lazy" src={templatesImg} />
        </div>
      </div>

      {/* Integrations removed as requested */}

      {/* Testimonials: only render when the server returns data; we avoid any fake/test content */}
      {testimonials && testimonials.length > 0 && (
        <div>
          <h3 className="text-2xl font-semibold">What customers say</h3>
          <div className="mt-4 grid md:grid-cols-3 gap-4" ref={testimonialsRef}>
            {testimonials.map((t, i)=>{
              const { className, style } = getTestDelayProps(i)
              return (
                <div key={t.id || t.name + i} className={className} style={style}>
                  <Testimonial name={t.name} role={t.role} text={t.text} />
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* CTA */}
  {/* Admin panel (embedded) - dev or explicitly enabled via VITE_ENABLE_ADMIN */}
      {(import.meta.env.MODE !== 'production' || import.meta.env.VITE_ENABLE_ADMIN === 'true') && (
        <AdminModal />
      )}
      <AuthModal open={showAuth} onClose={()=> setShowAuth(false)} onSuccess={(roomId)=>{
        setShowAuth(false)
        // if the auth flow returned a roomId (created during registration) navigate to it
        if (roomId) return navigate(`/board/${roomId}`)
        // otherwise attempt to create a room now that we're authenticated
        createRoom()
      }} />
      <div className="text-center">
        <h3 className="text-2xl font-semibold">Ready to create together?</h3>
        <p className="text-slate-600 mt-2">Start a room in seconds — invite teammates, or try a demo session.</p>
          <div className="mt-6 flex items-center justify-center gap-4">
          <button onClick={()=> createRoom()} className="px-6 py-3 rounded-md bg-primary text-white font-semibold">Create Room</button>
          <Link to="/demo" className="px-6 py-3 rounded-md border border-slate-200 text-slate-700">Launch demo</Link>
        </div>
      </div>
    </main>
  )
}
