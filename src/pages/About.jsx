import React from 'react'

function Stat({ number, label }){
  return (
    <div className="text-center">
      <div className="text-3xl font-extrabold">{number}</div>
      <div className="text-sm text-slate-500">{label}</div>
    </div>
  )
}

export default function About(){
  return (
    <main className="space-y-12">
      <header className="text-center max-w-4xl mx-auto">
        <h1 className="text-4xl font-extrabold">About PixelPact</h1>
        <p className="mt-4 text-slate-700 max-w-2xl mx-auto">PixelPact is a collaborative whiteboard built for modern teams. We focus on performance, clarity, and a delightful UX so teams can sketch, iterate, and present together — without friction.</p>
      </header>

      <section className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">
  <div className="glass p-6 shadow-elevation-1">
          <h3 className="text-lg font-semibold">Our mission</h3>
          <p className="mt-3 text-slate-700">Make asynchronous and synchronous collaboration equally powerful. We build fast, accessible tools that scale from 1-to-1 ideation to company-wide workshops.</p>
        </div>

  <div className="glass p-6 shadow-elevation-1">
          <h3 className="text-lg font-semibold">What we build</h3>
          <ul className="mt-3 space-y-2 text-slate-700 list-inside list-disc">
            <li>Realtime canvas with presence and low-latency updates.</li>
            <li>Curated templates for workshops, retros, and design critique.</li>
            <li>Export-ready visuals and lightweight sharing options.</li>
          </ul>
        </div>

  <div className="glass p-6 shadow-elevation-1">
          <h3 className="text-lg font-semibold">Security & privacy</h3>
          <p className="mt-3 text-slate-700">We support enterprise controls like SSO, auditing, and encryption at rest. Privacy is a first-class concern in our architecture decisions.</p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto grid md:grid-cols-2 gap-6">
  <div className="glass p-6 shadow-elevation-1">
          <h3 className="text-lg font-semibold">At a glance</h3>
          <div className="mt-4 grid grid-cols-3 gap-4">
            <Stat number="99ms" label="median sync latency" />
            <Stat number="120+" label="templates" />
            <Stat number="4.8/5" label="average rating" />
          </div>
          <p className="mt-4 text-sm text-slate-600">Representative figures for typical medium rooms; performance may vary by network.</p>
        </div>

  <div className="glass p-6 shadow-elevation-1">
          <h3 className="text-lg font-semibold">Roadmap highlights</h3>
          <ol className="mt-3 list-decimal list-inside text-slate-700 space-y-2">
            <li>Offline-first canvas with conflict resolution improvements.</li>
            <li>More integrations and export formats.</li>
            <li>Advanced permissions and enterprise tooling.</li>
          </ol>
        </div>
      </section>

      <section className="max-w-4xl mx-auto text-center">
        <h3 className="text-lg font-semibold">Work with us</h3>
  <p className="mt-2 text-slate-700">Interested in partnering or joining the team? Email <a className="text-indigo-600" href="mailto:abhirajgautam28@gmail.com">abhirajgautam28@gmail.com</a>.</p>
      </section>
    </main>
  )
}
