import { setTimeout as delay } from 'timers/promises'
import fs from 'fs'

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

async function run(){
  const argvBase = process.env.BASE || process.argv[2]
  const base = argvBase || 'http://localhost:5173'
  const page = '/demo'
  console.log('Fetching', base+page)
  // try fetch with retries
  const r = await tryFetchWithRetries(base+page, 8, 500)
  if (!r.ok) {
    console.log('HTML fetch failed:', r)
    process.exitCode = 2
    return
  }
  console.log(`HTML OK status=${r.status} bodySize=${r.size}`)
  // find module script tags
  const scriptRe = /<script[^>]+type=["']module["'][^>]*src=["']([^"']+)["'][^>]*>/gi
  const srcs = []
  let m
  while((m = scriptRe.exec(r.text))){
    let src = m[1]
    if (src.startsWith('/')) src = base + src
    else if (!src.startsWith('http')) src = base + '/' + src
    srcs.push(src)
  }
  if (srcs.length===0) console.log('No module scripts found in HTML (this may be a Vite index with inline entry).')
  for (const s of srcs){
    console.log('Fetching module:', s)
    const rr = await tryFetchWithRetries(s, 6, 300)
    console.log(' ->', rr.ok ? `status=${rr.status} size=${rr.size}` : `error=${rr.error}`)
  }
  // attempt to fetch a likely dynamic import (try app entry)
  console.log('Done smoke HTTP checks')
}

run().catch(err=>{ console.error(err); process.exit(3) })
