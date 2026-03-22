// models/OTPStore.js — Temporary OTP storage for email verification
const mongoose = require('mongoose');

const otpStoreSchema = new mongoose.Schema({
  email:         { type: String, required: true, unique: true, lowercase: true, trim: true },
  otp:           { type: String, required: true },
  name:          { type: String, required: true },
  password_hash: { type: String, required: true },
  expiresAt:     { type: Date, required: true },
});

// MongoDB TTL index — auto-deletes documents after expiresAt
otpStoreSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('OTPStore', otpStoreSchema);
