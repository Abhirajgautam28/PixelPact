import React, {useState, useEffect} from 'react'

const rotating = [
  'Sketch together ✏️',
  'Prototype faster ⚡',
  'Share & iterate 🔁',
  'Present beautifully 🎨'
]

function FeatureCard({title, desc, icon}){
  return (
    <div className="p-6 glass">
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

          <div className="mt-8 flex gap-4">
            <button className="px-6 py-3 rounded-md bg-[#6C5CE7] text-white font-semibold">Create Room 🚀</button>
            <a href="/demo" className="px-6 py-3 rounded-md border border-slate-200 text-slate-700">Watch demo</a>
          </div>

          <div className="mt-6 text-sm text-slate-500">Used by teams at startups and enterprises for fast ideation and polished presentations.</div>
        </div>

        <div>
          <div className="glass p-4">
            <div className="h-80 bg-white rounded-lg flex flex-col p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-semibold">Canvas • Room #123</div>
                <div className="text-xs text-slate-400">Live • 5 participants</div>
              </div>
              <div className="flex-1 rounded-md bg-gradient-to-br from-[#fff] to-[#f7fbff] border border-slate-100 flex items-center justify-center text-slate-400">Interactive canvas preview</div>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded features */}
      <div>
        <h3 className="text-2xl font-semibold">Key features</h3>
        <div className="mt-6 grid md:grid-cols-3 gap-6">
          <FeatureCard title="Real-time collaboration" desc="Low-latency sync, live cursors, and voice chat integration." icon={'🎯'} />
          <FeatureCard title="Rich drawing & shapes" desc="Vector tools, pixel brushes, text, and alignment guides." icon={'✏️'} />
          <FeatureCard title="Templates & components" desc="Prebuilt templates for workshops, retros, and design systems." icon={'📚'} />
          <FeatureCard title="Version history" desc="Track changes, restore snapshots, and export states." icon={'🕒'} />
          <FeatureCard title="Permissions & SSO" desc="Granular access controls and single sign-on for teams." icon={'🔐'} />
          <FeatureCard title="Integrations" desc="Embed Figma, FigJam files, Slack notifications, and more." icon={'🔗'} />
        </div>
      </div>

      {/* Templates gallery */}
      <div>
        <h3 className="text-2xl font-semibold">Templates gallery</h3>
        <p className="text-slate-600 mt-2">Kickstart sessions with curated templates for design, strategy, and planning.</p>
        <div className="mt-6 grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="glass p-4">Product roadmap template</div>
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
        <div className="mt-4 flex flex-wrap gap-4">
          <div className="p-3 glass">Figma</div>
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
