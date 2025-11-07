import React from 'react'

function Stat({ number, label }){
  return (
    <div className="text-center">
      <div className="text-3xl font-extrabold">{number}</div>
      <div className="text-sm text-slate-500">{label}</div>
    </div>
  )
}

function Pill({ children }){
  return <span className="inline-block bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm mr-2 mb-2">{children}</span>
}

export default function About(){
  return (
    <section className="space-y-12">
      <header className="text-center max-w-4xl mx-auto">
        <div className="flex items-center justify-center gap-6">
          <svg width="72" height="72" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="rounded-lg bg-gradient-to-br from-[#FF6B6B] to-[#FFD93D] p-2">
            <rect width="24" height="24" rx="6" fill="transparent" />
            <path d="M6 12h12M6 8h12M6 16h12" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div>
            <h1 className="text-4xl font-extrabold">About PixelPact</h1>
            <p className="mt-4 text-slate-700">PixelPact is a collaborative whiteboard built for modern teams. We combine realtime sync, powerful templates, and an approachable UX to make remote collaboration feel native.</p>
          </div>
        </div>
      </header>

      <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        <div className="glass p-6">
          <h3 className="text-lg font-semibold">Our mission</h3>
          <p className="mt-3 text-slate-700">Empower teams to create, iterate, and present together — without friction. We prioritize performance, simplicity, and extensibility.</p>
          <div className="mt-4">
            <Pill>Realtime sync</Pill>
            <Pill>Easy templates</Pill>
            <Pill>Export-ready</Pill>
          </div>
        </div>

        <div className="glass p-6">
          <h3 className="text-lg font-semibold">Core strengths</h3>
          <ul className="mt-3 space-y-2 text-slate-700 list-inside list-disc">
            <li>Low-latency collaborative canvas with presence & live cursors.</li>
            <li>Extensible tools: vector shapes, drawing, text, and embeds.</li>
            <li>Template library for workshops, retros, and design critiques.</li>
          </ul>
        </div>

        <div className="glass p-6">
          <h3 className="text-lg font-semibold">Security</h3>
          <p className="mt-3 text-slate-700">Enterprise features include SSO, SCIM provisioning, audit logs, and encryption at rest. We make it easy for teams to meet compliance needs.</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-6">
        <div className="glass p-6">
          <h3 className="text-lg font-semibold">At a glance</h3>
          <div className="mt-4 grid grid-cols-3 gap-4">
            <Stat number="99ms" label="median sync latency" />
            <Stat number="120+" label="templates" />
            <Stat number="4.8/5" label="average rating" />
          </div>
          <p className="mt-4 text-sm text-slate-600">These numbers represent typical performance for medium-sized rooms and are subject to network conditions.</p>
        </div>

        <div className="glass p-6">
          <h3 className="text-lg font-semibold">Roadmap & focus areas</h3>
          <ol className="mt-3 list-decimal list-inside text-slate-700 space-y-2">
            <li>Offline-first canvas and conflict resolution improvements.</li>
            <li>Advanced permissions and per-room cryptographic keys.</li>
            <li>Deeper integrations with Figma, Notion, and Slack.</li>
            <li>Improved export formats and presentation modes.</li>
          </ol>
        </div>
      </div>

      <div className="max-w-6xl mx-auto glass p-6">
        <h3 className="text-lg font-semibold">People & culture</h3>
        <p className="mt-3 text-slate-700">We are a small cross-functional team focused on design-driven engineering. We ship often, iterate with customers, and value clear communication.</p>
        <div className="mt-4 grid sm:grid-cols-3 gap-4">
          <div>
            <div className="font-semibold">Ava Chen</div>
            <div className="text-sm text-slate-500">Founder & CEO</div>
          </div>
          <div>
            <div className="font-semibold">Diego Morales</div>
            <div className="text-sm text-slate-500">Engineering</div>
          </div>
          <div>
            <div className="font-semibold">Priya Singh</div>
            <div className="text-sm text-slate-500">Design</div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto text-center">
        <h3 className="text-lg font-semibold">Work with us</h3>
        <p className="mt-2 text-slate-700">Interested in partnering or joining the team? Email <a className="text-indigo-600" href="mailto:hello@pixelpact.example">hello@pixelpact.example</a>.</p>
      </div>
    </section>
  )
}
