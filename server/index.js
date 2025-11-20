import './tracing.js'
import express from 'express'
import http from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import jwt from 'jsonwebtoken'
import bodyParser from 'body-parser'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'

dotenv.config()

const app = express()
const server = http.createServer(app)
const io = new Server(server, { cors: { origin: '*' }, path: '/socket' })

const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173'
app.use(cors({ origin: FRONTEND_ORIGIN, credentials: true }))
app.use(bodyParser.json())

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'

// Mongoose models (if MONGO_URI provided)
let UserModel = null
let RoomModel = null

async function initDb(){
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI
  if (!uri) return
  await mongoose.connect(uri)
  const userSchema = new mongoose.Schema({ email: { type: String, unique: true }, password: String, name: String })
  const roomSchema = new mongoose.Schema({ id: { type: String, unique: true }, participants: [String], createdAt: { type: Date, default: Date.now } })
  const inviteSchema = new mongoose.Schema({ token: { type: String, unique: true }, room: String, owner: String, used: { type: Boolean, default: false }, expiresAt: Date, createdAt: { type: Date, default: Date.now } })
  UserModel = mongoose.models.User || mongoose.model('User', userSchema)
  RoomModel = mongoose.models.Room || mongoose.model('Room', roomSchema)
  // InviteModel persists single-use invites so they survive restarts
  mongoose.models.Invite || mongoose.model('Invite', inviteSchema)
}

initDb().catch(err => console.warn('DB init failed (continuing with in-memory):', err.message))

// in-memory fallback
const USERS = new Map()
const ROOMS = new Map()
// in-memory invite tokens (single-use tokens stored here).
// Format: INVITES.set(token, { room, owner, used: false, expiresAt: timestamp })
const INVITES = new Map()
// cache of invites created in this process to reduce DB/memory races.
// Entries are short-lived and pruned periodically. Structure: CREATED_INVITES.set(token, { room, owner, used: false, expiresAt, createdAt })
const CREATED_INVITES = new Map()
// short-lived map of recently consumed tokens so immediate replays return 410 (gone)
const USED_INVITES = new Map()
// in-memory presence: roomId -> Set(socketId)
const PRESENCE = new Map()

function makeRoomId(){ return `room-${Math.random().toString(36).slice(2,9)}` }

// helper to set httpOnly auth cookie
function setAuthCookie(res, token){
  const secure = process.env.NODE_ENV === 'production'
  res.cookie('token', token, { httpOnly: true, secure, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 })
}

function setCsrfCookie(res){
  // generate a random CSRF token and set as non-HttpOnly cookie so client JS can read
  const csrf = crypto.randomBytes(24).toString('hex')
  const secure = process.env.NODE_ENV === 'production'
  res.cookie('csrf-token', csrf, { httpOnly: false, secure, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 })
  return csrf
}

// helper to extract token from header or cookie
function extractToken(req){
  const authHeader = (req.headers && (req.headers.authorization || req.headers.Authorization)) || ''
  const m = authHeader.match(/^Bearer\s+(.+)$/i)
  if (m) return m[1]
  // check custom header 'token'
  if (req.headers && req.headers.token) return req.headers.token
  // parse cookie header if present
  const cookie = req.headers && req.headers.cookie
  if (cookie){
    const match = cookie.match(/(?:^|; )token=([^;]+)/)
    if (match) return decodeURIComponent(match[1])
  }
  return null
}

// CSRF protection middleware: double-submit cookie
function csrfCheck(req, res, next){
  // only enforce on state-changing methods
  if (!['POST','PUT','DELETE','PATCH'].includes(req.method)) return next()
    // Skip CSRF for auth endpoints (they set the token), admin endpoints, or when an Authorization/token header is present
    // Tests and API clients may use Authorization or token headers (legacy admin flow) which shouldn't be blocked by double-submit CSRF
    if (
      req.path.startsWith('/api/auth') ||
      req.path.startsWith('/api/auth/oauth') ||
      req.path.startsWith('/api/admin') ||
      req.headers.authorization ||
      req.headers['token']
    ) return next()
  // read cookie and header
  const cookie = req.headers && req.headers.cookie
  // If there's no session cookie (token=...), then this is an unauthenticated API call
  // and should be allowed through so downstream auth middleware can return 401.
  if (!cookie || !cookie.includes('token=')) return next()
  let cookieVal = null
  if (cookie){
    const m = cookie.match(/(?:^|; )csrf-token=([^;]+)/)
    if (m) cookieVal = decodeURIComponent(m[1])
  }
  const headerVal = req.headers['x-csrf-token'] || req.headers['x-xsrf-token'] || null
  if (!cookieVal || !headerVal || cookieVal !== headerVal){
    return res.status(403).json({ message: 'csrf_mismatch' })
  }
  return next()
}

