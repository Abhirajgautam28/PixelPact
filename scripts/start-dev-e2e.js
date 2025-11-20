#!/usr/bin/env node
/*
  Cross-platform helper to start both the backend server and the Vite frontend for
  local E2E runs. It starts the processes in the background, writes PID files,
  waits for readiness on configured ports, and prints helpful info.

  Usage: node scripts/start-dev-e2e.js
*/
import { spawn } from 'child_process'
import fs from 'fs'
import http from 'http'
import { fileURLToPath } from 'url'
import path from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function writePid(file, pid){
  try{ fs.writeFileSync(path.resolve(process.cwd(), file), String(pid), 'utf8') }catch(e){}
}

function waitFor(url, timeout = 30000){
  const start = Date.now()
  return new Promise((resolve, reject)=>{
    const check = () => {
      http.get(url, (res)=>{ res.resume(); resolve(true) }).on('error', ()=>{
        if (Date.now() - start > timeout) return reject(new Error(`timeout waiting for ${url}`))
        setTimeout(check, 500)
      })
    }
    check()
  })
}

async function main(){
  console.log('Starting backend server...')
  const serverProc = spawn(process.execPath, ['server/index.js'], { stdio: ['ignore','inherit','inherit'], shell: false })
  writePid('server.pid', serverProc.pid)
  console.log('backend pid:', serverProc.pid)

  console.log('Starting frontend (Vite)...')
  const viteProc = spawn(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run','dev'], { stdio: ['ignore','inherit','inherit'], shell: false })
  writePid('vite.pid', viteProc.pid)
  console.log('vite pid:', viteProc.pid)

  try{
    await waitFor('http://127.0.0.1:3001/api/_health', 60000)
    console.log('backend ready')
  }catch(e){
    console.error('backend did not become ready:', e && e.message)
    process.exitCode = 1
    return
  }
  try{
    await waitFor('http://127.0.0.1:5173/', 60000)
    console.log('frontend ready')
  }catch(e){
    console.error('frontend did not become ready:', e && e.message)
    process.exitCode = 1
    return
  }
  console.log('Both services are ready. PIDs written to server.pid and vite.pid')
  console.log('To stop: npm run stop:server')
}

if (process.argv.includes('--help') || process.argv.includes('-h')){
  console.log('Usage: node scripts/start-dev-e2e.js')
  process.exit(0)
}

main()
