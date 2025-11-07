// Preload to run as early as possible to suppress noisy warnings emitted during module import
// This file is intended to be required via NODE_OPTIONS='-r ./src/test-preload.js'

// Filter specific React Router future flag warnings and jsdom canvas 'Not implemented' messages
if (typeof console !== 'undefined') {
  const origWarn = console.warn && console.warn.bind(console)
  console.warn = (...args) => {
    try {
      const first = args[0]
      if (typeof first === 'string' && first.includes('React Router Future Flag Warning')) return
    } catch (e) {}
    if (origWarn) origWarn(...args)
  }
  const origError = console.error && console.error.bind(console)
  console.error = (...args) => {
    try {
      const first = args[0]
      if (typeof first === 'string' && first.includes('Not implemented: HTMLCanvasElement.prototype.getContext')) return
      if (typeof first === 'string' && first.includes('React Router Future Flag Warning')) return
    } catch (e) {}
    if (origError) origError(...args)
  }
}

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
