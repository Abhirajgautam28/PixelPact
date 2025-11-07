#!/usr/bin/env node
// Cross-platform test runner: sets NODE_OPTIONS preload and runs Vitest with provided args
import { spawn } from 'child_process'
import path from 'path'

const projectRoot = process.cwd()
const preloadPath = path.resolve(projectRoot, 'src', 'test-preload.js')

const env = { ...process.env }
// Ensure NODE_OPTIONS preserves existing flags but includes our preload
const existing = env.NODE_OPTIONS ? env.NODE_OPTIONS + ' ' : ''
env.NODE_OPTIONS = `${existing}-r ${preloadPath}`

const args = ['vitest', 'src/__tests__', '--run']

// Fallback: run vitest via a shell command to ensure the local binary is resolved by npm/npx on all platforms.
// We call a single command string to avoid the spawn(shell:true,args) deprecation warning.
const cmd = `npx ${args.join(' ')}`
const child = spawn(cmd, { stdio: 'inherit', shell: true, env })

child.on('exit', code => process.exit(code))
child.on('error', err => { console.error('Failed to run tests:', err); process.exit(1) })