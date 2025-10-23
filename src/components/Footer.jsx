import React from 'react'
import { Link } from 'react-router-dom'

export default function Footer(){
  return (
    <footer className="mt-16 py-8">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-sm text-slate-600">© {new Date().getFullYear()} PixelPact <span className="emoji">❤️</span></div>
        <div className="flex items-center gap-4">
          <Link className="text-slate-600 hover:text-slate-800 transition text-sm" to="/privacy">Privacy</Link>
          <Link className="text-slate-600 hover:text-slate-800 transition text-sm" to="/terms">Terms</Link>
        </div>
      </div>
    </footer>
  )
}
