#!/usr/bin/env node
// Generate a cryptographically secure JWT secret and optionally append to .env
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

function generateSecret(bytes = 32) {
  return crypto.randomBytes(bytes).toString('hex')
}

const secret = generateSecret(48)
console.log('\nGenerated JWT secret (keep this safe):')
console.log(secret)

const envPath = path.resolve(process.cwd(), '.env')
const args = process.argv.slice(2)
if (args.includes('--append') || args.includes('-a')) {
  const line = `JWT_SECRET=${secret}\n`
  try {
    fs.appendFileSync(envPath, line, { flag: 'a' })
    console.log(`\nAppended JWT_SECRET to ${envPath}`)
  } catch (err) {
    console.error(`\nFailed to append to ${envPath}: ${err.message}`)
  }
} else {
  console.log('\nTo save it to your local .env file, re-run with --append or -a')
  console.log('Example: node scripts/generate-jwt-secret.js --append')
}

// exit
process.exit(0)
