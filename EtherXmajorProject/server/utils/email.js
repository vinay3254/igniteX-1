// utils/email.js — EmailJS server-side mailer
const emailjs = require('@emailjs/nodejs');

/**
 * Initialise EmailJS and return a sendEmail helper.
 * Returns null if required env vars are missing.
 */
function initEmailJS() {
  const publicKey  = process.env.EMAILJS_PUBLIC_KEY;
  const privateKey = process.env.EMAILJS_PRIVATE_KEY;
  const serviceId  = process.env.EMAILJS_SERVICE_ID;

  if (!publicKey || !privateKey || !serviceId) {
    console.warn('⚠️  EmailJS env vars not fully set — email sending is disabled.');
    console.warn('   Set EMAILJS_SERVICE_ID, EMAILJS_PUBLIC_KEY, EMAILJS_PRIVATE_KEY in .env');
    return null;
  }

  emailjs.init({ publicKey, privateKey });

  /**
   * @param {object} templateParams  - Key/value pairs for the EmailJS template
   * @param {string} templateId      - EmailJS template ID to use
   */
  return async function sendEmail(templateParams, templateId) {
    return emailjs.send(serviceId, templateId, templateParams);
  };
}

module.exports = { initEmailJS };
