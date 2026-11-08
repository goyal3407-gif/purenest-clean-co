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
  total: Number, payment: String, status: { type: String, default: 'confirmed' }, notes: String,
  eco: Boolean, allergy: Boolean, senior: Boolean,
  whatsapp_status: String, whatsapp_detail: String, whatsapp_message_id: String,
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
async function connect() {
  const uri = process.env.MONGODB_URI;
  if (!uri) { console.log('MongoDB: MONGODB_URI not set — using local JSON storage in data/'); return false; }
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
    mongoReady = true;
    console.log('MongoDB: connected to Atlas (MONGODB_URI)');
    return true;
  } catch (e) {
    mongoReady = false;
    console.log('MongoDB: connection failed, falling back to local JSON storage:', e.message);
    return false;
  }
}
function isMongo() { return mongoReady && mongoose.connection.readyState === 1; }

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
async function listReviews(fallback) {
  if (isMongo()) { const r = await Review.find({}).lean(); return r.length ? r.map(strip) : fallback; }
  return load('reviews.json', fallback);
}
async function addReview(review) {
  if (isMongo()) { await Review.create(review); return; }
  const all = load('reviews.json', []); all.push(review); save('reviews.json', all);
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
  connect, isMongo, load, save,
  listBookings, getBooking, saveBooking, updateBooking,
  listReviews, addReview, addDoc, addCallback,
  models: { Booking, Review, Inquiry, Waitlist, Callback, Subscription, Claim },
};
