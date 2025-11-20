const uri = process.env.MONGO_URI || process.env.MONGODB_URI;

if (!uri) {
  console.log('No MONGO_URI or MONGODB_URI provided; skipping Mongo connectivity check.');
  process.exit(0);
}

(async () => {
  let mongodb;
  try {
    mongodb = await import('mongodb');
  } catch (e) {
    console.warn('mongodb package not installed; skipping mongo connectivity check.');
    process.exit(0);
  }

  const { MongoClient } = mongodb;
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });

  try {
    await client.connect();
    // ping the server to verify connectivity
    await client.db().admin().ping();
    console.log('Mongo connectivity check: SUCCESS');
    await client.close();
    process.exit(0);
  } catch (err) {
    // Do not fail the CI job for optional connectivity issues; print helpful diagnostics
    console.warn('Mongo connectivity check: FAILURE (non-fatal)');
    if (err && err.message) console.warn(err.message);
    try { await client.close(); } catch (e) {}
    process.exit(0);
  }
})();
