// routes/auth.js — Register (with OTP), Login, Me, Reset Password (MongoDB)
const router             = require('express').Router();
const bcrypt             = require('bcryptjs');
const jwt                = require('jsonwebtoken');
const User               = require('../models/User');
const OTPStore           = require('../models/OTPStore');
const PasswordResetStore = require('../models/PasswordResetStore');
const { requireAuth }    = require('../middleware/auth');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function signToken(user) {
  return jwt.sign(
    { id: user._id.toString(), name: user.name, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

// POST /api/auth/send-otp — step 1 of registration: validate + email OTP
router.post('/send-otp', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: 'name, email and password are required' });
    if (!EMAIL_RE.test(email))
      return res.status(400).json({ error: 'Invalid email address' });
    if (password.length < 6)
      return res.status(400).json({ error: 'Password must be at least 6 characters' });

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(409).json({ error: 'Email already registered' });

    // Generate 6-digit OTP
    const otp           = Math.floor(100000 + Math.random() * 900000).toString();
    const password_hash = await bcrypt.hash(password, 12);
    const expiresAt     = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Always save OTP first — email sending is best-effort
    await OTPStore.findOneAndUpdate(
      { email: email.toLowerCase() },
      { otp, name: name.trim(), password_hash, expiresAt },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Attempt to send OTP email via EmailJS (non-blocking — never fails the request)
    const sendEmail = req.app.locals.sendEmail;
    let emailSent   = false;
    if (sendEmail) {
      try {
        const templateId = process.env.EMAILJS_TEMPLATE_OTP_ID || process.env.EMAILJS_TEMPLATE_ORDER_ID;
        const expiry = new Date(Date.now() + 10 * 60 * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        await sendEmail(
          {
            email:    email.toLowerCase(),   // {{email}} → To Email field
            passcode: otp,                   // {{passcode}} → OTP code in body
            time:     expiry,                // {{time}} → expiry time in body
            to_name:  name.trim(),
          },
          templateId
        );
        emailSent = true;
        console.log(`✉️  OTP sent to ${email}`);
      } catch (emailErr) {
        // Log full details to help diagnose template / credential issues
        console.error('❌  EmailJS send failed:', emailErr?.message || emailErr);
        console.error('    status:', emailErr?.status);
        console.error('    text:  ', emailErr?.text);
      }
    }

    // In development always surface the OTP so you can test without a working template
    const isDev = process.env.NODE_ENV !== 'production';
    if (isDev) {
      console.log(`🔑  DEV OTP for ${email}: ${otp}`);
      return res.json({
        message:  emailSent
          ? `OTP sent to ${email}. Valid for 10 minutes.`
          : `Email delivery failed — use this code to continue:`,
        ...(isDev && { dev_otp: otp }),   // ← visible in dev, hidden in prod
      });
    }

    // Production — email must succeed
    if (!emailSent) {
      // Roll back the OTP record so user can retry
      await OTPStore.deleteOne({ email: email.toLowerCase() });
      return res.status(500).json({ error: 'Failed to send OTP email. Please try again.' });
    }

    res.json({ message: `OTP sent to ${email}. Valid for 10 minutes.` });
  } catch (err) {
    console.error('send-otp error:', err);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// POST /api/auth/verify-otp — step 2: verify OTP and create account
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp)
      return res.status(400).json({ error: 'email and otp are required' });

    const record = await OTPStore.findOne({ email: email.toLowerCase() });
    if (!record)
      return res.status(400).json({ error: 'OTP expired or not found. Please sign up again.' });

    if (new Date() > record.expiresAt) {
      await record.deleteOne();
      return res.status(400).json({ error: 'OTP has expired. Please sign up again.' });
    }
    if (record.otp !== otp.trim())
      return res.status(400).json({ error: 'Incorrect OTP. Please try again.' });

    // Check email not grabbed by another user during OTP window
    const exists = await User.findOne({ email: record.email });
    if (exists) {
      await record.deleteOne();
      return res.status(409).json({ error: 'Email already registered' });
    }

    const user = await User.create({
      name:          record.name,
      email:         record.email,
      password_hash: record.password_hash,
    });
    await record.deleteOne();

    const token = signToken(user);
    res.status(201).json({
      message: 'Account created',
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error('verify-otp error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: 'name, email and password are required' });
    if (!EMAIL_RE.test(email))
      return res.status(400).json({ error: 'Invalid email address' });
    if (password.length < 6)
      return res.status(400).json({ error: 'Password must be at least 6 characters' });

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(409).json({ error: 'Email already registered' });

    const password_hash = await bcrypt.hash(password, 12);
    const user = await User.create({ name: name.trim(), email: email.toLowerCase(), password_hash });

    const token = signToken(user);
    res.status(201).json({ message: 'Account created', token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'email and password are required' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    const token = signToken(user);
    res.json({ message: 'Login successful', token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/auth/me
router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('name email created_at');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user: { id: user._id, name: user.name, email: user.email, created_at: user.created_at } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/auth/me
router.put('/me', requireAuth, async (req, res) => {
  try {
    const { name, email, currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (currentPassword || newPassword) {
      if (!currentPassword || !newPassword)
        return res.status(400).json({ error: 'Both currentPassword and newPassword are required' });
      if (newPassword.length < 6)
        return res.status(400).json({ error: 'New password must be at least 6 characters' });
      const match = await bcrypt.compare(currentPassword, user.password_hash);
      if (!match) return res.status(401).json({ error: 'Current password is incorrect' });
      user.password_hash = await bcrypt.hash(newPassword, 12);
      await user.save();
      return res.json({ message: 'Password updated successfully' });
    }

    if (!name || !name.trim())
      return res.status(400).json({ error: 'name is required' });

    user.name = name.trim();
    if (email && EMAIL_RE.test(email)) {
      const taken = await User.findOne({ email: email.toLowerCase(), _id: { $ne: user._id } });
      if (taken) return res.status(409).json({ error: 'Email already in use' });
      user.email = email.toLowerCase();
    }
    await user.save();
    res.json({ message: 'Profile updated', user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/forgot-password — step 1: send reset OTP to registered email
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !EMAIL_RE.test(email))
      return res.status(400).json({ error: 'Valid email is required' });

    const user = await User.findOne({ email: email.toLowerCase() });
    // Always respond the same way to avoid email enumeration
    if (!user) {
      return res.json({ message: `If that email is registered, a reset code has been sent.` });
    }

    const otp       = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    await PasswordResetStore.findOneAndUpdate(
      { email: email.toLowerCase() },
      { otp, expiresAt },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const sendEmail = req.app.locals.sendEmail;
    let emailSent   = false;
    if (sendEmail) {
      try {
        const templateId = process.env.EMAILJS_TEMPLATE_OTP_ID || process.env.EMAILJS_TEMPLATE_ORDER_ID;
        const expiry     = new Date(expiresAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        await sendEmail(
          { email: email.toLowerCase(), passcode: otp, time: expiry, to_name: user.name },
          templateId
        );
        emailSent = true;
      } catch (emailErr) {
        console.error('forgot-password email failed:', emailErr?.message);
      }
    }

    const isDev = process.env.NODE_ENV !== 'production';
    if (isDev) console.log(`[DEV] Password reset OTP for ${email}: ${otp}`);
    res.json({
      message: `If that email is registered, a reset code has been sent.`,
      ...(isDev && { dev_otp: otp }),
    });
  } catch (err) {
    console.error('forgot-password error:', err);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// POST /api/auth/reset-password — step 2: verify OTP + set new password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword)
      return res.status(400).json({ error: 'email, otp and newPassword are required' });
    if (newPassword.length < 6)
      return res.status(400).json({ error: 'Password must be at least 6 characters' });

    const record = await PasswordResetStore.findOne({ email: email.toLowerCase() });
    if (!record)
      return res.status(400).json({ error: 'Reset code expired or not found. Please request a new one.' });

    if (new Date() > record.expiresAt) {
      await record.deleteOne();
      return res.status(400).json({ error: 'Reset code has expired. Please request a new one.' });
    }
    if (record.otp !== otp.trim())
      return res.status(400).json({ error: 'Incorrect code. Please try again.' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ error: 'Account not found.' });

    user.password_hash = await bcrypt.hash(newPassword, 12);
    await user.save();
    await record.deleteOne();

    res.json({ message: 'Password reset successfully. You can now sign in.' });
  } catch (err) {
    console.error('reset-password error:', err);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

module.exports = router;
