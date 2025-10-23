import '@testing-library/jest-dom'
import { JSDOM } from 'jsdom'

// Create a minimal DOM for environments that don't provide one.
if (typeof global.window === 'undefined') {
	const dom = new JSDOM('<!doctype html><html><body></body></html>')
	global.window = dom.window
	global.document = dom.window.document
	global.navigator = {
		userAgent: 'node.js',
	}
}

// Simple IntersectionObserver stub to make useInView hook predictable in tests
if (typeof global.IntersectionObserver === 'undefined') {
	global.IntersectionObserver = class {
		constructor(cb) { this.cb = cb }
		observe(el) { this.cb([{ isIntersecting: true, target: el }]) }
		disconnect() { }
		unobserve() { }
	}
}
