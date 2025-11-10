import React, { useContext } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AuthContext } from '../contexts/AuthContext'

export default function Nav() {
  const loc = useLocation()
  const { user } = useContext(AuthContext)
  const nav = useNavigate()
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
          <Link className={`text-sm ${loc.pathname==='/'? 'font-semibold text-primary':'text-slate-700'} transition`} to="/">Home</Link>
          <Link
            className={`text-sm ${loc.pathname==='/about'? 'font-semibold text-primary':'text-slate-700'} transition`}
            to="/about"
            onMouseEnter={() => import('../pages/About')}
            onFocus={() => import('../pages/About')}
          >About</Link>
          <Link className={`text-sm ${loc.pathname==='/pricing'? 'font-semibold text-primary':'text-slate-700'} transition`} to="/pricing">Pricing</Link>
          <Link className={`text-sm ${loc.pathname==='/demo'? 'font-semibold text-primary':'text-slate-700'} transition`} to="/demo">Demo</Link>
          <button onClick={()=> user ? nav('/board/new') : nav('/register')} className="ml-4 px-4 py-2 rounded-md bg-primary text-white">Try it 🚀</button>
        </nav>
      </div>
    </header>
  )
}
