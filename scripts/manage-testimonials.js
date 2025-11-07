#!/usr/bin/env node
// Simple CLI to manage server/testimonials.json
// Usage:
//  node scripts/manage-testimonials.js list
//  node scripts/manage-testimonials.js add --name "Name" --role "Role" --text "Testimonial text"
//  node scripts/manage-testimonials.js remove --index 2

import fs from 'fs'
import path from 'path'

const p = path.resolve(process.cwd(), 'server', 'testimonials.json')
function read(){
  if (!fs.existsSync(p)) return []
  try{ return JSON.parse(fs.readFileSync(p, 'utf8') || '[]') }catch(e){ console.error('Failed to parse testimonials.json:', e.message); process.exit(2) }
}
function write(arr){
  fs.writeFileSync(p, JSON.stringify(arr, null, 2), 'utf8')
}

function usage(){
  console.log('Usage: manage-testimonials.js <list|add|remove> [options]\n')
  console.log('Commands:')
  console.log('  list                              Show all testimonials')
  console.log('  add --name "Name" --role "Role" --text "Text"   Add a testimonial')
  console.log('  remove --index <n>                Remove testimonial by index (0-based)')
  process.exit(1)
}

const args = process.argv.slice(2)
if (args.length === 0) usage()
const cmd = args[0]

function parseOpts(argv){
  const out = {}
  for(let i=0;i<argv.length;i++){
    const a = argv[i]
    if (a.startsWith('--')){
      const key = a.slice(2)
      const val = argv[i+1]
      out[key] = val
      i++
    }
  }
  return out
}

if (cmd === 'list'){
  const arr = read()
  if (!arr || arr.length === 0) { console.log('No testimonials present') ; process.exit(0) }
  arr.forEach((t,i)=>{
    console.log(`#${i}: ${t.name} — ${t.role}\n  ${t.text}\n`)
  })
  process.exit(0)
}

if (cmd === 'add'){
  const opts = parseOpts(args.slice(1))
  if (!opts.name || !opts.role || !opts.text) { console.error('add requires --name --role --text'); usage() }
  const arr = read()
  arr.push({ name: opts.name, role: opts.role, text: opts.text })
  write(arr)
  console.log('Added testimonial. Total now:', arr.length)
  process.exit(0)
}

if (cmd === 'remove'){
  const opts = parseOpts(args.slice(1))
  const idx = parseInt(opts.index,10)
  if (isNaN(idx)) { console.error('remove requires --index <n>'); usage() }
  const arr = read()
  if (idx < 0 || idx >= arr.length) { console.error('index out of range'); process.exit(2) }
  const removed = arr.splice(idx,1)
  write(arr)
  console.log('Removed:', removed[0].name)
  process.exit(0)
}

usage()
