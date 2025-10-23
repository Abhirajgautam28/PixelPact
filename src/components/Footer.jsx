import React from 'react'

export default function Footer(){
  return (
    <footer className="border-t border-slate-800 mt-16 py-8">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-sm text-slate-400">© {new Date().getFullYear()} PixelPact — Built for collaborative creativity.</div>
        <div className="flex items-center gap-4">
          <a className="text-slate-300 hover:text-white transition text-sm" href="#">Privacy</a>
          <a className="text-slate-300 hover:text-white transition text-sm" href="#">Terms</a>
        </div>
      </div>
    </footer>
  )
}
