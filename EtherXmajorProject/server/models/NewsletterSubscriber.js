const mongoose = require('mongoose');

const newsletterSubscriberSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
}, { timestamps: { createdAt: 'subscribed_at', updatedAt: false } });

module.exports = mongoose.model('NewsletterSubscriber', newsletterSubscriberSchema);
