import React from 'react'
import Nav from './components/Nav'
import Hero from './components/Hero'
import Features from './components/Features'
import Footer from './components/Footer'

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-[#0f172a] to-black text-slate-100">
      <Nav />
      <main className="max-w-7xl mx-auto px-6 py-12">
        <Hero />
        <Features />
      </main>
      <Footer />
    </div>
  )
}
