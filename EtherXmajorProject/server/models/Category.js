const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name:        { type: String, required: true },
  slug:        { type: String, required: true, unique: true },
  description: { type: String },
  item_count:  { type: Number, default: 0 },
});

module.exports = mongoose.model('Category', categorySchema);