app.use(csrfCheck)

// lightweight health endpoint used by tests to wait for server readiness
app.get('/api/_health', (req, res) => {
  return res.json({ ok: true, time: Date.now() })
})

// Register
app.post('/api/auth/register', async (req, res) => {
  const { email, password, name } = req.body
  if (!email || !password) return res.status(400).json({ message: 'missing' })
  try{
    const hashed = await bcrypt.hash(password, 10)
    if (UserModel){
      const existing = await UserModel.findOne({ email })
      if (existing) return res.status(409).json({ message: 'exists' })
      const u = await UserModel.create({ email, password: hashed, name })
  const token = jwt.sign({ id: u._id, email }, JWT_SECRET, { expiresIn: '7d' })
  // set httpOnly cookie and csrf cookie
  setAuthCookie(res, token)
  setCsrfCookie(res)
      const roomId = makeRoomId()
      await RoomModel.create({ id: roomId, participants: [email] })
      return res.json({ roomId })
    } else {
      if (USERS.has(email)) return res.status(409).json({ message: 'exists' })
      USERS.set(email, { email, password: hashed, name })
  const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '7d' })
  setAuthCookie(res, token)
  setCsrfCookie(res)
      const roomId = makeRoomId()
      ROOMS.set(roomId, { id: roomId, participants: [email] })
      return res.json({ roomId })
    }
  }catch(err){
    console.error(err)
    return res.status(500).json({ message: 'error' })
  }
})

// Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body
  try{
    if (UserModel){
      const u = await UserModel.findOne({ email })
      if (!u) return res.status(401).json({ message: 'invalid' })
      const ok = await bcrypt.compare(password, u.password)
      if (!ok) return res.status(401).json({ message: 'invalid' })
  const token = jwt.sign({ id: u._id, email }, JWT_SECRET, { expiresIn: '7d' })
  setAuthCookie(res, token)
  setCsrfCookie(res)
      const room = await RoomModel.findOne() // naive
      return res.json({ roomId: room?.id || null })
    } else {
      const u = USERS.get(email)
      if (!u) return res.status(401).json({ message: 'invalid' })
      const ok = await bcrypt.compare(password, u.password)
      if (!ok) return res.status(401).json({ message: 'invalid' })
  const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '7d' })
  setAuthCookie(res, token)
  setCsrfCookie(res)
      const roomId = Array.from(ROOMS.keys())[0] || null
      return res.json({ roomId })
    }
  }catch(err){
    console.error(err)
    return res.status(500).json({ message: 'error' })
  }
})

// Create a room endpoint
app.post('/api/rooms', async (req, res) => {
  // extract token from cookie/header if present
  const token = extractToken(req)
  // in production verify token; here we accept and create
  const roomId = makeRoomId()
  try{
    const template = req.body && req.body.template ? req.body.template : null
    if (RoomModel) {
      await RoomModel.create({ id: roomId, participants: [], template })
    } else {
      ROOMS.set(roomId, { id: roomId, participants: [], template })
    }
    res.json({ roomId })
  }catch(err){ console.error(err); res.status(500).json({ message: 'error' }) }
})

// Read room metadata
app.get('/api/rooms/:id', async (req, res) => {
  const { id } = req.params
  try{
    if (RoomModel) {
      const r = await RoomModel.findOne({ id })
      if (!r) return res.status(404).json({ message: 'not found' })
      return res.json({ id: r.id, participants: r.participants || [], template: r.template || null })
    } else {
      const r = ROOMS.get(id)
      if (!r) return res.status(404).json({ message: 'not found' })
      return res.json(r)
    }
  }catch(err){ console.error(err); res.status(500).json({ message: 'error' }) }
})

// Serve testimonials from a simple JSON file if present. Keep empty array as default.
app.get('/api/testimonials', (req, res) => {
  try{
    const p = path.resolve(process.cwd(), 'server', 'testimonials.json')
    if (fs.existsSync(p)){
      const raw = fs.readFileSync(p, 'utf8')
      const data = JSON.parse(raw || '[]')
      return res.json(Array.isArray(data) ? data : [])
    }
    return res.json([])
  }catch(err){
    console.warn('Failed to read testimonials:', err && err.message)
    return res.json([])
  }
})

