// models/PasswordResetStore.js — Temporary OTP storage for password reset
const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  email:     { type: String, required: true, unique: true, lowercase: true, trim: true },
  otp:       { type: String, required: true },
  expiresAt: { type: Date,   required: true },
});

// Auto-delete after expiresAt
schema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('PasswordResetStore', schema);
