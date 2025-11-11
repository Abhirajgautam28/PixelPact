#!/usr/bin/env node
import { spawn } from 'child_process'

const maxAttempts = 2
let attempt = 1

function runOnce(){
  return new Promise((resolve)=>{
    console.log(`Running Playwright attempt ${attempt}/${maxAttempts+1}`)
    const proc = spawn('npx', ['playwright', 'test', '-c', 'playwright.config.ts', '--project=chromium'], { stdio: 'inherit', shell: true })
    proc.on('close', (code)=> resolve(code))
  })
}

;(async ()=>{
  let code = 1
  while(attempt <= maxAttempts+1){
    code = await runOnce()
    if (code === 0) break
    console.warn(`Playwright attempt ${attempt} failed with code ${code}`)
    attempt++
  }
  process.exit(code)
})()