// Machine-readable policy metadata for automated ingestion
app.get('/policy.json', (req, res) => {
  try{
    const p = path.resolve(process.cwd(), 'server', 'policy.json')
    if (fs.existsSync(p)){
      const raw = fs.readFileSync(p, 'utf8')
      const obj = JSON.parse(raw || '{}')
      res.setHeader('Content-Type', 'application/json')
      return res.json(obj)
    }
    // fallback default
    const meta = {
      updatedAt: '2025-11-10',
      privacy: { effective: '2025-11-10', path: '/privacy' },
      terms: { effective: '2025-11-10', path: '/terms' },
      changelog: [
        { date: '2025-11-10', title: 'Initial policy release', details: 'Privacy and Terms pages updated and exposed as machine-readable policy.json.' }
      ],
      source: '/privacy'
    }
    res.setHeader('Content-Type', 'application/json')
    return res.json(meta)
  }catch(err){ console.error('policy.json error', err); return res.status(500).json({}) }
})

// Admin status endpoint
app.get('/api/admin/me', (req, res) => {
  try{
    if (checkAdmin(req)) return res.json({ admin: true })
    return res.status(401).json({ admin: false })
  }catch(err){ return res.status(500).json({ admin: false }) }
})

// Replace policy file (admin-only)
app.post('/api/admin/policy', (req, res) => {
  if (!checkAdmin(req)) return res.status(401).json({ message: 'unauthorized' })
  try{
    const body = req.body || {}
    // basic validation: must be an object with privacy and terms keys
    if (typeof body !== 'object' || Array.isArray(body)) return res.status(400).json({ message: 'invalid' })
    const p = path.resolve(process.cwd(), 'server', 'policy.json')
    // write atomically
    const tmp = p + '.tmp'
    fs.writeFileSync(tmp, JSON.stringify(body, null, 2), 'utf8')
    fs.renameSync(tmp, p)
    return res.json({ ok: true })
  }catch(err){ console.error('write policy failed', err); return res.status(500).json({ message: 'error' }) }
})

// Return current authenticated user (if any)
app.get('/api/auth/me', (req, res) => {
  try{
    const token = extractToken(req)
    if (!token) return res.json({ user: null })
    try{
      const payload = jwt.verify(token, JWT_SECRET)
      // minimal user info
      return res.json({ user: { id: payload.id || null, email: payload.email || null } })
    }catch(e){ return res.json({ user: null }) }
  }catch(err){ return res.status(500).json({ user: null }) }
})

// Logout: clear auth + csrf cookies
app.post('/api/auth/logout', (req, res) => {
  const secure = process.env.NODE_ENV === 'production'
  res.clearCookie('token', { httpOnly: true, secure, sameSite: 'lax' })
  res.clearCookie('csrf-token', { secure, sameSite: 'lax' })
  return res.json({ ok: true })
})

// Admin-protected endpoints to modify testimonials.
// Admin authentication: supports legacy shared token or JWT issued via /api/admin/login
function checkAdmin(req){
  const authHeader = (req.headers && (req.headers.authorization || req.headers.Authorization)) || ''
  const expectedToken = process.env.ADMIN_TOKEN || 'dev-admin-token'
  const jwtSecret = process.env.ADMIN_JWT_SECRET || 'dev-jwt-secret'
  // Legacy direct token match (kept for backward compatibility)
  if (authHeader === expectedToken || authHeader === `Bearer ${expectedToken}`) return true

  // Try to extract token from header or cookie
  const token = extractToken(req)
  if (!token) return false
  try{
    const payload = jwt.verify(token, jwtSecret)
    if (payload && payload.role === 'admin') return true
  }catch(e){ /* invalid token */ }
  return false
}

// Admin login to exchange a server-side ADMIN_PASSWORD for a short-lived JWT
app.post('/api/admin/login', (req, res) => {
  const password = (req.body && req.body.password) || ''
  const adminPassword = process.env.ADMIN_PASSWORD || 'dev-password'
  const jwtSecret = process.env.ADMIN_JWT_SECRET || 'dev-jwt-secret'
  if (!password || password !== adminPassword) return res.status(401).json({ message: 'invalid' })
  const token = jwt.sign({ role: 'admin' }, jwtSecret, { expiresIn: '7d' })
  return res.json({ token })
})

