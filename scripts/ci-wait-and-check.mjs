#!/usr/bin/env node
// Wait for endpoints to be ready, otherwise print server and vite logs for debugging
import http from 'http'
import fs from 'fs'
import { promisify } from 'util'

const waitOn = (url, timeout=60000, interval=1000)=> new Promise((resolve, reject)=>{
  const start = Date.now()
  const check = ()=>{
    const req = http.request(url, { method: 'GET', timeout: 2000 }, (res)=>{ res.resume(); resolve(true) })
    req.on('error', ()=>{
      if (Date.now() - start > timeout) return reject(new Error('timeout'))
      setTimeout(check, interval)
    })
    req.on('timeout', ()=>{ req.destroy(); if (Date.now() - start > timeout) return reject(new Error('timeout')); setTimeout(check, interval) })
    req.end()
  }
  check()
})

async function main(){
  const args = process.argv.slice(2)
  const urls = args.length ? args : ['http://localhost:3001/api/rooms','http://localhost:5173']
  try{
    for(const u of urls){
      process.stdout.write(`Waiting for ${u} ... `)
      await waitOn(u, 60000)
      console.log('ok')
    }
    // additionally, try creating a room and verifying rendered HTML contains the app title
    try{
      const roomResp = await new Promise((res, rej)=>{
        const req = http.request('http://localhost:3001/api/rooms', { method: 'POST', headers: { 'Content-Type':'application/json' }, timeout: 2000 }, (r)=>{
          let b=''
          r.on('data', c=> b += c)
          r.on('end', ()=> res({ statusCode: r.statusCode, body: b }))
        })
        req.on('error', rej)
        req.on('timeout', ()=> req.destroy())
        req.write('{}')
        req.end()
      })
      const parsed = JSON.parse(roomResp.body || '{}')
      const roomId = parsed.roomId || parsed.id || parsed._id
      if (roomId){
        const boardUrl = `http://localhost:5173/board/${roomId}`
        await waitOn(boardUrl, 15000)
        // fetch HTML and check title
        const html = await new Promise((res, rej)=>{
          const r = http.request(boardUrl, { method: 'GET', timeout: 3000 }, (resp)=>{
            let t=''
            resp.on('data', c=> t += c)
            resp.on('end', ()=> res(t))
          })
          r.on('error', rej)
          r.end()
        })
        if (!html || !html.includes('PixelPact')) throw new Error('board HTML missing title')
      }
    }catch(e){ console.warn('board render check failed:', e && e.message) }
    process.exit(0)
  }catch(err){
    console.error('\nService readiness timeout. Collecting logs...')
    const logFiles = ['server.log','vite.log']
    for(const f of logFiles){
      try{
        const path = new URL('file://' + process.cwd() + '/' + f).pathname
        if (fs.existsSync(path)){
          console.error('\n== ' + f + ' (last 200 lines) ==')
          const txt = fs.readFileSync(path,'utf8')
          const lines = txt.split(/\r?\n/).slice(-200).join('\n')
          console.error(lines)
        } else {
          console.error(`\n== ${f} not found ==`)
        }
      }catch(e){ console.error('error reading', f, e.message) }
    }
    process.exit(2)
  }
}

main()
