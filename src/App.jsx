import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Nav from './components/Nav'
import Footer from './components/Footer'
import Home from './pages/Home'
import About from './pages/About'
import Pricing from './pages/Pricing'
import Demo from './pages/Demo'
import Privacy from './pages/Privacy'
import Terms from './pages/Terms'

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen text-slate-900">
        <Nav />
        <main className="max-w-7xl mx-auto px-6 py-12">
          <Routes>
            <Route path="/" element={<Home/>} />
            <Route path="/about" element={<About/>} />
            <Route path="/pricing" element={<Pricing/>} />
            <Route path="/demo" element={<Demo/>} />
            <Route path="/privacy" element={<Privacy/>} />
            <Route path="/terms" element={<Terms/>} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  )
}