// OAuth placeholder endpoint — redirect to provider if configured, otherwise 501
app.get('/api/auth/oauth/:provider', (req, res) => {
  const { provider } = req.params
  // Example: support 'google' when env vars are present (very minimal flow)
  if (provider === 'google'){
    const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID
    const redirectUri = process.env.GOOGLE_OAUTH_REDIRECT || `${req.protocol}://${req.get('host')}/api/auth/oauth/google/callback`
    if (!clientId) return res.status(501).json({ message: 'not_configured' })
    const scope = encodeURIComponent('profile email')
    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&response_type=code&scope=${scope}&redirect_uri=${encodeURIComponent(redirectUri)}`
    return res.redirect(url)
  }
  return res.status(501).json({ message: 'provider_not_supported' })
})

// OAuth callback for Google
app.get('/api/auth/oauth/google/callback', async (req, res) => {
  const code = req.query.code
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET
  const redirectUri = process.env.GOOGLE_OAUTH_REDIRECT || `${req.protocol}://${req.get('host')}/api/auth/oauth/google/callback`
  if (!clientId || !clientSecret) return res.status(501).send('Google OAuth not configured')
  if (!code) return res.status(400).send('Missing code')
  try{
    // exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type':'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ code, client_id: clientId, client_secret: clientSecret, redirect_uri: redirectUri, grant_type: 'authorization_code' })
    })
    const tokenJson = await tokenRes.json()
    if (!tokenJson.access_token) return res.status(400).send('Token exchange failed')
    // fetch profile
    const profileRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', { headers: { Authorization: `Bearer ${tokenJson.access_token}` } })
    const profile = await profileRes.json()
    const email = profile && profile.email
    if (!email) return res.status(400).send('No email in profile')
    // create or find user
    if (UserModel){
      let u = await UserModel.findOne({ email })
      if (!u) u = await UserModel.create({ email, name: profile.name || '' })
      const token = jwt.sign({ id: u._id, email }, JWT_SECRET, { expiresIn: '7d' })
      setAuthCookie(res, token)
      setCsrfCookie(res)
    } else {
      if (!USERS.has(email)) USERS.set(email, { email, name: profile.name || '' })
      const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '7d' })
      setAuthCookie(res, token)
      setCsrfCookie(res)
    }
    // redirect back to frontend
    const redirectTo = process.env.OAUTH_SUCCESS_REDIRECT || FRONTEND_ORIGIN
    return res.redirect(redirectTo)
  }catch(err){
    console.error('OAuth callback error', err)
    return res.status(500).send('OAuth error')
  }
})

// basic sanitizer + validator
function sanitizeString(s, maxLen = 1000){
  if (typeof s !== 'string') return ''
  // strip tags and control chars
  let out = s.replace(/<[^>]*>/g, '')
  out = out.replace(/[\x00-\x1F\x7F]/g, '')
  out = out.trim()
  if (out.length > maxLen) out = out.slice(0, maxLen)
  return out
}

app.post('/api/testimonials', (req, res) => {
  if (!checkAdmin(req)) return res.status(401).json({ message: 'unauthorized' })
  try{
    const p = path.resolve(process.cwd(), 'server', 'testimonials.json')
    const raw = fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : '[]'
    const arr = JSON.parse(raw || '[]')
    const t = req.body || {}
    const name = sanitizeString(t.name || '', 100)
    const role = sanitizeString(t.role || '', 100)
    const text = sanitizeString(t.text || '', 1000)
    if (!name || !text) return res.status(400).json({ message: 'invalid' })
    arr.push({ name, role, text })
    fs.writeFileSync(p, JSON.stringify(arr, null, 2), 'utf8')
    return res.json(arr)
  }catch(err){ console.error(err); return res.status(500).json({ message: 'error' }) }
})

app.put('/api/testimonials/:idx', (req, res) => {
  if (!checkAdmin(req)) return res.status(401).json({ message: 'unauthorized' })
  try{
    const idx = parseInt(req.params.idx,10)
    const p = path.resolve(process.cwd(), 'server', 'testimonials.json')
    const raw = fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : '[]'
    const arr = JSON.parse(raw || '[]')
    if (isNaN(idx) || idx < 0 || idx >= arr.length) return res.status(400).json({ message: 'invalid index' })
    const t = req.body || {}
    const name = sanitizeString(t.name || arr[idx].name, 100)
    const role = sanitizeString(t.role || arr[idx].role, 100)
    const text = sanitizeString(t.text || arr[idx].text, 1000)
    if (!name || !text) return res.status(400).json({ message: 'invalid' })
    arr[idx] = { name, role, text }
    fs.writeFileSync(p, JSON.stringify(arr, null, 2), 'utf8')
    return res.json(arr)
  }catch(err){ console.error(err); return res.status(500).json({ message: 'error' }) }
})

