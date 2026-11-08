export async function api(path, opts = {}) {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
    ...opts,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`)
  return data
}
export const fmt = (n) => `AED ${Number(n || 0)}`
export function money(n, unit) {
  return unit ? `AED ${Number(n || 0)} / ${String(unit).replace(/^per\s+/i, '')}` : `AED ${Number(n || 0)}`
}

// ---- Saved bookings (My Bookings) ----
// After a successful booking we store {id, accessToken} here so My Bookings
// can list it again after reload / in a fresh tab.
const SAVED_KEY = 'purenest-bookings'
export function loadSavedBookings() {
  try { const v = JSON.parse(localStorage.getItem(SAVED_KEY) || '[]'); return Array.isArray(v) ? v.filter((x) => x && x.id && x.accessToken) : [] } catch { return [] }
}
export function saveBookingLocal(booking) {
  if (!booking || !booking.id || !booking.accessToken) return loadSavedBookings()
  const list = loadSavedBookings().filter((x) => x.id !== booking.id)
  list.unshift({ id: booking.id, accessToken: booking.accessToken })
  try { localStorage.setItem(SAVED_KEY, JSON.stringify(list.slice(0, 20))) } catch { /* storage unavailable */ }
  return list
}
export function removeSavedBooking(id) {
  const list = loadSavedBookings().filter((x) => x.id !== id)
  try { localStorage.setItem(SAVED_KEY, JSON.stringify(list)) } catch { /* storage unavailable */ }
  return list
}
