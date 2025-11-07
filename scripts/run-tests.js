#!/usr/bin/env node
// Cross-platform test runner: sets NODE_OPTIONS preload and runs Vitest with provided args
import path from 'path'
import { spawn } from 'child_process'
import { createRequire } from 'module'

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

// Preload the test-preload module so early warnings are suppressed when running programmatically
async function ensurePreload(){
	try{
		await import(path.resolve(projectRoot, 'src', 'test-preload.js'))
	}catch(e){ /* ignore preload errors */ }
}
async function runProgrammatic(){
	// Deterministic programmatic invocation: resolve the installed vitest binary
	// and spawn a node process to run it. This avoids relying on `npx` and
	// provides a reproducible local invocation for the installed package.
	try{
	// Resolve the vitest package root using a CommonJS resolver
	const require = createRequire(import.meta.url)
	const pkgPath = require.resolve('vitest/package.json', { paths: [process.cwd()] })
		const pkgDir = path.dirname(pkgPath)
		// common binary locations across versions
		const candidateBins = [
			path.join(pkgDir, 'bin', 'vitest.js'),
			path.join(pkgDir, 'dist', 'bin.js'),
			path.join(pkgDir, 'bin', 'vitest.mjs'),
			path.join(pkgDir, 'dist', 'node', 'index.js'),
			path.join(pkgDir, 'vitest.mjs')
		]
		let bin = null
		for(const c of candidateBins){
			try{
				const fs = await import('fs')
				if (fs.existsSync(c)) { bin = c; break }
			}catch(e){ /* ignore */ }
		}
		if (!bin) throw new Error('Could not locate vitest binary in installed package')

		const nodeArgs = [bin, ...vitestArgs]
		const child = spawn(process.execPath, nodeArgs, { stdio: 'inherit', env })
		child.on('close', (code) => process.exit(typeof code === 'number' ? code : 0))
		child.on('error', (err) => { console.error('Failed to run vitest binary:', err); process.exit(1) })
	}catch(err){
		console.error('Programmatic vitest runner error:', err && err.message ? err.message : err)
		process.exit(1)
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
;(async ()=>{
	await ensurePreload()
	await runProgrammatic()
})()