app.delete('/api/testimonials/:idx', (req, res) => {
  if (!checkAdmin(req)) return res.status(401).json({ message: 'unauthorized' })
  try{
    const idx = parseInt(req.params.idx,10)
    const p = path.resolve(process.cwd(), 'server', 'testimonials.json')
    const raw = fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : '[]'
    const arr = JSON.parse(raw || '[]')
    if (isNaN(idx) || idx < 0 || idx >= arr.length) return res.status(400).json({ message: 'invalid index' })
    arr.splice(idx,1)
    fs.writeFileSync(p, JSON.stringify(arr, null, 2), 'utf8')
    return res.json(arr)
  }catch(err){ console.error(err); return res.status(500).json({ message: 'error' }) }
})

// Client-side log ingest (hardened)
// This endpoint accepts lightweight client-side logs but enforces rate limits,
// entry size caps, and a max number of stored entries to avoid unbounded
// growth. Writes are atomic to reduce corruption risk.
const LOG_MAX_ENTRIES = 1000
const LOG_MAX_ENTRY_CHARS = 2000
const LOG_RATE_LIMIT_WINDOW_MS = 60 * 1000 // 1 minute
const LOG_RATE_LIMIT_MAX = 10 // max entries per IP per window
const LOG_RATE_LIMIT_MAP = new Map()

function cleanupRateLimitMap(){
  const now = Date.now()
  for (const [ip, arr] of LOG_RATE_LIMIT_MAP.entries()){
    const recent = arr.filter(t => now - t < LOG_RATE_LIMIT_WINDOW_MS)
    if (recent.length === 0) LOG_RATE_LIMIT_MAP.delete(ip)
    else LOG_RATE_LIMIT_MAP.set(ip, recent)
  }
}

// Periodic cleanup to avoid memory leaks
setInterval(cleanupRateLimitMap, LOG_RATE_LIMIT_WINDOW_MS * 5)
// Periodic cleanup for invite caches to avoid memory growth
function cleanupInviteCaches(){
  const now = Date.now()
  // remove created invites older than 1 hour
  for (const [t, info] of CREATED_INVITES.entries()){
    if (info && info.createdAt && (now - info.createdAt) > (60 * 60 * 1000)) CREATED_INVITES.delete(t)
  }
  // remove expired invites from INVITES map
  for (const [t, info] of INVITES.entries()){
    if (info && info.expiresAt && now > info.expiresAt) INVITES.delete(t)
  }
  // cleanup used cache entries older than 10 minutes (safety)
  for (const [t, ts] of USED_INVITES.entries()){
    if (!ts || (now - ts) > (10 * 60 * 1000)) USED_INVITES.delete(t)
  }
}
setInterval(cleanupInviteCaches, 10 * 60 * 1000)

app.post('/api/logs', (req, res) => {
  try{
    // identify client IP conservatively
    const ip = (req.headers['x-forwarded-for'] || req.ip || req.connection?.remoteAddress || 'unknown').toString()
    const now = Date.now()
    const arr = LOG_RATE_LIMIT_MAP.get(ip) || []
    const recent = arr.filter(t => now - t < LOG_RATE_LIMIT_WINDOW_MS)
    if (recent.length >= LOG_RATE_LIMIT_MAX) return res.status(429).json({ ok: false, message: 'rate_limited' })
    recent.push(now)
    LOG_RATE_LIMIT_MAP.set(ip, recent)

    const body = req.body || {}
    const message = sanitizeString(body.message || '', LOG_MAX_ENTRY_CHARS)
    if (!message) return res.status(400).json({ ok: false, message: 'empty_message' })
    const entry = {
      time: new Date().toISOString(),
      level: body.level || 'info',
      message,
      extra: body.extra || null
    }

    const p = path.resolve(process.cwd(), 'server', 'logs.json')
    let stored = []
    if (fs.existsSync(p)){
      try{ stored = JSON.parse(fs.readFileSync(p, 'utf8') || '[]') }catch(e){ stored = [] }
    }
    stored.push(entry)
    // enforce cap
    if (stored.length > LOG_MAX_ENTRIES) stored = stored.slice(stored.length - LOG_MAX_ENTRIES)

    // atomic write: write to temp file then rename
    const tmp = p + '.tmp'
    fs.writeFileSync(tmp, JSON.stringify(stored, null, 2), 'utf8')
    fs.renameSync(tmp, p)

    // echo a short preview to console for operators
    console.log('[client-log]', entry.level, entry.message.substring(0, 120))
    return res.json({ ok: true })
  }catch(err){
    console.error('Failed to ingest client log', err)
    return res.status(500).json({ ok: false })
  }
})

