#!/usr/bin/env node
// Generate an admin JWT for local development.
// Usage:
//  node scripts/generate-admin-token.js
//  node scripts/generate-admin-token.js --secret mysecret --expires 7d

import jwt from 'jsonwebtoken'

const argv = process.argv.slice(2)
const opts = {}
for (let i = 0; i < argv.length; i++) {
  const a = argv[i]
  if (a === '--secret' && argv[i+1]) { opts.secret = argv[++i]; continue }
  if (a === '--expires' && argv[i+1]) { opts.expires = argv[++i]; continue }
  if (a === '--help' || a === '-h') { opts.help = true }
}

if (opts.help) {
  console.log('Usage: generate-admin-token.js [--secret <secret>] [--expires <expires>]')
  process.exit(0)
}

const secret = opts.secret || process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET || 'dev-jwt-secret'
const expiresIn = opts.expires || '7d'

const token = jwt.sign({ role: 'admin' }, secret, { expiresIn })
console.log(token)
