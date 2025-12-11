// test-mongo-verbose.js
require('dotenv').config();
const mongoose = require('mongoose');

const uri = process.env.MONGO_URI;
console.log('Using URI (redacted):', uri ? uri.replace(/:(.*)@/,'/:<REDACTED>@') : 'NO_URI');

async function tryConnect(opts, label) {
  console.log('--- Trying:', label, 'opts=', opts);
  try {
    await mongoose.connect(uri, opts);
    console.log('CONNECTED with', label);
    await mongoose.disconnect();
  } catch (err) {
    console.error('FAILED', label);
    console.error(err && err.stack ? err.stack : err);
  }
}

(async () => {
  // 1) default options
  await tryConnect({ dbName: 'saas', serverSelectionTimeoutMS: 10000 }, 'default');

  // 2) force IPv4 (family:4)
  await tryConnect({ dbName: 'saas', family: 4, serverSelectionTimeoutMS: 10000 }, 'ipv4');

  // 3) tls insecure (dev only) — DO NOT use in production
  await tryConnect({ dbName: 'saas', tls: true, tlsInsecure: true, serverSelectionTimeoutMS: 10000 }, 'tlsInsecure');

  process.exit(0);
})();