// Invite: generate a simple share token (stateless JWT)
app.post('/api/rooms/:id/invite', async (req, res)=>{
  const { id } = req.params
  try{
    // determine requester identity (if any)
    let owner = null
    const token = extractToken(req)
    if (token){
      try{ const payload = jwt.verify(token, JWT_SECRET); owner = payload.email || payload.id || null }catch(e){}
    }
    // generate a secure random token and store it for single-use
    const tokenBytes = crypto.randomBytes(20).toString('hex')
    const ttl = (req.body && req.body.ttl) ? parseInt(req.body.ttl,10) : (60 * 60 * 1000) // default 1 hour in ms
    const expiresAt = Date.now() + (isNaN(ttl) ? 60 * 60 * 1000 : ttl)
    // record in-process so that brief DB/memory races still allow a consistent outcome
    CREATED_INVITES.set(tokenBytes, { room: id, owner, used: false, expiresAt, createdAt: Date.now() })
    // persist in MongoDB when available
    const InviteModel = mongoose.models.Invite
    if (InviteModel) {
      try{
        const doc = await InviteModel.create({ token: tokenBytes, room: id, owner, used: false, expiresAt: new Date(expiresAt) })
        // also mirror in-memory for fast access
        INVITES.set(tokenBytes, { room: id, owner, used: false, expiresAt })
        // keep created cache until consumed/cleanup
        const url = `${process.env.FRONTEND_ORIGIN || `${req.protocol}://${req.get('host')}`}/board/${id}?invite=${tokenBytes}`
        return res.json({ invite: tokenBytes, url, expiresAt })
      }catch(err){ console.warn('persist invite failed', err) }
    }
    INVITES.set(tokenBytes, { room: id, owner, used: false, expiresAt })
    const url = `${process.env.FRONTEND_ORIGIN || `${req.protocol}://${req.get('host')}`}/board/${id}?invite=${tokenBytes}`
    return res.json({ invite: tokenBytes, url, expiresAt })
  }catch(err){ console.error('invite create failed', err); return res.status(500).json({ message: 'error' }) }
})

// Revoke a previously created invite token (owner only)
app.post('/api/rooms/share/:token/revoke', (req, res) => {
  try{
    const token = req.params.token
    const info = INVITES.get(token)
    if (!info) return res.status(404).json({ message: 'not_found' })
    // verify requester is owner (if owner was recorded)
    const requesterToken = extractToken(req)
    let requester = null
    if (requesterToken){ try{ const p = jwt.verify(requesterToken, JWT_SECRET); requester = p.email || p.id || null }catch(e){} }
    if (info.owner && requester && info.owner !== requester) return res.status(401).json({ message: 'unauthorized' })
    // delete from DB if present
    const InviteModel = mongoose.models.Invite
    if (InviteModel){ try{ InviteModel.deleteOne({ token }).catch(()=>{}) }catch(e){} }
    INVITES.delete(token)
    CREATED_INVITES.delete(token)
    return res.json({ ok: true })
  }catch(err){ console.error('revoke invite failed', err); return res.status(500).json({ message: 'error' }) }
})

