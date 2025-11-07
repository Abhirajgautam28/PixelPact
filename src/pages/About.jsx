import React from 'react'

function Pill({ children }){
  return <span className="inline-block bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm mr-2 mb-2">{children}</span>
}

export default function About(){
  return (
    <section className="space-y-8">
      <header>
        <h2 className="text-3xl font-extrabold">About PixelPact</h2>
        <p className="mt-2 text-slate-700 max-w-2xl">PixelPact is a modern collaborative whiteboard built for teams that move fast. We combine low-latency realtime sync, a flexible toolset, and templates that help teams ideate, prototype, and present — all in one place.</p>
      </header>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="glass p-6">
          <h3 className="text-lg font-semibold">Our mission</h3>
          <p className="mt-3 text-slate-700">Empower teams to collaborate visually with speed and clarity. We focus on realtime performance, a tiny learning curve for guests, and exportable artifacts for handoff.</p>
          <div className="mt-4">
            <Pill>Realtime sync</Pill>
            <Pill>Templates</Pill>
            <Pill>Enterprise-ready</Pill>
          </div>
        </div>

        <div className="glass p-6">
          <h3 className="text-lg font-semibold">Why teams choose PixelPact</h3>
          <ul className="mt-3 space-y-2 text-slate-700 list-inside list-disc">
            <li>Low-latency collaborative canvas with live cursors and presence indicators.</li>
            <li>Layered shapes, vector tools, text and sticky notes for structured workshops.</li>
            <li>Templates for workshops, retros, design critiques and customer journeys.</li>
          </ul>
        </div>

        <div className="glass p-6">
          <h3 className="text-lg font-semibold">Security & Compliance</h3>
          <p className="mt-3 text-slate-700">We offer SSO, SCIM provisioning, and delegated admin controls for enterprise customers. Data at rest is encrypted and access is audited for compliance needs.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass p-6">
          <h3 className="text-lg font-semibold">Roadmap highlights</h3>
          <ol className="mt-3 list-decimal list-inside text-slate-700 space-y-2">
            <li>Offline-first canvas improvements & conflict resolution.</li>
            <li>Advanced permission roles and per-room encryption keys.</li>
            <li>Native integrations with Figma, Notion and Slack for live embeds.</li>
          </ol>
        </div>

        <div className="glass p-6">
          <h3 className="text-lg font-semibold">Meet the team</h3>
          <div className="mt-3 text-slate-700 space-y-3">
            <div>
              <div className="font-semibold">Ava Chen</div>
              <div className="text-sm text-slate-500">Founder & CEO — product & vision</div>
            </div>
            <div>
              <div className="font-semibold">Diego Morales</div>
              <div className="text-sm text-slate-500">Engineering — realtime and infra</div>
            </div>
            <div>
              <div className="font-semibold">Priya Singh</div>
              <div className="text-sm text-slate-500">Design & UX</div>
            </div>
          </div>
        </div>
      </div>

      <div className="glass p-6">
        <h3 className="text-lg font-semibold">Contact & careers</h3>
        <p className="mt-3 text-slate-700">Interested in partnering, evaluating PixelPact for your organization, or joining the team? Email us at <a className="text-indigo-600" href="mailto:hello@pixelpact.example">hello@pixelpact.example</a> — we reply to every message.</p>
      </div>
    </section>
  )
}
