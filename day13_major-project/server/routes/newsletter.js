// routes/newsletter.js — Newsletter subscription (MongoDB + EmailJS)
const router     = require('express').Router();
const Subscriber = require('../models/NewsletterSubscriber');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /api/newsletter/subscribe
router.post('/subscribe', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !EMAIL_RE.test(email.trim()))
      return res.status(400).json({ error: 'A valid email address is required' });

    const normalised = email.trim().toLowerCase();
    const existing = await Subscriber.findOne({ email: normalised });
    if (existing) return res.status(409).json({ error: 'This email is already subscribed' });

    await Subscriber.create({ email: normalised });

    // Send welcome email via EmailJS
    const sendEmail = req.app.locals.sendEmail;
    if (sendEmail && process.env.EMAILJS_TEMPLATE_NEWSLETTER_ID) {
      sendEmail(
        { to_email: normalised, to_name: normalised.split('@')[0] },
        process.env.EMAILJS_TEMPLATE_NEWSLETTER_ID
      ).catch(err => console.warn('EmailJS newsletter email failed:', err.message));
    }

    res.status(201).json({ message: 'Subscribed successfully! Welcome to EtherX.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/newsletter/subscribers — admin: list all
router.get('/subscribers', async (req, res) => {
  try {
    const rows = await Subscriber.find().sort({ subscribed_at: -1 });
    res.json({ count: rows.length, subscribers: rows });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
