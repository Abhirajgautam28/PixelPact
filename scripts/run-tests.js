#!/usr/bin/env node
// Cross-platform test runner: sets NODE_OPTIONS preload and runs Vitest with provided args
import { spawn } from 'child_process'
import path from 'path'

// Simple wrapper: ensure our preload is included in NODE_OPTIONS and try a programmatic
// invocation of Vitest. If that fails we fall back to a shell `npx vitest` invocation.
const projectRoot = process.cwd()
const preloadPath = path.resolve(projectRoot, 'src', 'test-preload.js')

const env = { ...process.env }
const existing = env.NODE_OPTIONS ? env.NODE_OPTIONS + ' ' : ''
env.NODE_OPTIONS = `${existing}-r ${preloadPath}`

// CLI args passed to vitest
const argv = process.argv.slice(2)
const vitestArgs = argv.length ? argv : ['run']

const cmdStr = `npx vitest ${vitestArgs.map(a => JSON.stringify(a)).join(' ')}`
const child = spawn(cmdStr, { stdio: 'inherit', env, shell: true })

child.on('close', (code) => {
	process.exit(typeof code === 'number' ? code : 0)
})
child.on('error', (err) => {
	console.error('Failed to spawn vitest:', err)
	process.exit(1)
})
// Preload the test-preload module so early warnings are suppressed when running programmatically
async function ensurePreload(){
	try{
		await import(path.resolve(projectRoot, 'src', 'test-preload.js'))
	}catch(e){ /* ignore preload errors */ }
}

async function runProgrammatic(){
	// Try different possible module exports for compatibility across Vitest versions
	try{
		const mod = await import('vitest')
		// possible shapes: { run }, default export function, or { runVitest }
		const runFn = mod.run || mod.default?.run || mod.default || mod.runVitest || mod.start || null
		if (typeof runFn === 'function'){
			// call with argv-like args; many versions accept an argv array
			const res = await runFn(vitestArgs)
			// try to determine exit code
			const code = (res && (res.exitCode ?? res?.failed ? 1 : 0)) || 0
			process.exit(Number(code))
		}
		throw new Error('No runnable export found on vitest module')
	}catch(err){
		// Propagate error to caller so fallback can run
		throw err
	}
}

function runFallbackShell(){
	// Use a shell-invoked npx to run local vitest reliably across environments
	const cmdStr = `npx vitest ${vitestArgs.map(a => JSON.stringify(a)).join(' ')}`
	const child = spawn(cmdStr, { stdio: 'inherit', env, shell: true })
	child.on('close', (code) => process.exit(typeof code === 'number' ? code : 0))
	child.on('error', (err) => { console.error('Failed to spawn vitest:', err); process.exit(1) })
}

// Main runner
(async ()=>{
	await ensurePreload()
	try{
		await runProgrammatic()
	}catch(err){
		// If programmatic invocation fails, fall back to shell invocation. Log a short message.
		console.warn('Programmatic vitest run failed, falling back to shell invocation:', err && err.message ? err.message : err)
		runFallbackShell()
	}
})()