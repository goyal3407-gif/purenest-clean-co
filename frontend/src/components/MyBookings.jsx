import { useEffect, useState } from 'react'
import { api, loadSavedBookings, saveBookingLocal, removeSavedBooking } from '../api'
import { Icon, ICONS } from './Icons'

export default function MyBookings({ lastBooking, t }) {
  const [id, setId] = useState('')
  const [token, setToken] = useState('')
  const [bookings, setBookings] = useState([])
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(true)
  const [account, setAccount] = useState(() => localStorage.getItem('purenest-account') || '')

  // Merge a newly booked booking (with its access token) into the saved list.
  useEffect(() => {
    if (lastBooking && lastBooking.id && lastBooking.accessToken) {
      saveBookingLocal(lastBooking)
      setBookings((prev) => (prev.some((b) => b.id === lastBooking.id) ? prev : [lastBooking, ...prev]))
      setToken((t) => t || lastBooking.accessToken)
    }
  }, [lastBooking])

  // On mount (and after reload / fresh tab): read saved booking IDs + tokens
  // from localStorage and fetch each one from the API.
  useEffect(() => {
    let cancelled = false
    const saved = loadSavedBookings()
    if (saved.length) setToken((t) => t || saved[0].accessToken)
    Promise.all(saved.map((s) => api(`/api/bookings/${encodeURIComponent(s.id)}?token=${encodeURIComponent(s.accessToken)}`).then((d) => d.booking).catch(() => null)))
      .then((found) => { if (!cancelled) setBookings(found.filter(Boolean)) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  const lookup = async (e) => {
    e.preventDefault(); setMsg('')
    if (!id.trim()) { setMsg('Enter a booking ID.'); return }
    if (!token.trim()) { setMsg('Enter the access token from your booking confirmation.'); return }
    try {
      const d = await api(`/api/bookings/${encodeURIComponent(id.trim())}?token=${encodeURIComponent(token.trim())}`)
      saveBookingLocal(d.booking)
      setBookings((prev) => (prev.some((b) => b.id === d.booking.id) ? prev : [d.booking, ...prev]))
      setMsg('Booking found and saved on this device.')
    } catch (err) { setMsg(err.message) }
  }
  const cancel = async (b) => {
    try {
      const d = await api(`/api/bookings/${b.id}/cancel`, { method: 'POST', body: { token: b.accessToken || token } })
      setBookings((prev) => prev.map((x) => (x.id === b.id ? d.booking : x)))
      setMsg('Booking cancelled.')
    } catch (err) { setMsg(err.message) }
  }
  const forget = (b) => { removeSavedBooking(b.id); setBookings((prev) => prev.filter((x) => x.id !== b.id)) }
  const saveAccount = (e) => { e.preventDefault(); localStorage.setItem('purenest-account', account); setMsg('Account saved on this device.') }

  return (
    <section className="section alt" id="my-bookings">
      <div className="container">
        <p className="eyebrow">My Bookings</p>
        <h2>{t?.myBookingsHeading || 'Track, manage & rebook'}</h2>
        {loading ? (
          <div className="card"><p>Loading your bookings…</p></div>
        ) : bookings.length === 0 ? (
          <div className="card empty-state">
            <div style={{ margin: '0 auto 12px', width: 64, height: 64, borderRadius: '50%', background: 'var(--lime-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--pine)' }}><Icon d={ICONS.sparkle} size={32} /></div>
            <h3>No booking saved yet</h3>
            <p>Book your first clean above, or look up an existing booking with its ID and access token.</p>
            <a className="btn" href="#booking">Book Your First Clean</a>
          </div>
        ) : (
          bookings.map((booking) => (
            <div className="card" key={booking.id} style={{ marginBottom: 16 }}>
              <h3>{booking.serviceName} — {booking.id}</h3>
              <p><strong>Status:</strong> {booking.status} &nbsp;|&nbsp; <strong>Date:</strong> {booking.date} {booking.time} &nbsp;|&nbsp; <strong>Total:</strong> AED {booking.total}</p>
              <p><strong>WhatsApp:</strong> {booking.whatsapp_detail || booking.whatsapp_status}</p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <a className="btn small" href={`/api/invoice/${booking.id}`} target="_blank" rel="noreferrer">Invoice (PDF / print)</a>
                <a className="btn ghost small" href={`/api/calendar/${booking.id}.ics`}>Add to calendar (.ics)</a>
                {booking.status === 'confirmed' && <button className="btn ghost small" onClick={() => cancel(booking)}>Cancel booking</button>}
                <button className="btn ghost small" onClick={() => forget(booking)}>Remove from this device</button>
              </div>
            </div>
          ))
        )}
        <div className="grid2" style={{ marginTop: 20 }}>
          <form className="card" onSubmit={lookup}>
            <h3>Look up a booking</h3>
            <p className="muted" style={{ fontSize: '.9rem' }}>Enter the booking ID and the access token shown on your confirmation. The token is pre-filled from this device when available.</p>
            <div className="field"><label htmlFor="lk-id">Booking ID</label><input id="lk-id" value={id} onChange={(e) => setId(e.target.value)} placeholder="PN-..." /></div>
            <div className="field"><label htmlFor="lk-token">Access token</label><input id="lk-token" value={token} onChange={(e) => setToken(e.target.value)} placeholder="From your confirmation" /></div>
            <button className="btn" type="submit">Find booking</button>
            {msg && <p className="note" style={{ marginTop: 12 }}>{msg}</p>}
          </form>
          <form className="card" onSubmit={saveAccount}>
            <h3>Customer login</h3>
            <p>Save your email on this device to pre-fill future bookings and earn loyalty points.</p>
            <div className="field"><label htmlFor="acc-email">Email</label><input id="acc-email" type="email" value={account} onChange={(e) => setAccount(e.target.value)} placeholder="you@example.com" /></div>
            <button className="btn" type="submit">Save my account</button>
            <p className="muted" style={{ fontSize: '.9rem', marginTop: 10 }}>Loyalty: every 5th clean is 20% off. Refer a friend and you both get AED 25 off.</p>
          </form>
        </div>
      </div>
    </section>
  )
}
