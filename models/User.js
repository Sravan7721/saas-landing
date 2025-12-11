const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  name: { type: String, default: '' },
  passwordHash: { type: String }, // optional if only collecting leads (or use password if full accounts)
  isVerified: { type: Boolean, default: false },
  verificationTokenHash: { type: String },
  verificationTokenExpires: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
