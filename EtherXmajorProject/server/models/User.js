const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name:          { type: String, required: true, trim: true },
  email:         { type: String, required: true, unique: true, lowercase: true, trim: true },
  password_hash: { type: String, required: true },
}, { timestamps: { createdAt: 'created_at', updatedAt: false } });

module.exports = mongoose.model('User', userSchema);
