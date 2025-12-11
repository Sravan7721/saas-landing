// server.js (verbose / debug-friendly)
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');

const app = express();

// --- Global error handlers so we can see crashes in console ---
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION — exiting\n', err && err.stack ? err.stack : err);
  process.exit(1);
});
process.on('unhandledRejection', (reason) => {
  console.error('UNHANDLED REJECTION — exiting\n', reason && reason.stack ? reason.stack : reason);
  process.exit(1);
});

// --- Basic middleware ---
app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

const limiter = rateLimit({ windowMs: 15*60*1000, max: 100 });
app.use('/api/', limiter);

// --- Static files ---
app.use(express.static(path.join(__dirname, 'public')));

// --- Verify required environment variables early (helpful) ---
const requiredEnv = ['MONGO_URI', 'APP_ORIGIN', 'FROM_EMAIL', 'SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS'];
const missing = requiredEnv.filter(k => !process.env[k]);
if (missing.length) {
  console.warn('WARNING: missing env vars:', missing.join(', '));
  // Not fatal by default, but log it so you can fix .env
}

// --- Routes require inside try to show errors if a file is missing ---
try {
  const authRoutes = require('./routes/auth'); // make sure file exists
  app.use('/api/auth', authRoutes);
} catch (err) {
  console.error('Error requiring routes/auth — does the file exist and export a router?');
  console.error(err && err.stack ? err.stack : err);
  // continue so you can still inspect other errors
}

// simple thank-you route
app.get('/thank-you', (req, res) => {
  const verified = req.query.verified === '1';
  const email = req.query.email || '';
  res.send(`
    <html><head><meta charset="utf-8"/><title>Thank you</title></head>
    <body style="font-family:Arial,Helvetica,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh">
      <div style="max-width:600px;text-align:center">
        <h1>${verified ? 'Email verified ✅' : 'Thanks!'}</h1>
        <p>${verified ? `Your email ${email} is now verified.` : 'We sent you an email.'}</p>
        <a href="/">Return to home</a>
      </div>
    </body></html>
  `);
});

app.get('/health', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3000;

// --- Connect to Mongo with verbose error logging ---
if (!process.env.MONGO_URI) {
  console.warn('No MONGO_URI defined — skipping Mongo connect for now.');
  startServer();
} else {
  console.log('Connecting to MongoDB...');
  mongoose.connect(process.env.MONGO_URI, { dbName: 'saas' })
    .then(() => {
      console.log('Connected to MongoDB');
      startServer();
    })
    .catch(err => {
      console.error('MongoDB connection failed — full error:');
      console.error(err && err.stack ? err.stack : err);
      // exit with non-zero so nodemon shows "app crashed"
      process.exit(1);
    });
}

function startServer(){
  app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
    // Try to require email util (it may verify transporter) but catch errors
    try {
      const { transporter } = require('./utils/email'); // optional: exporter must expose transporter
      if (transporter && transporter.verify) {
        transporter.verify().then(()=> console.log('SMTP ready')).catch(e => {
          console.warn('SMTP verify failed — check SMTP env values. Error:', e && e.message ? e.message : e);
        });
      }
    } catch (err) {
      console.warn('Could not verify SMTP transporter (utils/email missing or error).', err && err.message ? err.message : err);
    }
  });
}
