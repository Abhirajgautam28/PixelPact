#!/usr/bin/env node
/*
 Lightweight CI audit script that inspects recent invite documents in MongoDB.
 Usage: `node scripts/ci-invite-audit.js` (reads MONGO_URI or MONGODB_URI from env)
 Prints a JSON array of invite docs created in the last N minutes (default 10).
 This script is defensive and will exit with code 0 even when Mongo is unavailable.
*/
import mongoose from 'mongoose'

async function main(){
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI
  const lookbackMinutes = parseInt(process.env.CI_INVITE_AUDIT_MINUTES || '10', 10)
  const since = new Date(Date.now() - (lookbackMinutes * 60 * 1000))
  if (!uri){
    console.log('NO_MONGO_URI')
    process.exit(0)
  }
  try{
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 })
    const db = mongoose.connection.db
    const collNames = await db.listCollections().toArray()
    const hasInvites = collNames.some(c=>c.name === 'invites' || c.name === 'invite')
    if (!hasInvites){
      console.log('NO_INVITES_COLLECTION')
      await mongoose.disconnect()
      process.exit(0)
    }
    const invites = await db.collection('invites').find({ createdAt: { $gte: since } }).project({ _id:0 }).toArray()
    console.log(JSON.stringify({ found: invites.length, since: since.toISOString(), invites }, null, 2))
    await mongoose.disconnect()
    process.exit(0)
  }catch(err){
    console.error('MONGO_AUDIT_ERROR', err && err.message)
    try{ await mongoose.disconnect() }catch(e){}
    process.exit(0)
  }
}

main()
