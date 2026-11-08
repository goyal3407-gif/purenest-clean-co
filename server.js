// PureNest Clean Co. - server
// By Goyal Kumar
// Express + local JSON storage. No secrets are hard-coded: admin password,
// WhatsApp credentials and Gemini key all come from environment variables.
const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA = path.join(__dirname, 'data');
fs.mkdirSync(DATA, { recursive: true });
app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public')));

function load(name, fallback) {
  const f = path.join(DATA, name);
  try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return fallback; }
}
function save(name, data) {
  fs.writeFileSync(path.join(DATA, name), JSON.stringify(data, null, 2));
}
function uid(prefix) { return prefix + '-' + Date.now().toString(36) + '-' + crypto.randomBytes(3).toString('hex'); }
function token() { return crypto.randomBytes(24).toString('hex'); }

// In-memory admin sessions (token -> createdAt)
const sessions = new Map();
function requireAdmin(req, res, next) {
  const t = (req.headers.authorization || '').replace('Bearer ', '');
  if (t && sessions.has(t)) return next();
  return res.status(401).json({ ok: false, error: 'Admin login required' });
}
function adminConfigured() { return !!process.env.ADMIN_PASSWORD; }

// ---------- Services (shared catalogue) ----------
const SERVICES = [
  { id: 'deep', name: 'Deep Cleaning', price: 249, unit: 'per home', desc: 'Top-to-bottom deep clean: kitchen, bathrooms, floors, dusting, cobwebs and sanitising.', tag: 'Most Popular', category: 'home' },
  { id: 'regular', name: 'Regular Home Cleaning', price: 149, unit: 'per visit', desc: 'Weekly / fortnightly tidy-up: dusting, vacuuming, mopping, bathrooms and kitchen surfaces.', tag: '', category: 'home' },
  { id: 'move', name: 'Move-In / Move-Out Cleaning', price: 299, unit: 'per home', desc: 'Landlord-approved checklist, deposit-back guarantee, empty-home deep clean.', tag: 'Deposit-back', category: 'move' },
  { id: 'reno', name: 'Post-Renovation Cleaning', price: 349, unit: 'per home', desc: 'Dust, paint and debris removal after renovation, with fine-dust and window cleaning.', tag: '', category: 'special' },
  { id: 'airbnb', name: 'Airbnb / Short-Stay Turnover', price: 129, unit: 'per turnover', desc: 'Cleaning between guests, linen change, restocking and host photos after every stay.', tag: '', category: 'special' },
  { id: 'office', name: 'Office & Commercial Cleaning', price: 199, unit: 'per visit', desc: 'Offices, shops and clinics: desks, washrooms, floors, bins and common areas.', tag: 'Business', category: 'business' },
  { id: 'pet', name: 'Pet Cleaning', price: 179, unit: 'per visit', desc: 'Pet hair, odour removal and pet-safe products. Safe for dogs, cats and kids.', tag: '', category: 'special' },
  { id: 'car', name: 'Car + Home Combo', price: 99, unit: 'add-on', desc: 'Add a full car clean to any home booking and save with the bundle discount.', tag: 'Bundle', category: 'combo' },
];
app.get('/api/services', (req, res) => res.json({ ok: true, services: SERVICES }));

