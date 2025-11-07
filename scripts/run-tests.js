#!/usr/bin/env node
// Cross-platform test runner: sets NODE_OPTIONS preload and runs Vitest with provided args
import { spawn } from 'child_process'
import path from 'path'

// Simple wrapper: ensure our preload is included in NODE_OPTIONS and spawn the vitest CLI.
const projectRoot = process.cwd()
const preloadPath = path.resolve(projectRoot, 'src', 'test-preload.js')

const env = { ...process.env }
const existing = env.NODE_OPTIONS ? env.NODE_OPTIONS + ' ' : ''
env.NODE_OPTIONS = `${existing}-r ${preloadPath}`

// Build vitest args: forward any args given to this script, default to run all tests
const argv = process.argv.slice(2)
const vitestArgs = argv.length ? argv : ['run']

// Prefer running the local vitest CLI via node to avoid relying on global npx. This works
// cross-platform by invoking the local vitest JS entry with the current node executable.
// Use npx via a shell so environments without a local bin layout still work reliably.
const cmdStr = `npx vitest ${vitestArgs.map(a => JSON.stringify(a)).join(' ')}`
const child = spawn(cmdStr, { stdio: 'inherit', env, shell: true })

child.on('close', (code) => {
	process.exit(typeof code === 'number' ? code : 0)
})
child.on('error', (err) => {
	console.error('Failed to spawn vitest:', err)
	process.exit(1)
})