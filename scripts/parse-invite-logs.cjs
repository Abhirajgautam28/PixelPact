const fs = require('fs')
const path = require('path')

function parseLog(filePath){
  const lines = fs.readFileSync(filePath,'utf8').split(/\r?\n/)
  const entries = []
  for (let i=0;i<lines.length;i++){
    const line = lines[i]
    if (line.includes("'http.target': '/api/rooms") || line.includes("'http.target': '/api/rooms/join-invite'") ){
      let timestamp = null; let name = null; let target = null; let status = null
      const mTarget = line.match(/'http.target': '([^']+)'/)
      if (mTarget) target = mTarget[1]
      for (let j=i-1;j>=Math.max(0,i-20);j--){
        const l = lines[j]
        const mt = l.match(/timestamp:\s*(\d+)/)
        if (mt && !timestamp) timestamp = mt[1]
        const mn = l.match(/name:\s*'([^']+)'/)
        if (mn && !name) name = mn[1]
        if (timestamp && name) break
      }
      for (let j=i;j<Math.min(lines.length,i+40);j++){
        const l = lines[j]
        const ms = l.match(/'http.status_code':\s*(\d+)/)
        if (ms){ status = parseInt(ms[1],10); break }
      }
      entries.push({ file: path.basename(filePath), line: i+1, timestamp, name, target, status })
    }
  }
  return entries
}

function run(){
  const base = path.resolve(process.cwd(), 'ci-artifacts-rerun')
  if (!fs.existsSync(base)){
    console.error('ci-artifacts-rerun not found')
    process.exit(2)
  }
  const serverDirs = fs.readdirSync(base).filter(n=>n.startsWith('server-log-'))
  const all = []
  for (const d of serverDirs){
    const p = path.join(base, d)
    const files = fs.readdirSync(p).filter(f=>f.endsWith('.log'))
    for (const f of files){
      const fp = path.join(p,f)
      try{ all.push(...parseLog(fp)) }catch(e){ console.error('parse failed', fp, e && e.message) }
    }
  }
  all.sort((a,b)=>{
    const ta = parseInt(a.timestamp||0,10)
    const tb = parseInt(b.timestamp||0,10)
    return ta - tb || a.file.localeCompare(b.file) || a.line - b.line
  })
  const out = path.resolve(process.cwd(),'ci-artifacts-rerun','invite-timeline.json')
  fs.writeFileSync(out, JSON.stringify(all, null, 2), 'utf8')
  console.log('wrote', out, 'entries', all.length)
}

run()
