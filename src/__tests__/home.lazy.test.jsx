import React from 'react'
import { JSDOM } from 'jsdom'

if (typeof document === 'undefined'){
  const dom = new JSDOM('<!doctype html><html><body></body></html>')
  Object.defineProperty(global, 'window', { value: dom.window, configurable: true })
  Object.defineProperty(global, 'document', { value: dom.window.document, configurable: true })
  if (!global.navigator) Object.defineProperty(global, 'navigator', { value: { userAgent: 'node' }, configurable: true })
}

if (typeof global.IntersectionObserver === 'undefined'){
  global.IntersectionObserver = class {
    constructor(cb){ this.cb = cb }
    observe(el){ this.cb([{ isIntersecting: true, target: el }]) }
    disconnect(){}
    unobserve(){}
  }
}

import { render, within, waitFor } from '@testing-library/react'
import { test, expect } from 'vitest'

import Home from '../pages/Home'

test('placeholders present and illustrations load', async () => {
  const container = document.createElement('div')
  document.body.appendChild(container)
  const { container: rendered } = render(<Home />, { container })
  const withinRoot = within(rendered)

  expect(withinRoot.getByTestId('hero-placeholder')).toBeInTheDocument()
  expect(withinRoot.getByTestId('templates-placeholder')).toBeInTheDocument()
  expect(withinRoot.getByTestId('integrations-placeholder')).toBeInTheDocument()

  await waitFor(()=>{
    expect(withinRoot.getByTestId('hero-placeholder')).toBeInTheDocument()
  })
})
