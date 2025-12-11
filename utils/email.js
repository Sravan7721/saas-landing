// utils/email.js (excerpt / safe link builder)
const nodemailer = require('nodemailer');

const PORT = process.env.PORT || 3000;
const DEFAULT_BASE = `http://localhost:${PORT}`;
const BASE_URL = (process.env.BASE_URL || DEFAULT_BASE).replace(/\/$/, '');

// createTransporter() and other functions as before...
// Example of sending a verification email:
async function sendVerificationEmail(to, token) {
  const verificationLink = `${BASE_URL}/verify?token=${encodeURIComponent(token)}`;
  const html = `<p>Please verify your email by clicking <a href="${verificationLink}">here</a></p>`;

  const transporter = createTransporter(); // your existing createTransporter()
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'no-reply@yourdomain.com',
      to,
      subject: 'Verify your email',
      html
    });
    return true;
  } catch (err) {
    console.error('sendVerificationEmail error:', err.message);
    return false;
  }
}
