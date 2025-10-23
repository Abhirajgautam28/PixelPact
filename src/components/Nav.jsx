import React from 'react'
import { Link, useLocation } from 'react-router-dom'

export default function Nav() {
  const loc = useLocation()
  return (
    <header className="border-b glass">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#FF6B6B] to-[#FFD93D] rounded-lg flex items-center justify-center animate-float-slow">
            <div className="text-white font-bold">PP</div>
          </div>
          <h1 className="text-lg font-semibold">PixelPact <span className="emoji">✨</span></h1>
        </div>
        <nav className="flex items-center gap-4">
          <Link className={`text-sm ${loc.pathname==='/'? 'font-semibold text-[#6C5CE7]':'text-slate-700'} transition`} to="/">Home</Link>
          <Link className={`text-sm ${loc.pathname==='/about'? 'font-semibold text-[#6C5CE7]':'text-slate-700'} transition`} to="/about">About</Link>
          <Link className={`text-sm ${loc.pathname==='/pricing'? 'font-semibold text-[#6C5CE7]':'text-slate-700'} transition`} to="/pricing">Pricing</Link>
          <Link className={`text-sm ${loc.pathname==='/demo'? 'font-semibold text-[#6C5CE7]':'text-slate-700'} transition`} to="/demo">Demo</Link>
          <Link to="/demo" className="ml-4 px-4 py-2 rounded-md bg-[#6C5CE7] text-white">Try it 🚀</Link>
        </nav>
      </div>
    </header>
  )
}
