// Shared pricing — single source of truth for Estimator and BookingForm.
// Must stay in sync with the server-side calc in server.js (calcBookingTotal).
export const EXTRAS = [
  { id: 'oven', name: 'Inside Oven', price: 49 },
  { id: 'fridge', name: 'Inside Fridge', price: 49 },
  { id: 'windows', name: 'Window Cleaning', price: 59 },
  { id: 'laundry', name: 'Laundry & Ironing', price: 79 },
  { id: 'pet', name: 'Pet Hair Removal', price: 39 },
  { id: 'balcony', name: 'Balcony & Outdoor', price: 39 },
  { id: 'carpet', name: 'Carpet Shampoo', price: 89 },
  { id: 'sofa', name: 'Sofa Cleaning', price: 99 },
]
export const FREQUENCY = { 'one-time': 1, weekly: 0.85, fortnightly: 0.9, monthly: 0.95 }
export const FREQUENCY_LABEL = { 'one-time': 'One-time', weekly: 'Weekly — save 15%', fortnightly: 'Fortnightly — save 10%', monthly: 'Monthly — save 5%' }

// base = service price + AED 30 per extra bedroom (beyond 1) + AED 20 per extra bathroom (beyond 1)
// e.g. Deep Cleaning AED 249, 3 bed / 2 bath => 249 + 60 + 20 = AED 329 before extras/discounts
export function calcPrice(servicePrice, { bedrooms = 2, bathrooms = 1, frequency = 'one-time', extras = [], coupon = '', senior = false } = {}) {
  const bed = Math.max(1, Number(bedrooms) || 1)
  const bath = Math.max(1, Number(bathrooms) || 1)
  const base = Number(servicePrice || 0) + (bed - 1) * 30 + (bath - 1) * 20
  const extrasTotal = EXTRAS.filter((e) => extras.includes(e.id)).reduce((s, e) => s + e.price, 0)
  const freqFactor = FREQUENCY[frequency] || 1
  const sub = (base + extrasTotal) * freqFactor
  const freqSaved = Math.round(base + extrasTotal - sub)
  let total = sub
  let couponSaved = 0
  if (String(coupon || '').trim().toUpperCase() === 'FIRST20') { couponSaved = Math.round(total * 0.2); total -= couponSaved }
  let seniorSaved = 0
  if (senior) { seniorSaved = Math.round(total * 0.1); total -= seniorSaved }
  total = Math.round(total)
  return { base, extrasTotal, freqSaved, couponSaved, seniorSaved, sub: Math.round(sub), total, saved: Math.round(sub - total) }
}
