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

// Mock canvas methods used by Demo canvas in jsdom environment
if (typeof HTMLCanvasElement !== 'undefined') {
	if (typeof HTMLCanvasElement.prototype.getContext === 'undefined') {
		HTMLCanvasElement.prototype.getContext = function () {
			// Return a minimal 2D context mock
			return {
				scale: () => {},
				beginPath: () => {},
				moveTo: () => {},
				lineTo: () => {},
				stroke: () => {},
				clearRect: () => {},
				fillRect: () => {},
				strokeStyle: '#000',
				lineWidth: 1,
				lineCap: 'round',
				lineJoin: 'round',
			}
		}
	}

	// Provide a sensible getBoundingClientRect used by Demo canvas resize logic
	if (typeof HTMLCanvasElement.prototype.getBoundingClientRect === 'undefined') {
		HTMLCanvasElement.prototype.getBoundingClientRect = function () {
			return { width: 600, height: 360, left: 0, top: 0 }
		}
	}
}

// Lightweight lottie-web stub to avoid loading full animation runtime in tests
if (typeof global.lottie === 'undefined') {
	global.lottie = {
		loadAnimation: (opts = {}) => {
			// return a fake animation controller with a destroy method
			return { destroy: () => {} }
		}
	}
}
