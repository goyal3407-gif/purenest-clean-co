// PureNest Clean Co. — database layer (MERN)
// MongoDB Atlas (free M0) via mongoose when MONGODB_URI is set,
// otherwise local JSON files in data/ — the site works either way.
// See ATLAS_SETUP.md for the free Atlas setup steps.
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const DATA = path.join(__dirname, 'data');
fs.mkdirSync(DATA, { recursive: true });

function load(name, fallback) {
  try { return JSON.parse(fs.readFileSync(path.join(DATA, name), 'utf8')); } catch { return fallback; }
}
function save(name, data) {
  fs.writeFileSync(path.join(DATA, name), JSON.stringify(data, null, 2));
}

// ---------- Mongoose models ----------
const bookingSchema = new mongoose.Schema({
  id: { type: String, unique: true, index: true }, accessToken: String, createdAt: String,
  name: String, phone: String, email: String, address: String,
  serviceId: String, serviceName: String, date: String, time: String,
  bedrooms: Number, bathrooms: Number, extras: [String], frequency: String,
  total: Number, payment: String, status: { type: String, default: 'confirmed' }, notes: String, coupon: String,
  eco: Boolean, allergy: Boolean, senior: Boolean,
  whatsapp_status: String, whatsapp_detail: String, whatsapp_message_id: String,
  email_status: { type: String, default: 'not_configured' }, email_detail: String,
}, { timestamps: false });
const reviewSchema = new mongoose.Schema({
  name: String, rating: Number, text: String, service: String, createdAt: String,
});
const inquirySchema = new mongoose.Schema({
  kind: { type: String, default: 'callback' }, name: String, phone: String,
  email: String, message: String, createdAt: String,
});
const waitlistSchema = new mongoose.Schema({
  name: String, email: String, area: String, createdAt: String,
});
const callbackSchema = new mongoose.Schema({
  name: String, phone: String, message: String, status: { type: String, default: 'open' }, createdAt: String,
});
const subscriptionSchema = new mongoose.Schema({
  plan: String, email: String, status: { type: String, default: 'active' }, createdAt: String,
});
const claimSchema = new mongoose.Schema({
  name: String, bookingId: String, details: String, status: { type: String, default: 'open' }, createdAt: String,
});

const Booking = mongoose.models.Booking || mongoose.model('Booking', bookingSchema);
const Review = mongoose.models.Review || mongoose.model('Review', reviewSchema);
const Inquiry = mongoose.models.Inquiry || mongoose.model('Inquiry', inquirySchema);
const Waitlist = mongoose.models.Waitlist || mongoose.model('Waitlist', waitlistSchema);
const Callback = mongoose.models.Callback || mongoose.model('Callback', callbackSchema);
const Subscription = mongoose.models.Subscription || mongoose.model('Subscription', subscriptionSchema);
const Claim = mongoose.models.Claim || mongoose.model('Claim', claimSchema);

