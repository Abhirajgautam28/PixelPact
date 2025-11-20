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
				if (typeof first === 'string' && (first.includes('Not implemented: HTMLCanvasElement.prototype.getContext') || first.includes('React Router Future Flag Warning'))) {
				return
			}
		} catch (e) {
			// ignore
		}
		origConsoleError(...args)
	}
}

	// Also filter React Router future-flag warnings from console.warn to keep test output clean
	if (typeof console !== 'undefined' && console.warn) {
		const origConsoleWarn = console.warn.bind(console)
		console.warn = (...args) => {
			try {
				const first = args[0]
				if (typeof first === 'string' && first.includes('React Router Future Flag Warning')) return
			} catch (e) { }
			origConsoleWarn(...args)
		}
	}

// Also filter that message from process.stderr (jsdom VirtualConsole writes there)
if (typeof process !== 'undefined' && process.stderr && typeof process.stderr.write === 'function') {
	const origWrite = process.stderr.write.bind(process.stderr)
	process.stderr.write = (chunk, encoding, cb) => {
		try{
			const s = typeof chunk === 'string' ? chunk : (chunk && chunk.toString ? chunk.toString() : '')
			if (s && (s.includes('Not implemented: HTMLCanvasElement.prototype.getContext') || s.includes('React Router Future Flag Warning'))) return true
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

		// Provide a lightweight mock for 2D and WebGL contexts. three.js will
		// request 'webgl' or 'webgl2' — ensure the returned object has
		// `getExtension` to avoid errors like "gl.getExtension is not a function".
		if (type && type.toLowerCase().includes('webgl')) {
				return {
				getExtension: () => null,
				getShaderPrecisionFormat: () => ({ rangeMin: 0, rangeMax: 0, precision: 23 }),
				createShader: () => ({}),
				shaderSource: () => {},
				compileShader: () => {},
				getShaderParameter: () => true,
				getShaderInfoLog: () => '',
				createProgram: () => ({}),
				attachShader: () => {},
				linkProgram: () => {},
				useProgram: () => {},
				getAttribLocation: () => 0,
				enableVertexAttribArray: () => {},
				vertexAttribPointer: () => {},
				bufferData: () => {},
				createBuffer: () => ({}),
				bindBuffer: () => {},
				createTexture: () => ({}),
				bindTexture: () => {},
				texImage2D: () => {},
				texImage3D: () => {},
				texParameteri: () => {},
				activeTexture: () => {},
				pixelStorei: () => {},
				generateMipmap: () => {},
				deleteTexture: () => {},
				clearDepth: () => {},
						clearStencil: () => {},
						stencilFunc: () => {},
						stencilMask: () => {},
						stencilOp: () => {},
						frontFace: () => {},
						cullFace: () => {},
				depthFunc: () => {},
				enable: () => {},
				disable: () => {},
				depthMask: () => {},
				viewport: () => {},
				clearColor: () => {},
				clear: () => {},
						createFramebuffer: () => ({}),
						bindFramebuffer: () => {},
						framebufferTexture2D: () => {},
						checkFramebufferStatus: () => 36053, // GL.FRAMEBUFFER_COMPLETE
						deleteFramebuffer: () => {},
						createRenderbuffer: () => ({}),
						bindRenderbuffer: () => {},
						renderbufferStorage: () => {},
						framebufferRenderbuffer: () => {},
						deleteRenderbuffer: () => {},
				getParameter: () => {
					// Always return a plausible WebGL version string so three.js
					// can safely call string methods like `.indexOf`.
					return 'WebGL 1.0'
				},
				getContextAttributes: () => ({ alpha: true }),
			}
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

// As a last-resort convenience for tests, replace three.js's WebGLRenderer
// with a lightweight stub so components that import `three` can create a
// renderer without exercising real GL code. This keeps tests fast and
// avoids having to implement the entire WebGL API surface.
try {
	// attempt commonjs require (works in this test harness)
	const THREE = require('three')
	if (THREE && THREE.WebGLRenderer) {
		const StubRenderer = function (opts = {}) {
			this.domElement = (typeof document !== 'undefined') ? document.createElement('canvas') : { style: {} }
			this.setPixelRatio = () => {}
			this.setSize = () => {}
			this.render = () => {}
			this.dispose = () => {}
			this.getContext = () => ({})
			this.setClearColor = () => {}
			this.renderLists = { dispose: () => {} }
		}
		// preserve identification where helpful
		StubRenderer.prototype = Object.create(Object.prototype)
		THREE.WebGLRenderer = StubRenderer
	}
} catch (e) {
	// ignore if require is not available or three isn't installed in test env
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

// Wrap/patch global.fetch so relative client fetches (e.g. `/api/testimonials`)
// do not throw inside jsdom when there is no suitable base URL provided.
// If an existing `fetch` is present, forward other requests to it.
{
	const orig = typeof global.fetch === 'function' ? global.fetch.bind(global) : null
	global.fetch = async (input, init) => {
		try {
			const url = typeof input === 'string' ? input : (input && input.url) || ''
			if (typeof url === 'string' && url.startsWith('/api/testimonials')) {
				return {
					ok: true,
					status: 200,
					json: async () => ([]),
				}
			}
		} catch (e) {
			// ignore and fallthrough to forwarding or noop
		}
		if (orig) return orig(input, init)
		return { ok: false, status: 404, json: async () => ({}) }
	}
}
