import React, { Suspense, lazy } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Nav from './components/Nav'
import Footer from './components/Footer'

const Home = lazy(()=> import('./pages/Home'))
const About = lazy(()=> import('./pages/About'))
const Pricing = lazy(()=> import('./pages/Pricing'))
const Demo = lazy(()=> import('./pages/Demo'))
const Register = lazy(()=> import('./pages/Register'))
const Login = lazy(()=> import('./pages/Login'))
const Whiteboard = lazy(()=> import('./pages/Whiteboard'))
const AdminTestimonials = lazy(()=> import('./pages/AdminTestimonials'))
const Privacy = lazy(()=> import('./pages/Privacy'))
const Terms = lazy(()=> import('./pages/Terms'))

function Loader(){
  return <div className="text-center py-12">Loading…</div>
}

const router = createBrowserRouter([
  { path: '/', element: <Home/> },
  { path: '/about', element: <About/> },
  { path: '/pricing', element: <Pricing/> },
  { path: '/demo', element: <Demo/> },
  { path: '/privacy', element: <Privacy/> },
  { path: '/terms', element: <Terms/> },
  { path: '/register', element: <Register/> },
  { path: '/login', element: <Login/> },
  { path: '/admin/testimonials', element: <AdminTestimonials/> },
  { path: '/board/:id', element: <Whiteboard/> },
], { future: { v7_startTransition: true, v7_relativeSplatPath: true } })

export default function App() {
  return (
    <div className="min-h-screen text-slate-900">
      <Nav />
      <main className="max-w-7xl mx-auto px-6 py-12">
        <Suspense fallback={<Loader/>}>
          <RouterProvider router={router} />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
