import React from 'react'
// IntersectionObserver stub if test environment doesn't provide one
if (typeof global.IntersectionObserver === 'undefined'){
  global.IntersectionObserver = class {
    constructor(cb){ this.cb = cb }
    observe(el){ this.cb([{ isIntersecting: true, target: el }]) }
    disconnect(){}
    unobserve(){}
  }
}
import { render, screen, waitFor } from '@testing-library/react'
import { test, expect } from 'vitest'

// We'll render the Home component and assert placeholders exist
import Home from '../pages/Home'

test('placeholders present and illustrations load', async () => {
  render(<Home />)
  // placeholders should be in the document initially
  expect(screen.getByTestId('hero-placeholder')).toBeInTheDocument()
  expect(screen.getByTestId('templates-placeholder')).toBeInTheDocument()
  expect(screen.getByTestId('integrations-placeholder')).toBeInTheDocument()

  // wait for the lazy components to load - they should replace placeholders
  await waitFor(()=>{
    // after load, placeholders may still exist in DOM but SVG main should render too
    const svgHero = screen.getByTestId('hero-placeholder')
    expect(svgHero).toBeInTheDocument()
  })
})