// Exchange a single-use invite token for a temporary session cookie and room join.
// The response sets an auth cookie so the client can immediately open the board and connect via socket.io.
app.post('/api/rooms/join-invite', async (req, res) => {
  try{
    const token = (req.body && req.body.invite) || req.query.invite
    if (!token) return res.status(400).json({ message: 'missing' })
    // If we recently consumed this token in this process, treat as used (410)
    if (USED_INVITES.has(token)) return res.status(410).json({ message: 'used' })
    // try DB first
    const InviteModel = mongoose.models.Invite
    if (InviteModel){
      let doc = await InviteModel.findOne({ token })
      // If DB is missing the document for any reason, try the in-memory fallback
      if (!doc) {
        const suffix = token && token.slice ? token.slice(-6) : '??????'
        // First try the faster in-memory map (if invite was mirrored there)
        const info = INVITES.get(token)
        if (info) {
          console.warn(`[invite] db-missing token-*${suffix} — falling back to memory (used=${!!info.used})`)
          if (info.used) {
            // mark in used cache for short period so subsequent rapid replays get 410
            USED_INVITES.set(token, Date.now())
            return res.status(410).json({ message: 'used' })
          }
          if (info.expiresAt && Date.now() > info.expiresAt) { INVITES.delete(token); return res.status(410).json({ message: 'expired' }) }
          // mark used in memory and schedule removal to enforce single-use while preserving 410 semantics
          info.used = true
          INVITES.set(token, info)
          // add to used-cache and schedule removal instead of immediate hard-delete
          USED_INVITES.set(token, Date.now())
          setTimeout(()=>{ INVITES.delete(token) }, 5 * 60 * 1000)
          CREATED_INVITES.delete(token)
          const tempJwt = jwt.sign({ room: info.room, role: 'guest' }, JWT_SECRET, { expiresIn: '1h' })
          setAuthCookie(res, tempJwt)
          setCsrfCookie(res)
          console.log(`[invite] token consumed from memory token-*${suffix}`)
          return res.json({ ok: true, roomId: info.room })
        }

        // If not in INVITES, check the local-created cache in case DB and INVITES raced.
        const created = CREATED_INVITES.get(token)
        if (created) {
          console.warn(`[invite] db-missing token-*${suffix} — falling back to created-cache (used=${!!created.used})`)
          if (created.used) {
            USED_INVITES.set(token, Date.now())
            return res.status(410).json({ message: 'used' })
          }
          if (created.expiresAt && Date.now() > created.expiresAt) { CREATED_INVITES.delete(token); return res.status(410).json({ message: 'expired' }) }
          // consume it and keep in used-cache briefly
          created.used = true
          CREATED_INVITES.set(token, created)
          USED_INVITES.set(token, Date.now())
          setTimeout(()=>{ CREATED_INVITES.delete(token) }, 5 * 60 * 1000)
          const tempJwt = jwt.sign({ room: created.room, role: 'guest' }, JWT_SECRET, { expiresIn: '1h' })
          setAuthCookie(res, tempJwt)
          setCsrfCookie(res)
          console.log(`[invite] token consumed from created-cache token-*${suffix}`)
          return res.json({ ok: true, roomId: created.room })
        }

        console.warn(`[invite] token not found in db or memory token-*${suffix}`)
        // If we earlier recorded this token as recently used, return 410
        if (USED_INVITES.has(token)) return res.status(410).json({ message: 'used' })
        return res.status(404).json({ message: 'invalid' })
      }
      // found in DB path
      const suffix = token && token.slice ? token.slice(-6) : '??????'
      if (doc.used) { console.warn(`[invite] db token-*${suffix} already used`); return res.status(410).json({ message: 'used' }) }
      if (doc.expiresAt && Date.now() > new Date(doc.expiresAt).getTime()){ await InviteModel.deleteOne({ token }).catch(()=>{}); console.warn(`[invite] db token-*${suffix} expired`); return res.status(410).json({ message: 'expired' }) }
      // mark used in DB
      try{ await InviteModel.updateOne({ token }, { $set: { used: true } }) }catch(e){ console.warn('[invite] failed to mark db token used', e && e.message) }
      // also remove from in-memory map if present and record used in short-lived cache
      USED_INVITES.set(token, Date.now())
      INVITES.delete(token)
      CREATED_INVITES.delete(token)
      // schedule cleanup of used cache after a short time
      setTimeout(()=>{ USED_INVITES.delete(token) }, 5 * 60 * 1000)
      const tempJwt = jwt.sign({ room: doc.room, role: 'guest' }, JWT_SECRET, { expiresIn: '1h' })
      setAuthCookie(res, tempJwt)
      setCsrfCookie(res)
      console.log(`[invite] db token-*${suffix} consumed`)
      return res.json({ ok: true, roomId: doc.room })
    }
    // fallback to in-memory (or recently created cache)
    const info = INVITES.get(token)
    if (!info){
      const created = CREATED_INVITES.get(token)
      if (!created) {
        // If we recorded this token recently as used, return 410
        if (USED_INVITES.has(token)) return res.status(410).json({ message: 'used' })
        return res.status(404).json({ message: 'invalid' })
      }
      if (created.used) {
        USED_INVITES.set(token, Date.now())
        return res.status(410).json({ message: 'used' })
      }
      if (created.expiresAt && Date.now() > created.expiresAt) { CREATED_INVITES.delete(token); return res.status(410).json({ message: 'expired' }) }
      // consume created-cache
      created.used = true
      CREATED_INVITES.set(token, created)
      USED_INVITES.set(token, Date.now())
      setTimeout(()=>{ CREATED_INVITES.delete(token) }, 5 * 60 * 1000)
      const tempJwt = jwt.sign({ room: created.room, role: 'guest' }, JWT_SECRET, { expiresIn: '1h' })
      setAuthCookie(res, tempJwt)
      setCsrfCookie(res)
      return res.json({ ok: true, roomId: created.room })
    }
    if (info.used) {
      USED_INVITES.set(token, Date.now())
      return res.status(410).json({ message: 'used' })
    }
    if (info.expiresAt && Date.now() > info.expiresAt) { INVITES.delete(token); return res.status(410).json({ message: 'expired' }) }
    // mark used and schedule removal to enforce single-use
    info.used = true
    INVITES.set(token, info)
    USED_INVITES.set(token, Date.now())
    setTimeout(()=>{ INVITES.delete(token) }, 5 * 60 * 1000)
    // create a short-lived session JWT for this guest so socket.io can accept it
    const tempJwt = jwt.sign({ room: info.room, role: 'guest' }, JWT_SECRET, { expiresIn: '1h' })
    // set auth cookie so browser clients will present it on socket handshake
    setAuthCookie(res, tempJwt)
    setCsrfCookie(res)
    return res.json({ ok: true, roomId: info.room })
  }catch(err){ console.error('join-invite failed', err); return res.status(500).json({ message: 'error' }) }
})

