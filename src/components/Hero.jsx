import React from 'react'

export default function Hero() {
  return (
    <section className="grid lg:grid-cols-2 gap-10 items-center py-12">
      <div>
        <h2 className="text-4xl sm:text-5xl font-extrabold leading-tight">
          Collaborative whiteboarding, reimagined for teams
        </h2>
        <p className="mt-4 text-slate-300 max-w-xl">PixelPact lets teams sketch, brainstorm, and prototype together in real-time. High fidelity tools, low friction collaboration.</p>

        <div className="mt-8 flex items-center gap-4">
          <button className="px-6 py-3 rounded-md bg-accent text-black font-semibold shadow-lg hover:scale-[1.02] transition-transform">Start a room</button>
          <button className="px-6 py-3 rounded-md border border-slate-700 text-slate-200 hover:bg-slate-800 transition">Watch demo</button>
        </div>

        <div className="mt-6 text-sm text-slate-400">Trusted by designers and product teams at startups and enterprises.</div>
      </div>

      <div className="relative">
        <div className="w-full aspect-[4/3] rounded-xl overflow-hidden glass border border-slate-800 shadow-2xl">
          <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 p-6">
            <div className="w-full h-full bg-gradient-to-br from-[#071029] to-transparent rounded-md flex items-center justify-center text-slate-500">Interactive Canvas Preview</div>
          </div>
        </div>
      </div>
    </section>
  )
}
