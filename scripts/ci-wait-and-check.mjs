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
