import React from 'react'
import { test, expect } from 'vitest'
import { render, fireEvent, within } from '@testing-library/react'

// ensure document/window exist for environments that don't provide jsdom automatically
if (typeof document === 'undefined'){
  const { JSDOM } = await import('jsdom')
  const dom = new JSDOM('<!doctype html><html><body></body></html>')
  // set globals similar to other tests
  // eslint-disable-next-line no-undef
  global.window = dom.window
  // eslint-disable-next-line no-undef
  global.document = dom.window.document
  if (!global.navigator) global.navigator = { userAgent: 'node' }
}

import { MemoryRouter, Routes, Route } from 'react-router-dom'
import Nav from '../components/Nav'
// Import real pages so the integration test exercises actual app behavior.
// Heavy runtime pieces (canvas, lottie) are safely stubbed in src/setupTests.js
import Home from '../pages/Home'
import About from '../pages/About'
import Pricing from '../pages/Pricing'
import Demo from '../pages/Demo'

// Ensure IntersectionObserver exists in test environment (same as setupTests.js)
if (typeof global.IntersectionObserver === 'undefined') {
  global.IntersectionObserver = class {
    constructor(cb) { this.cb = cb }
    observe(el) { this.cb([{ isIntersecting: true, target: el }]) }
    disconnect() { }
    unobserve() { }
  }
}

test('navigation via header links loads appropriate pages', async ()=>{
  const { container } = render(
    <MemoryRouter initialEntries={['/']}>
      <Nav />
      <main>
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/about" element={<About/>} />
          <Route path="/pricing" element={<Pricing/>} />
          <Route path="/demo" element={<Demo/>} />
        </Routes>
      </main>
    </MemoryRouter>
  )

  const about = container.querySelector('a[href="/about"]')
  const pricing = container.querySelector('a[href="/pricing"]')
  const demo = container.querySelector('a[href="/demo"]')
  expect(about).toBeTruthy()
  expect(pricing).toBeTruthy()
  expect(demo).toBeTruthy()

  fireEvent.click(about)
  // assert page heading (avoid matching nav link text)
  expect(await within(container).findByRole('heading', { name: /About PixelPact/i })).toBeTruthy()

  fireEvent.click(pricing)
  expect(await within(container).findByRole('heading', { name: /Pricing/i })).toBeTruthy()

  fireEvent.click(demo)
  expect(await within(container).findByRole('heading', { name: /Demo/i })).toBeTruthy()
})