let mongoReady = false;
let lastError = null; // error MESSAGE only — never the URI or password
let connectPromise = null;
let lastAttemptAt = 0;
const CONNECT_OPTS = {
  serverSelectionTimeoutMS: 15000,
  connectTimeoutMS: 15000,
  socketTimeoutMS: 30000,
  family: 4, // Atlas free tier has no IPv6; force IPv4 so Vercel's IPv6-capable runtime can't pick an unreachable IPv6 address
};
function sanitizeError(e) {
  // Strip any URI/credential that could ever appear in an error message.
  let m = String((e && e.message) || e || 'Unknown MongoDB error');
  m = m.replace(/mongodb(\+srv)?:\/\/[^\s'"]+/gi, 'mongodb://[redacted]');
  return m.slice(0, 500);
}
async function tryConnectOnce() {
  const uri = process.env.MONGODB_URI;
  if (!uri) return false;
  // If a previous attempt left mongoose half-connected, reset it first.
  if (mongoose.connection.readyState === 2 || mongoose.connection.readyState === 3) {
    try { await mongoose.disconnect(); } catch { /* ignore */ }
  }
  await mongoose.connect(uri, CONNECT_OPTS);
  mongoReady = true;
  lastError = null;
  console.log('MongoDB: connected to Atlas (MONGODB_URI)');
  return true;
}
// One cached attempt, retried once on failure. The cached promise means
// concurrent serverless requests share a single connection attempt instead
// of each opening its own, and a failed attempt is not retried hammer-style:
// a fresh attempt is allowed only 30s after the last one failed.
async function connect() {
  if (isMongo()) return true;
  if (connectPromise) return connectPromise;
  const uri = process.env.MONGODB_URI;
  if (!uri) { if (!connect._noUriLogged) { connect._noUriLogged = true; console.log('MongoDB: MONGODB_URI not set — using local JSON storage in data/'); } return false; }
  if (Date.now() - lastAttemptAt < 30000 && lastError) return false;
  lastAttemptAt = Date.now();
  connectPromise = (async () => {
    try {
      return await tryConnectOnce();
    } catch (e) {
      lastError = sanitizeError(e);
      mongoReady = false;
      console.log('MongoDB: connection attempt 1 failed, retrying once:', lastError);
      try {
        await new Promise((r) => setTimeout(r, 1000));
        return await tryConnectOnce();
      } catch (e2) {
        lastError = sanitizeError(e2);
        mongoReady = false;
        console.log('MongoDB: connection failed, falling back to local JSON storage:', lastError);
        return false;
      }
    } finally {
      connectPromise = null;
    }
  })();
  return connectPromise;
}
// Lazily ensure a connection on first API use (Vercel serverless: every
// cold start is a fresh container, so a fire-and-forget connect() at
// startup races every handler and always loses — handlers must await this).
async function ensureMongo() {
  if (isMongo()) return true;
  try { return await connect(); } catch { return false; }
}
function isMongo() { return mongoReady && mongoose.connection.readyState === 1; }
function getStatus() {
  return {
    db: isMongo() ? 'mongodb' : 'json',
    mongoReady: isMongo(),
    readyState: mongoose.connection.readyState,
    uriConfigured: !!process.env.MONGODB_URI,
    lastError,
  };
}

// ---------- Store: Mongo when connected, JSON files otherwise ----------
const toObj = (d) => (d && typeof d.toObject === 'function' ? d.toObject() : d);
const strip = (d) => { const o = toObj(d); if (o) { delete o._id; delete o.__v; } return o; };

async function listBookings() {
  if (isMongo()) return (await Booking.find({}).lean()).map(strip);
  return load('bookings.json', []);
}
async function getBooking(id) {
  if (isMongo()) { const b = await Booking.findOne({ id }).lean(); return b ? strip(b) : null; }
  return load('bookings.json', []).find((x) => x.id === id) || null;
}
async function saveBooking(booking) {
  if (isMongo()) { await Booking.create(booking); return booking; }
  const all = load('bookings.json', []); all.push(booking); save('bookings.json', all); return booking;
}
async function updateBooking(id, patch) {
  if (isMongo()) { const b = await Booking.findOneAndUpdate({ id }, patch, { new: true }).lean(); return b ? strip(b) : null; }
  const all = load('bookings.json', []); const b = all.find((x) => x.id === id);
  if (!b) return null; Object.assign(b, patch); save('bookings.json', all); return b;
}
let seedReviews = null; // remembered from listReviews() so first write keeps seeds
async function listReviews(fallback) {
  if (fallback) seedReviews = fallback;
  if (isMongo()) { const r = await Review.find({}).lean(); return r.length ? r.map(strip) : fallback; }
  const file = load('reviews.json', null);
  return file === null ? fallback : file;
}
async function addReview(review) {
  if (isMongo()) { await Review.create(review); return; }
  // Seed reviews are the fallback when no file exists; preserve them on
  // first write, otherwise the first user review would wipe the seeds.
  const all = load('reviews.json', null);
  const list = Array.isArray(all) ? all : (seedReviews ? [...seedReviews] : []);
  list.push(review); save('reviews.json', list);
}
async function addDoc(kind, doc) {
  const file = { inquiry: 'inquiries.json', waitlist: 'waitlist.json', subscription: 'subscriptions.json', claim: 'claims.json' }[kind];
  if (isMongo()) {
    const Model = { inquiry: Inquiry, waitlist: Waitlist, subscription: Subscription, claim: Claim }[kind];
    await Model.create(doc); return;
  }
  const all = load(file, []); all.push(doc); save(file, all);
}
async function addCallback(doc) {
  if (isMongo()) { await Callback.create(doc); return; }
  const all = load('inquiries.json', []); all.push({ ...doc, kind: 'callback' }); save('inquiries.json', all);
}

module.exports = {
  connect, ensureMongo, isMongo, getStatus, getLastError: () => lastError, load, save,
  listBookings, getBooking, saveBooking, updateBooking,
  listReviews, addReview, addDoc, addCallback,
  models: { Booking, Review, Inquiry, Waitlist, Callback, Subscription, Claim },
};