// socket.io handling
io.on('connection', (socket) => {
  console.log('socket connected', socket.id)
  // helper: add socket to presence set for a room and emit snapshot
  function addToPresence(roomId){
    try{
      if (!roomId) return
      const set = PRESENCE.get(roomId) || new Set()
      set.add(socket.id)
      PRESENCE.set(roomId, set)
      // emit full presence snapshot to room
      io.to(roomId).emit('presence', Array.from(set))
    }catch(e){ console.warn('addToPresence failed', e) }
  }
  // helper: remove socket from all room presence sets and emit updates
  function removeFromAllPresence(){
    try{
      for (const [roomId, set] of PRESENCE.entries()){
        if (set.has(socket.id)){
          set.delete(socket.id)
          if (set.size === 0) PRESENCE.delete(roomId)
          else PRESENCE.set(roomId, set)
          io.to(roomId).emit('presence', Array.from(set))
        }
      }
    }catch(e){ console.warn('removeFromAllPresence failed', e) }
  }
  socket.on('join', (roomId) => {
    // Verify token from handshake cookies (double as socket auth)
    try{
      // allow three authentication paths for joining sockets:
      // 1) existing auth cookie/token (normal flow)
      // 2) an invite token provided in handshake auth or query (single-use)
      // 3) an Authorization header or custom token header
      const cookie = socket.handshake.headers && socket.handshake.headers.cookie
      let token = null
      if (cookie){
        const m = cookie.match(/(?:^|; )token=([^;]+)/)
        if (m) token = decodeURIComponent(m[1])
      }

      // Check for invite token in socket handshake (client may set auth: { invite })
      const hs = socket.handshake || {}
      const inviteFromAuth = (hs.auth && hs.auth.invite) || (hs.query && hs.query.invite) || (hs.headers && hs.headers['x-invite-token'])
      if (!token && inviteFromAuth){
        const info = INVITES.get(inviteFromAuth)
        if (!info){ socket.emit('join-error', { message: 'invalid_invite' }); return }
        if (info.used){ socket.emit('join-error', { message: 'invite_used' }); return }
        if (info.expiresAt && Date.now() > info.expiresAt){ INVITES.delete(inviteFromAuth); socket.emit('join-error', { message: 'invite_expired' }); return }
        // mark used and allow join
        info.used = true
        INVITES.set(inviteFromAuth, info)
        INVITES.delete(inviteFromAuth)
        socket.join(roomId)
        socket.to(roomId).emit('peer-joined', { id: socket.id })
        return
      }

      // fallback to regular token-based auth
      if (!token){
        socket.emit('join-error', { message: 'unauthorized' })
        return
      }
      try{
        jwt.verify(token, JWT_SECRET)
      }catch(e){ socket.emit('join-error', { message: 'invalid_token' }); return }
      socket.join(roomId)
      // update presence map and emit snapshot
      addToPresence(roomId)
      socket.to(roomId).emit('peer-joined', { id: socket.id })
    }catch(err){
      console.warn('join verify failed', err)
      socket.emit('join-error', { message: 'error' })
    }
  })
  socket.on('draw', (data) => {
    const { room } = data
    if (room) socket.to(room).emit('draw', data)
    else socket.broadcast.emit('draw', data)
  })
  socket.on('clear', (data) => {
    const { room } = data || {}
    if (room) socket.to(room).emit('clear', { room })
    else socket.broadcast.emit('clear', {})
  })
  socket.on('disconnect', ()=>{ console.log('socket disconnected', socket.id); try{ removeFromAllPresence() }catch(e){} })
})

const PORT = process.env.PORT || 3001
if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, ()=> console.log('server listening on', PORT))
} else {
  // When running tests we don't auto-start the HTTP server; tests can import `app` and use supertest.
  console.log('test env detected: server not automatically started')
}

// Export the app and server for tests and programmatic use. Keep default export for backward compat.
export { app, server }
export default app
