// PureNest Clean Co. — booking email notifications
// Sends booking confirmation emails via Gmail SMTP (nodemailer).
// Credentials come ONLY from environment variables:
//   GMAIL_USER         - Gmail address used to send (e.g. goyaldhiman00@gmail.com)
//   GMAIL_APP_PASSWORD - Gmail App Password (16 chars, NOT the normal Gmail password)
//   OWNER_EMAIL        - optional, defaults to goyaldhiman00@gmail.com
// See EMAIL_SETUP.md for how to create an App Password and set these in Vercel.
// Email must NEVER fail a booking: every send is wrapped in try/catch and
// returns a status string ("sent" / "failed" / "not_configured") instead of throwing.
const nodemailer = require('nodemailer');

const OWNER_EMAIL = process.env.OWNER_EMAIL || 'goyaldhiman00@gmail.com';

let transporter = null;
function getTransporter() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: { user, pass },
    });
  }
  return transporter;
}

function isConfigured() {
  return !!(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD);
}

function isValidEmail(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function bookingLines(b) {
  return [
    `Booking ID: ${b.id}`,
    `Service: ${b.serviceName || b.serviceId || ''}`,
    `Date: ${b.date || ''} at ${b.time || ''}`,
    `Bedrooms: ${b.bedrooms ?? ''} | Bathrooms: ${b.bathrooms ?? ''}`,
    `Address: ${b.address || ''}`,
    `Total: AED ${b.total ?? ''}`,
    `Payment: ${b.payment || ''}`,
    `Extras: ${Array.isArray(b.extras) && b.extras.length ? b.extras.join(', ') : 'None'}`,
    `Frequency: ${b.frequency || 'one-time'}`,
  ].join('\n');
}

async function sendMail({ to, subject, text, html }) {
  const t = getTransporter();
  if (!t) return { status: 'not_configured', detail: 'Email not configured — set GMAIL_USER and GMAIL_APP_PASSWORD' };
  try {
    await t.sendMail({ from: `"PureNest Clean Co." <${process.env.GMAIL_USER}>`, to, subject, text, html });
    console.log(`Email sent to ${to}: ${subject}`);
    return { status: 'sent', detail: `Sent to ${to}` };
  } catch (e) {
    const detail = String((e && e.message) || e || 'Email send failed').slice(0, 300);
    console.error(`Email to ${to} failed:`, detail);
    return { status: 'failed', detail };
  }
}

// ---------- Bookings: customer confirmation + owner alert ----------
async function sendBookingEmails(booking) {
  if (!isConfigured()) {
    return { status: 'not_configured', detail: 'Email not configured — set GMAIL_USER and GMAIL_APP_PASSWORD' };
  }
  const results = [];

  // 1. Customer confirmation (only if they gave a valid email)
  if (isValidEmail(booking.email)) {
    const subject = `Your PureNest booking is confirmed — ${booking.id}`;
    const text = [
      `Hi ${booking.name},`,
      '',
      'Your PureNest cleaning booking is confirmed!',
      '',
      bookingLines(booking),
      `Access token (keep it safe — you need it to view / cancel your booking): ${booking.accessToken}`,
      '',
      'Our team will contact you shortly to confirm.',
      '',
      'Thank you for choosing PureNest Clean Co.',
      'By Goyal Kumar',
    ].join('\n');
    const html = [
      `<p>Hi ${esc(booking.name)},</p>`,
      '<p><strong>Your PureNest cleaning booking is confirmed!</strong></p>',
      `<pre>${esc(bookingLines(booking))}</pre>`,
      `<p>Access token (keep it safe — you need it to view / cancel your booking): <strong>${esc(booking.accessToken)}</strong></p>`,
      '<p>Our team will contact you shortly to confirm.</p>',
      '<p>Thank you for choosing PureNest Clean Co.<br><small>By Goyal Kumar</small></p>',
    ].join('\n');
    results.push(await sendMail({ to: booking.email.trim(), subject, text, html }));
  }

  // 2. Owner alert — always sent when email is configured
  const ownerSubject = `New PureNest booking — ${booking.id} — ${booking.name}`;
  const ownerText = [
    'New booking on PureNest Clean Co.',
    '',
    `Customer: ${booking.name}`,
    `Phone: ${booking.phone}`,
    `Email: ${booking.email || '—'}`,
    bookingLines(booking),
    `Notes: ${booking.notes || '—'}`,
    `Eco-clean: ${booking.eco ? 'Yes' : 'No'} | Allergy mode: ${booking.allergy ? 'Yes' : 'No'} | Senior discount: ${booking.senior ? 'Yes' : 'No'}`,
    `Coupon: ${booking.coupon || '—'}`,
    '',
    `Contact the customer to confirm. Booking ID: ${booking.id}`,
  ].join('\n');
  const ownerHtml = [
    '<p><strong>New booking on PureNest Clean Co.</strong></p>',
    `<p>Customer: <strong>${esc(booking.name)}</strong><br>Phone: ${esc(booking.phone)}<br>Email: ${esc(booking.email || '—')}</p>`,
    `<pre>${esc(bookingLines(booking))}</pre>`,
    `<p>Notes: ${esc(booking.notes || '—')}<br>Eco-clean: ${booking.eco ? 'Yes' : 'No'} | Allergy mode: ${booking.allergy ? 'Yes' : 'No'} | Senior discount: ${booking.senior ? 'Yes' : 'No'}<br>Coupon: ${esc(booking.coupon || '—')}</p>`,
    `<p>Contact the customer to confirm. Booking ID: ${esc(booking.id)}</p>`,
  ].join('\n');
  results.push(await sendMail({ to: OWNER_EMAIL, subject: ownerSubject, text: ownerText, html: ownerHtml }));

  const failed = results.find((r) => r.status === 'failed');
  if (failed) return { status: 'failed', detail: failed.detail };
  return { status: 'sent', detail: results.map((r) => r.detail).join('; ') };
}

// ---------- Waitlist: owner alert + customer confirmation ----------
async function sendWaitlistEmails(entry) {
  if (!isConfigured()) return { status: 'not_configured', detail: 'Email not configured — set GMAIL_USER and GMAIL_APP_PASSWORD' };
  const results = [];
  if (isValidEmail(entry.email)) {
    results.push(await sendMail({
      to: entry.email.trim(),
      subject: 'You are on the PureNest waitlist',
      text: `Hi ${entry.name || ''},\n\nThanks — you are on the PureNest waitlist for ${entry.area || 'your area'}. We will notify you when a slot opens.\n\nPureNest Clean Co.`,
      html: `<p>Hi ${esc(entry.name || '')},</p><p>Thanks — you are on the PureNest waitlist for ${esc(entry.area || 'your area')}. We will notify you when a slot opens.</p><p>PureNest Clean Co.</p>`,
    }));
  }
  results.push(await sendMail({
    to: OWNER_EMAIL,
    subject: `New PureNest waitlist sign-up — ${entry.name || entry.email || ''}`,
    text: `New waitlist sign-up:\n\nName: ${entry.name || '—'}\nEmail: ${entry.email || '—'}\nArea: ${entry.area || '—'}\nID: ${entry.id || '—'}`,
    html: `<p><strong>New waitlist sign-up</strong></p><p>Name: ${esc(entry.name || '—')}<br>Email: ${esc(entry.email || '—')}<br>Area: ${esc(entry.area || '—')}<br>ID: ${esc(entry.id || '—')}</p>`,
  }));
  const failed = results.find((r) => r.status === 'failed');
  return failed ? { status: 'failed', detail: failed.detail } : { status: 'sent', detail: results.map((r) => r.detail).join('; ') };
}

// ---------- Callback / inquiry: owner alert (+ customer confirmation if email given) ----------
async function sendCallbackEmails(entry) {
  if (!isConfigured()) return { status: 'not_configured', detail: 'Email not configured — set GMAIL_USER and GMAIL_APP_PASSWORD' };
  const results = [];
  if (isValidEmail(entry.email)) {
    results.push(await sendMail({
      to: entry.email.trim(),
      subject: 'PureNest — we will call you back shortly',
      text: `Hi ${entry.name || ''},\n\nThanks for reaching out. Our team will call you back shortly.\n\nPureNest Clean Co.`,
      html: `<p>Hi ${esc(entry.name || '')},</p><p>Thanks for reaching out. Our team will call you back shortly.</p><p>PureNest Clean Co.</p>`,
    }));
  }
  results.push(await sendMail({
    to: OWNER_EMAIL,
    subject: `New PureNest callback request — ${entry.name || entry.phone || ''}`,
    text: `New callback request:\n\nName: ${entry.name || '—'}\nPhone: ${entry.phone || '—'}\nEmail: ${entry.email || '—'}\nMessage: ${entry.message || '—'}\nID: ${entry.id || '—'}`,
    html: `<p><strong>New callback request</strong></p><p>Name: ${esc(entry.name || '—')}<br>Phone: ${esc(entry.phone || '—')}<br>Email: ${esc(entry.email || '—')}<br>Message: ${esc(entry.message || '—')}<br>ID: ${esc(entry.id || '—')}</p>`,
  }));
  const failed = results.find((r) => r.status === 'failed');
  return failed ? { status: 'failed', detail: failed.detail } : { status: 'sent', detail: results.map((r) => r.detail).join('; ') };
}

module.exports = { sendBookingEmails, sendWaitlistEmails, sendCallbackEmails, isConfigured, isValidEmail, OWNER_EMAIL };
