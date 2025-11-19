#!/usr/bin/env node
// ESM wrapper for compatibility: forward to the .cjs generator
import { spawnSync } from 'child_process'
import { fileURLToPath } from 'url'
import path from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const cjsPath = path.join(__dirname, 'generate-jwt-secret.cjs')
const args = process.argv.slice(2)

const res = spawnSync(process.execPath, [cjsPath, ...args], { stdio: 'inherit' })
process.exit(res.status === null ? 1 : res.status)
