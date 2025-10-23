import express from 'express'
import http from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import jwt from 'jsonwebtoken'
import bodyParser from 'body-parser'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const server = http.createServer(app)
const io = new Server(server, { cors: { origin: '*' }, path: '/socket' })

app.use(cors())
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
      const roomId = makeRoomId()
      await RoomModel.create({ id: roomId, participants: [email] })
      return res.json({ token, roomId })
    } else {
      if (USERS.has(email)) return res.status(409).json({ message: 'exists' })
      USERS.set(email, { email, password: hashed, name })
      const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '7d' })
      const roomId = makeRoomId()
      ROOMS.set(roomId, { id: roomId, participants: [email] })
      return res.json({ token, roomId })
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
      const room = await RoomModel.findOne() // naive
      return res.json({ token, roomId: room?.id || null })
    } else {
      const u = USERS.get(email)
      if (!u) return res.status(401).json({ message: 'invalid' })
      const ok = await bcrypt.compare(password, u.password)
      if (!ok) return res.status(401).json({ message: 'invalid' })
      const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '7d' })
      const roomId = Array.from(ROOMS.keys())[0] || null
      return res.json({ token, roomId })
    }
  }catch(err){
    console.error(err)
    return res.status(500).json({ message: 'error' })
  }
})

// Create a room endpoint
app.post('/api/rooms', async (req, res) => {
  const { token } = req.headers
  // in production verify token; here we accept and create
  const roomId = makeRoomId()
  try{
    if (RoomModel) {
      await RoomModel.create({ id: roomId, participants: [] })
    } else {
      ROOMS.set(roomId, { id: roomId, participants: [] })
    }
    res.json({ roomId })
  }catch(err){ console.error(err); res.status(500).json({ message: 'error' }) }
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
server.listen(PORT, ()=> console.log('server listening on', PORT))

export default app
