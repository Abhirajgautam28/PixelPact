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
  const uri = process.env.MONGO_URI
  if (!uri) return
  await mongoose.connect(uri)
  const userSchema = new mongoose.Schema({ email: { type: String, unique: true }, password: String, name: String })
  const roomSchema = new mongoose.Schema({ id: { type: String, unique: true }, participants: [String], createdAt: { type: Date, default: Date.now } })
  UserModel = mongoose.models.User || mongoose.model('User', userSchema)
  RoomModel = mongoose.models.Room || mongoose.model('Room', roomSchema)
}

initDb().catch(err => console.warn('DB init failed (continuing with in-memory):', err.message))

// in-memory fallback
const USERS = new Map()
const ROOMS = new Map()

function makeRoomId(){ return `room-${Math.random().toString(36).slice(2,9)}` }

// helper to set httpOnly auth cookie
function setAuthCookie(res, token){
  const secure = process.env.NODE_ENV === 'production'
  res.cookie('token', token, { httpOnly: true, secure, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 })
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
      // set httpOnly cookie
      setAuthCookie(res, token)
      const roomId = makeRoomId()
      await RoomModel.create({ id: roomId, participants: [email] })
      return res.json({ roomId })
    } else {
      if (USERS.has(email)) return res.status(409).json({ message: 'exists' })
      USERS.set(email, { email, password: hashed, name })
      const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '7d' })
      setAuthCookie(res, token)
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
      const room = await RoomModel.findOne() // naive
      return res.json({ roomId: room?.id || null })
    } else {
      const u = USERS.get(email)
      if (!u) return res.status(401).json({ message: 'invalid' })
      const ok = await bcrypt.compare(password, u.password)
      if (!ok) return res.status(401).json({ message: 'invalid' })
      const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '7d' })
      setAuthCookie(res, token)
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
app.post('/api/rooms/:id/invite', (req, res)=>{
  const { id } = req.params
  const invite = jwt.sign({ room: id }, JWT_SECRET, { expiresIn: '7d' })
  res.json({ invite, url: `${req.protocol}://${req.get('host')}/board/${id}?invite=${invite}` })
})

// socket.io handling
io.on('connection', (socket) => {
  console.log('socket connected', socket.id)
  socket.on('join', (roomId) => {
    socket.join(roomId)
    socket.to(roomId).emit('peer-joined', { id: socket.id })
  })
  socket.on('draw', (data) => {
    const { room } = data
    if (room) socket.to(room).emit('draw', data)
    else socket.broadcast.emit('draw', data)
  })
  socket.on('disconnect', ()=> console.log('socket disconnected', socket.id))
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
