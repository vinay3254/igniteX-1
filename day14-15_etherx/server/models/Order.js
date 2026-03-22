const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product_id:    { type: mongoose.Schema.Types.ObjectId, ref: 'Product', default: null },
  product_name:  { type: String, required: true },
  product_brand: { type: String },
  product_price: { type: Number, required: true },
  quantity:      { type: Number, required: true, default: 1 },
}, { _id: false });

const orderSchema = new mongoose.Schema({
  user_id:          { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  total_amount:     { type: Number, required: true },
  status:           { type: String, default: 'pending', enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'] },
  shipping_name:    { type: String },
  shipping_address: { type: String },
  shipping_city:    { type: String },
  shipping_zip:     { type: String },
  payment_method:   { type: String, default: 'card' },
  notes:            { type: String, default: null },
  items:            [orderItemSchema],
}, { timestamps: { createdAt: 'created_at', updatedAt: false } });

orderSchema.index({ user_id: 1 });

module.exports = mongoose.model('Order', orderSchema);
