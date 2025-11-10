import React from 'react'

const items = [
  { title: 'Real-time collaboration', desc: 'Instant updates across participants with low-latency sync.' },
  { title: 'Vector & pixel tools', desc: 'Flexible drawing tools for wireframes and high-fidelity mockups.' },
  { title: 'Templates & assets', desc: 'Kickstart sessions with pre-built templates and reusable components.' },
]

export default function Features() {
  return (
    <section id="features" className="mt-12 grid md:grid-cols-3 gap-6">
      {items.map((it, idx) => (
  <div key={it.title} className="p-6 rounded-xl glass border border-slate-800 hover:scale-[1.02] transition-transform shadow-elevation-1">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-md flex items-center justify-center mb-4">
            <span className="font-bold">{idx + 1}</span>
          </div>
          <h3 className="text-lg font-semibold">{it.title}</h3>
          <p className="mt-2 text-slate-300 text-sm">{it.desc}</p>
        </div>
      ))}
    </section>
  )
}
