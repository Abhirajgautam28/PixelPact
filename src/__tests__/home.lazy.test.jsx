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

    const hero = withinRoot.getByTestId('hero-placeholder')
    const tpl = withinRoot.getByTestId('templates-placeholder')
    const integ = withinRoot.getByTestId('integrations-placeholder')

    expect(hero).toBeTruthy()
    expect(tpl).toBeTruthy()
    expect(integ).toBeTruthy()

    // placeholders should contain lazy-loading img tags
    expect(hero.querySelector('img')?.getAttribute('loading')).toBe('lazy')
    expect(tpl.querySelector('img')?.getAttribute('loading')).toBe('lazy')
    expect(integ.querySelector('img')?.getAttribute('loading')).toBe('lazy')

    // feature cards should receive animation classes once in view
    await waitFor(()=>{
      const cards = rendered.querySelectorAll('.glass.transform')
      expect(cards.length).toBeGreaterThanOrEqual(3)
      // at least first card should have been transitioned to opacity-100 (string match) once in view
      const first = cards[0]
      expect(first.className.includes('opacity-100') || first.className.includes('translate-y-0')).toBeTruthy()
    })
})
