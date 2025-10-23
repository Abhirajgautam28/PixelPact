import React from 'react'

export default function Nav() {
  return (
    <header className="border-b border-slate-800 glass">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center animate-float-slow">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
              <path d="M3 12h18" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M12 3v18" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <h1 className="text-lg font-semibold">PixelPact</h1>
        </div>
        <nav className="flex items-center gap-4">
          <a className="text-slate-300 hover:text-white transition" href="#features">Features</a>
          <a className="text-slate-300 hover:text-white transition" href="#pricing">Pricing</a>
          <button className="ml-4 px-4 py-2 rounded-md bg-primary text-white hover:brightness-90 transition">Get Started</button>
        </nav>
      </div>
    </header>
  )
}