// ---------- WhatsApp ----------
async function sendWhatsApp(booking) {
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const owner = process.env.OWNER_WHATSAPP || '917876520226';
  if (!phoneId || !accessToken) return { status: 'not_configured', detail: 'Not sent — API not connected' };
  const text = `New PureNest booking ${booking.id}\n${booking.name} | ${booking.phone}\n${booking.serviceName} | ${booking.date} ${booking.time}\n${booking.address}\nBedrooms: ${booking.bedrooms}, Bathrooms: ${booking.bathrooms}\nTotal: AED ${booking.total} | Payment: ${booking.payment}`;
  try {
    const r = await fetch(`https://graph.facebook.com/v20.0/${phoneId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({ messaging_product: 'whatsapp', to: owner, type: 'text', text: { body: text } }),
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) return { status: 'failed', detail: data?.error?.message || `WhatsApp API error ${r.status}` };
    return { status: 'sent', detail: 'Sent to owner on WhatsApp', messageId: data?.messages?.[0]?.id || null };
  } catch (e) {
    return { status: 'failed', detail: String(e.message || e) };
  }
}

// ---------- Bookings ----------
app.post('/api/bookings', async (req, res) => {
  const b = req.body || {};
  if (!b.name || !b.phone || !b.serviceId || !b.date) return res.status(400).json({ ok: false, error: 'Name, phone, service and date are required' });
  const svc = SERVICES.find(s => s.id === b.serviceId) || { name: b.serviceId, price: 0 };
  const booking = {
    id: uid('PN'), accessToken: token(), createdAt: new Date().toISOString(),
    name: b.name, phone: b.phone, email: b.email || '', address: b.address || '',
    serviceId: b.serviceId, serviceName: svc.name, date: b.date, time: b.time || '10:00',
    bedrooms: Number(b.bedrooms || 2), bathrooms: Number(b.bathrooms || 1),
    extras: b.extras || [], frequency: b.frequency || 'one-time', total: Number(b.total || svc.price),
    payment: b.payment || 'cash', status: 'confirmed', notes: b.notes || '',
    eco: !!b.eco, allergy: !!b.allergy, senior: !!b.senior, whatsapp_status: 'pending', whatsapp_detail: '', whatsapp_message_id: null,
  };
  const wa = await sendWhatsApp(booking);
  booking.whatsapp_status = wa.status; booking.whatsapp_detail = wa.detail; booking.whatsapp_message_id = wa.messageId || null;
  const all = load('bookings.json', []); all.push(booking); save('bookings.json', all);
  res.json({ ok: true, booking: { ...booking, accessToken: booking.accessToken } });
});
app.get('/api/bookings/:id', (req, res) => {
  const all = load('bookings.json', []);
  const b = all.find(x => x.id === req.params.id);
  if (!b) return res.status(404).json({ ok: false, error: 'Booking not found' });
  if (req.query.token !== b.accessToken) return res.status(403).json({ ok: false, error: 'Access token required' });
  res.json({ ok: true, booking: b });
});
app.post('/api/bookings/:id/cancel', (req, res) => {
  const all = load('bookings.json', []);
  const b = all.find(x => x.id === req.params.id);
  if (!b || req.body?.token !== b.accessToken) return res.status(403).json({ ok: false, error: 'Not allowed' });
  b.status = 'cancelled'; save('bookings.json', all); res.json({ ok: true, booking: b });
});
app.post('/api/bookings/:id/resend-whatsapp', requireAdmin, async (req, res) => {
  const all = load('bookings.json', []);
  const b = all.find(x => x.id === req.params.id);
  if (!b) return res.status(404).json({ ok: false, error: 'Booking not found' });
  const wa = await sendWhatsApp(b);
  b.whatsapp_status = wa.status; b.whatsapp_detail = wa.detail; b.whatsapp_message_id = wa.messageId || null;
  save('bookings.json', all); res.json({ ok: true, booking: b });
});

// ---------- Reviews / inquiries / waitlist / subscriptions ----------
app.get('/api/reviews', (req, res) => res.json({ ok: true, reviews: load('reviews.json', [
  { name: 'Aisha M.', rating: 5, text: 'Deep clean was perfect — kitchen and bathrooms looked brand new.', service: 'Deep Cleaning' },
  { name: 'Rahul S.', rating: 5, text: 'On time, polite team, great price. Booked weekly now.', service: 'Regular Home Cleaning' },
  { name: 'Sara K.', rating: 4, text: 'Airbnb turnover was fast and the photos helped a lot.', service: 'Airbnb Turnover' },
])}));
app.post('/api/reviews', (req, res) => {
  const r = req.body || {}; if (!r.name || !r.text) return res.status(400).json({ ok: false, error: 'Name and review required' });
  const all = load('reviews.json', []); all.push({ name: r.name, rating: Number(r.rating || 5), text: r.text, service: r.service || '', createdAt: new Date().toISOString() });
  save('reviews.json', all); res.json({ ok: true });
});
app.post('/api/inquiries', (req, res) => {
  const all = load('inquiries.json', []); all.push({ ...req.body, id: uid('INQ'), createdAt: new Date().toISOString() }); save('inquiries.json', all);
  res.json({ ok: true, message: 'Thanks! We will call you back shortly.' });
});
app.post('/api/waitlist', (req, res) => {
  const all = load('waitlist.json', []); all.push({ ...req.body, id: uid('WL'), createdAt: new Date().toISOString() }); save('waitlist.json', all);
  res.json({ ok: true, message: 'Added to the waitlist — we will notify you when a slot opens.' });
});
app.post('/api/subscriptions', (req, res) => {
  const all = load('subscriptions.json', []); all.push({ ...req.body, id: uid('SUB'), status: 'active', createdAt: new Date().toISOString() }); save('subscriptions.json', all);
  res.json({ ok: true, message: 'Subscription started. You can pause anytime from My Bookings.' });
});
app.post('/api/claims', (req, res) => {
  const all = load('claims.json', []); all.push({ ...req.body, id: uid('CLM'), status: 'open', createdAt: new Date().toISOString() }); save('claims.json', all);
  res.json({ ok: true, message: 'Claim filed. Our team will contact you within 24 hours.' });
});

// ---------- AI plan + AI support chat ----------
app.post('/api/ai-plan', (req, res) => {
  const a = req.body || {};
  const plan = [];
  plan.push(`Home: ${a.bedrooms || 2} bed / ${a.bathrooms || 1} bath, ${a.homeType || 'apartment'}.`);
  plan.push(a.pets ? 'Pet plan: pet-hair removal, odour treatment and pet-safe products.' : 'No pets: standard products are fine.');
  plan.push(a.allergy ? 'Allergy plan: anti-allergen, dust-free deep clean with HEPA vacuuming.' : 'Standard dusting and vacuuming.');
  plan.push(`Frequency: ${a.frequency || 'weekly'} — recommended service: ${(a.budget || 'standard') === 'budget' ? 'Regular Home Cleaning' : 'Deep Cleaning'} first, then regular visits.`);
  plan.push(a.eco ? 'Eco plan: chemical-free, baby-safe products only.' : 'Standard eco-friendly products.');
  res.json({ ok: true, plan });
});
const BUILTIN_ANSWERS = [
  [/price|cost|how much/i, 'Prices start at AED 99 for add-ons, AED 129 for Airbnb turnover, AED 149 for regular cleaning and AED 249 for deep cleaning. Use the Instant Price Estimator on the home page for an exact price.'],
  [/book|appointment|slot/i, 'Pick a service, choose a date and time in the booking form, and confirm. You get a booking ID and can track it in My Bookings.'],
  [/whatsapp|contact|phone/i, 'You can reach us on WhatsApp or through the callback form. Bookings are sent to the business WhatsApp automatically once connected.'],
  [/cancel|refund/i, 'You can cancel a booking from My Bookings with your booking ID. Cancellations up to 12 hours before are free.'],
  [/eco|chemical|baby|pet/i, 'Yes — choose Eco-Clean for chemical-free, pet-safe and baby-safe products, and Allergy Mode for a dust-free anti-allergen clean.'],
];
app.post('/api/ai-chat', async (req, res) => {
  const q = String(req.body?.message || '');
  const key = process.env.GEMINI_API_KEY;
  if (key) {
    try {
      const r = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent', {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': key },
        body: JSON.stringify({ contents: [{ parts: [{ text: `You are PureNest Clean Co. support. Answer briefly about cleaning services, booking and pricing. Question: ${q}` }] }] }),
      });
      const d = await r.json();
      const text = d?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) return res.json({ ok: true, reply: text, source: 'gemini' });
    } catch { /* fall through to built-in answers */ }
  }
  const hit = BUILTIN_ANSWERS.find(([re]) => re.test(q));
  res.json({ ok: true, reply: hit ? hit[1] : 'I can help with pricing, booking, eco/allergy cleaning, cancellations and WhatsApp contact. Ask about any of those, or use the booking form.', source: 'built-in' });
});

// ---------- Admin ----------
app.get('/api/admin/setup-status', (req, res) => res.json({ ok: true, setupComplete: adminConfigured() }));
app.post('/api/admin/login', (req, res) => {
  if (!adminConfigured()) return res.status(400).json({ ok: false, error: 'Admin password is not configured. Set ADMIN_PASSWORD in .env' });
  if (req.body?.password !== process.env.ADMIN_PASSWORD) return res.status(401).json({ ok: false, error: 'Wrong password' });
  const t = token(); sessions.set(t, Date.now()); res.json({ ok: true, token: t });
});
app.post('/api/admin/logout', (req, res) => { sessions.delete(req.body?.token || ''); res.json({ ok: true }); });
app.get('/api/admin/stats', requireAdmin, (req, res) => {
  const bookings = load('bookings.json', []); const reviews = load('reviews.json', []);
  const revenue = bookings.filter(b => b.status !== 'cancelled').reduce((s, b) => s + (b.total || 0), 0);
  res.json({ ok: true, stats: { bookings: bookings.length, revenue, reviews: reviews.length, avgRating: reviews.length ? (reviews.reduce((s, r) => s + (r.rating || 5), 0) / reviews.length).toFixed(1) : '5.0', whatsappSent: bookings.filter(b => b.whatsapp_status === 'sent').length } });
});
app.get('/api/admin/bookings', requireAdmin, (req, res) => res.json({ ok: true, bookings: load('bookings.json', []).slice().reverse() }));
app.post('/api/admin/bookings/:id/status', requireAdmin, (req, res) => {
  const all = load('bookings.json', []); const b = all.find(x => x.id === req.params.id);
  if (!b) return res.status(404).json({ ok: false, error: 'Not found' });
  b.status = req.body?.status || b.status; save('bookings.json', all); res.json({ ok: true, booking: b });
});
app.get('/api/admin/settings', requireAdmin, (req, res) => res.json({ ok: true, settings: {
  ownerWhatsapp: process.env.OWNER_WHATSAPP || '917876520226',
  phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID ? '*** set ***' : '',
  accessToken: process.env.WHATSAPP_ACCESS_TOKEN ? '*** set ***' : '',
  template: process.env.WHATSAPP_TEMPLATE || 'booking_notification',
  configured: !!(process.env.WHATSAPP_PHONE_NUMBER_ID && process.env.WHATSAPP_ACCESS_TOKEN),
}}));
app.get('/api/invoice/:id', (req, res) => {
  const b = load('bookings.json', []).find(x => x.id === req.params.id);
  if (!b) return res.status(404).send('Booking not found');
  res.type('html').send(`<html><body style="font-family:sans-serif;padding:32px"><h1>PureNest Clean Co. — Invoice</h1><p>Booking ${b.id} | ${b.name} | ${b.date} ${b.time}</p><p>${b.serviceName} — AED ${b.total}</p><p>Payment: ${b.payment}</p><p><small>By Goyal Kumar</small></p></body></html>`);
});
app.get('/api/calendar/:id.ics', (req, res) => {
  const b = load('bookings.json', []).find(x => x.id === req.params.id.replace('.ics', ''));
  if (!b) return res.status(404).send('Booking not found');
  const dt = (b.date || '2026-11-10').replace(/-/g, '') + 'T100000';
  res.type('text/calendar').send(`BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nUID:${b.id}@purenest\nDTSTART:${dt}\nSUMMARY:PureNest Cleaning - ${b.serviceName}\nLOCATION:${b.address}\nEND:VEVENT\nEND:VCALENDAR`);
});
// Staff view (code from env)
app.post('/api/staff/jobs', (req, res) => {
  if (!process.env.STAFF_CODE || req.body?.code !== process.env.STAFF_CODE) return res.status(401).json({ ok: false, error: 'Wrong staff code' });
  res.json({ ok: true, jobs: load('bookings.json', []).filter(b => b.status === 'confirmed') });
});

app.get('/health', (req, res) => res.json({ ok: true, service: 'purenest-clean-co' }));
app.listen(PORT, () => console.log(`PureNest Clean Co. running on http://localhost:${PORT}`));
