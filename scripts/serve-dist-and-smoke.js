import http from 'http'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distDir = path.join(__dirname, '..', 'dist')
const port = process.env.PORT ? Number(process.env.PORT) : 4173

function contentType(file){
  const ext = path.extname(file).toLowerCase()
  const map = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff2': 'font/woff2'
  }
  return map[ext] || 'application/octet-stream'
}

function serveFile(filePath, res){
  fs.stat(filePath, (err, stats)=>{
    if (err || !stats.isFile()){
      res.statusCode = 404; res.end('Not found')
      return
    }
    res.setHeader('Content-Type', contentType(filePath))
    const stream = fs.createReadStream(filePath)
    stream.pipe(res)
  })
}

const server = http.createServer((req, res)=>{
  let url = req.url.split('?')[0]
  if (url === '/') url = '/index.html'
  // map SPA routes to index.html
  const p = path.join(distDir, url)
  if (p.startsWith(distDir) && fs.existsSync(p) && fs.statSync(p).isFile()){
    serveFile(p, res)
  } else {
    // return index.html for SPA routes
    serveFile(path.join(distDir, 'index.html'), res)
  }
})

server.listen(port, '127.0.0.1', async ()=>{
  console.log(`Serving dist on http://127.0.0.1:${port}`)
  try{
    await runChecks(`http://127.0.0.1:${port}`)
  }catch(err){
    console.error('Smoke checks failed:', err)
  }
  console.log('Server is running in foreground. Press Ctrl+C to stop.')
})

async function delay(ms){ return new Promise(r=>setTimeout(r, ms)) }

async function fetchUrl(url){
  try{
    const res = await fetch(url)
    const text = await res.text()
    return { ok: res.ok, status: res.status, size: text.length, text }
  }catch(err){
    return { ok: false, error: String(err) }
  }
}

async function tryFetchWithRetries(url, retries = 6, initialDelay = 400){
  let attempt = 0
  let delayMs = initialDelay
  while(attempt < retries){
    const r = await fetchUrl(url)
    if (r.ok) return r
    attempt++
    console.log(`Attempt ${attempt}/${retries} failed for ${url}. Retrying in ${delayMs}ms...`)
    await delay(delayMs)
    delayMs *= 1.8
  }
  return { ok: false, error: `failed after ${retries} attempts` }
}

async function runChecks(base){
  const page = '/demo'
  console.log('Running smoke checks against', base+page)
  const r = await tryFetchWithRetries(base+page, 8, 400)
  if (!r.ok){
    console.error('HTML fetch failed:', r)
    return
  }
  console.log(`HTML OK status=${r.status} bodySize=${r.size}`)
  const scriptRe = /<script[^>]+type=["']module["'][^>]*src=["']([^"']+)["'][^>]*>/gi
  const srcs = []
  let m
  while((m = scriptRe.exec(r.text))){
    let src = m[1]
    if (src.startsWith('/')) src = base + src
    else if (!src.startsWith('http')) src = base + '/' + src
    srcs.push(src)
  }
  if (srcs.length===0) console.log('No module scripts found in HTML (Vite may inline the entry).')
  for (const s of srcs){
    console.log('Fetching module:', s)
    const rr = await tryFetchWithRetries(s, 6, 300)
    console.log(' ->', rr.ok ? `status=${rr.status} size=${rr.size}` : `error=${rr.error}`)
  }
  console.log('Smoke checks completed')
}
