const mongoose = require('mongoose');

const wishlistItemSchema = new mongoose.Schema({
  user_id:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
}, { timestamps: { createdAt: 'created_at', updatedAt: false } });

wishlistItemSchema.index({ user_id: 1, product_id: 1 }, { unique: true });

module.exports = mongoose.model('WishlistItem', wishlistItemSchema);
