const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  brand:          { type: String, required: true },
  name:           { type: String, required: true },
  description:    { type: String },
  price:          { type: Number, required: true },
  old_price:      { type: Number, default: null },
  rating:         { type: Number, default: 5 },
  review_count:   { type: Number, default: 0 },
  tag:            { type: String, default: null },
  category_slug:  { type: String },
  stock:          { type: Number, default: 100 },
  image_url:      { type: String },
  is_featured:    { type: Boolean, default: false },
  is_new_arrival: { type: Boolean, default: false },
}, { timestamps: { createdAt: 'created_at', updatedAt: false } });

productSchema.index({ category_slug: 1 });
productSchema.index({ is_featured: 1 });
productSchema.index({ is_new_arrival: 1 });

module.exports = mongoose.model('Product', productSchema);
