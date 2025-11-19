import { MongoClient } from 'mongodb';

const uri = process.env.MONGO_URI || process.env.MONGODB_URI;

if (!uri) {
  console.log('No MONGO_URI or MONGODB_URI provided; skipping Mongo connectivity check.');
  process.exit(0);
}

const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });

try {
  await client.connect();
  // ping the server to verify connectivity
  await client.db().admin().ping();
  console.log('Mongo connectivity check: SUCCESS');
  await client.close();
  process.exit(0);
} catch (err) {
  // Print concise error without revealing sensitive connection strings
  console.error('Mongo connectivity check: FAILURE');
  console.error(err.message);
  try { await client.close(); } catch (e) {}
  process.exit(2);
}
