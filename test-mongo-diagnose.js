// test-mongo-diagnose.js
const { MongoClient } = require('mongodb');

const uri = '<CONN>'; // e.g. mongodb+srv://user:ENCODED_PASS@cluster0.jgi1ntm.mongodb.net/?retryWrites=true&w=majority

async function run() {
  const client = new MongoClient(uri, {
    // keep defaults normally; add extras only for testing
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 20000,
    tls: true,
  });

  try {
    console.log('Connecting to:', uri.replace(/(:\/\/.*:).*@/, '$1***@'));
    await client.connect();
    const dbs = await client.db().admin().listDatabases();
    console.log('Connected — databases:', dbs.databases.map(d => d.name));
  } catch (err) {
    console.error('CONNECT ERROR:', err && err.message);
    console.error(err);
  } finally {
    await client.close().catch(()=>{});
  }
}
run();
