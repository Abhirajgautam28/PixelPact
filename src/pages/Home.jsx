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

const rotating = [
  'Sketch together ✏️',
  'Prototype faster ⚡',
  'Share & iterate 🔁',
  'Present beautifully 🎨'
]
function FeatureCard({title, desc, icon, delayClass, delayStyle}){
  return (
    <div className={`p-6 glass transform ${delayClass}`} style={delayStyle}>
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-md flex items-center justify-center bg-gradient-to-br from-[#ffd6e0] to-[#e7f5ff]">{icon}</div>
        <div>
          <h4 className="font-semibold">{title}</h4>
          <p className="text-sm text-slate-600 mt-1">{desc}</p>
        </div>
      </div>
    </div>
  )
}

function Testimonial({name, role, text}){
  return (
    <div className="p-4 glass">
      <div className="font-semibold">{name} <span className="text-sm text-slate-500">• {role}</span></div>
      <div className="mt-2 text-sm text-slate-700">“{text}”</div>
    </div>
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

  const features = [
    {title: 'Real-time collaboration', desc: 'Low-latency sync, live cursors, and voice chat integration.', icon: '🎯'},
    {title: 'Rich drawing & shapes', desc: 'Vector tools, pixel brushes, text, and alignment guides.', icon: '✏️'},
    {title: 'Templates & components', desc: 'Prebuilt templates for workshops, retros, and design systems.', icon: '📚'},
    {title: 'Version history', desc: 'Track changes, restore snapshots, and export states.', icon: '⏲️'},
    {title: 'Permissions & SSO', desc: 'Granular access controls and single sign-on for teams.', icon: '🔐'},
    {title: 'Integrations', desc: 'Embed Figma, FigJam files, Slack notifications, and more.', icon: '🔗'},
  ]

  return (
    <section className="space-y-12">
      {/* Hero */}
  <div className="grid lg:grid-cols-2 gap-10 items-center">
  <div>
          <h2 className="text-4xl font-extrabold accent-heading">PixelPact — where teams create together</h2>
          <p className="mt-4 text-slate-700 max-w-xl">A modern collaborative whiteboard with realtime sync, beautiful templates, extensible tools, and enterprise-grade controls. <span className="emoji">✨</span></p>

          <div className="mt-6">
            <div className="inline-flex items-center gap-3 p-3 bg-gradient-to-r from-[#fff7ed] to-[#f0fbff] rounded-full">
              <strong className="text-[#ff7b7b]">{rotating[idx]}</strong>
              <span className="text-sm text-slate-500">• Live cursors • Layers • Undo/Redo</span>
            </div>
          </div>

          <div className="mt-8 flex gap-4 items-center justify-start">
            <button className="relative px-6 py-3 rounded-md bg-[#6C5CE7] text-white font-semibold">Create Room 🚀
              <span className="absolute -right-3 -top-2 w-3 h-3 rounded-full bg-[#ff6b6b] animate-pulse" aria-hidden="true" />
            </button>
            <a href="/demo" className="px-6 py-3 rounded-md border border-slate-200 text-slate-700">Watch demo</a>
          </div>

          <div className="mt-6 text-sm text-slate-500">Used by teams at startups and enterprises for fast ideation and polished presentations.</div>
        </div>

        <div className="w-full">
          <div className="glass p-4">
            <div className="min-h-[18rem] sm:min-h-[20rem] bg-white rounded-lg flex flex-col p-4 overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-semibold">Canvas • Room #123</div>
                <div className="text-xs text-slate-400">Live • 5 participants</div>
              </div>
              <div className="flex-1 rounded-md bg-gradient-to-br from-[#fff] to-[#f7fbff] border border-slate-100 flex items-center justify-center text-slate-400 overflow-hidden">
                <div className="w-full h-full max-h-full" ref={(el)=>{ /* placeholder for mount */ }}>
                  <Suspense fallback={<HeroPlaceholder/>}>
                      <LottiePlayer animationData={miniAnim} style={{width: '100%', height: '100%'}} />
                    </Suspense>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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
        <div className="mt-6 grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="glass p-4 flex items-center justify-center" ref={templatesRef}>
            <div className={`w-full h-28 ${templatesInView? 'animate-fade-in-left':''}`}>
              <Suspense fallback={<TemplatesPlaceholder/>}>
                <TemplatesIllustration />
              </Suspense>
            </div>
          </div>
          <div className="glass p-4">Brainstorming canvas</div>
          <div className="glass p-4">Design critique board</div>
          <div className="glass p-4">Customer journey map</div>
          <div className="glass p-4">Retrospective board</div>
          <div className="glass p-4">Wireframe kit</div>
        </div>
      </div>

      {/* Integrations */}
      <div>
        <h3 className="text-2xl font-semibold">Integrations</h3>
        <p className="text-slate-600 mt-2">Connect PixelPact with your workflow.</p>
        <div className="mt-4 flex flex-wrap gap-4 items-center">
          <div className="p-3 glass flex items-center" ref={integrationsRef}>
            <div className={`w-40 h-14 ${integrationsInView? 'animate-fade-in':''}`}>
              <Suspense fallback={<IntegrationsPlaceholder/>}>
                <IntegrationsIllustration />
              </Suspense>
            </div>
          </div>
          <div className="p-3 glass">Slack</div>
          <div className="p-3 glass">Notion</div>
          <div className="p-3 glass">Google Drive</div>
          <div className="p-3 glass">SAML / SSO</div>
        </div>
      </div>

      {/* Testimonials */}
      <div>
        <h3 className="text-2xl font-semibold">What customers say</h3>
        <div className="mt-4 grid md:grid-cols-3 gap-4">
          <Testimonial name="Sara K." role="Design Lead" text="PixelPact transformed how our product team ideates. Rapid, delightful, and reliable." />
          <Testimonial name="Jon P." role="PM" text="We reduced meeting time by 30% — collaboration just flows now." />
          <Testimonial name="Aisha R." role="CTO" text="Enterprise-grade controls and performance at scale made it an easy choice." />
        </div>
      </div>

      {/* CTA */}
      <div className="text-center">
        <h3 className="text-2xl font-semibold">Ready to create together?</h3>
        <p className="text-slate-600 mt-2">Start a room in seconds — invite teammates, or try a demo session.</p>
        <div className="mt-6 flex items-center justify-center gap-4">
          <button className="px-6 py-3 rounded-md bg-[#6C5CE7] text-white font-semibold">Create Room</button>
          <a href="/demo" className="px-6 py-3 rounded-md border border-slate-200 text-slate-700">Launch demo</a>
        </div>
      </div>
    </section>
  )
}
