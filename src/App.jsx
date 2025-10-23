import React, { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Nav from './components/Nav'
import Footer from './components/Footer'

const Home = lazy(()=> import('./pages/Home'))
const About = lazy(()=> import('./pages/About'))
const Pricing = lazy(()=> import('./pages/Pricing'))
const Demo = lazy(()=> import('./pages/Demo'))
const Privacy = lazy(()=> import('./pages/Privacy'))
const Terms = lazy(()=> import('./pages/Terms'))

function Loader(){
  return <div className="text-center py-12">Loading…</div>
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen text-slate-900">
        <Nav />
        <main className="max-w-7xl mx-auto px-6 py-12">
          <Suspense fallback={<Loader/>}>
            <Routes>
              <Route path="/" element={<Home/>} />
              <Route path="/about" element={<About/>} />
              <Route path="/pricing" element={<Pricing/>} />
              <Route path="/demo" element={<Demo/>} />
              <Route path="/privacy" element={<Privacy/>} />
              <Route path="/terms" element={<Terms/>} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  )
}
