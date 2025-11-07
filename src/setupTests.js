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

// Silence jsdom "Not implemented: HTMLCanvasElement.prototype.getContext" messages in test output
// by filtering that exact message from console.error during tests.
if (typeof console !== 'undefined' && console.error) {
	const origConsoleError = console.error.bind(console)
	console.error = (...args) => {
		try {
			const first = args[0]
			if (typeof first === 'string' && first.includes('Not implemented: HTMLCanvasElement.prototype.getContext')) {
				return
			}
		} catch (e) {
			// ignore
		}
		origConsoleError(...args)
	}
}

// Also filter that message from process.stderr (jsdom VirtualConsole writes there)
if (typeof process !== 'undefined' && process.stderr && typeof process.stderr.write === 'function') {
	const origWrite = process.stderr.write.bind(process.stderr)
	process.stderr.write = (chunk, encoding, cb) => {
		try{
			const s = typeof chunk === 'string' ? chunk : (chunk && chunk.toString ? chunk.toString() : '')
			if (s && s.includes('Not implemented: HTMLCanvasElement.prototype.getContext')) return true
		}catch(e){ }
		return origWrite(chunk, encoding, cb)
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
// Attach mocks to the JSDOM window's HTMLCanvasElement when available
const CanvasCtor = global.window && global.window.HTMLCanvasElement ? global.window.HTMLCanvasElement : null
if (CanvasCtor) {
	// expose on global for any code that expects it
	global.HTMLCanvasElement = CanvasCtor
	const proto = CanvasCtor.prototype
	const originalGetContext = proto.getContext
	proto.getContext = function (type) {
		try {
			if (typeof originalGetContext === 'function') {
				const res = originalGetContext.call(this, type)
				if (res) return res
			}
		} catch (e) {
			// ignore and return mock
		}
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

	proto.getBoundingClientRect = proto.getBoundingClientRect || function () {
		return { width: 600, height: 360, left: 0, top: 0 }
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
