import { useState } from 'react'
import { api } from '../api'
import { Icon, ICONS } from './Icons'

export default function MyBookings({ lastBooking }) {
  const [id, setId] = useState('')
  const [token, setToken] = useState('')
  const [booking, setBooking] = useState(lastBooking || null)
  const [msg, setMsg] = useState('')
  const [account, setAccount] = useState(() => localStorage.getItem('purenest-account') || '')

  const lookup = async (e) => {
    e.preventDefault(); setMsg('')
    try { const d = await api(`/api/bookings/${encodeURIComponent(id)}?token=${encodeURIComponent(token)}`); setBooking(d.booking) }
    catch (err) { setMsg(err.message) }
  }
  const cancel = async () => {
    try { const d = await api(`/api/bookings/${booking.id}/cancel`, { method: 'POST', body: { token: booking.accessToken || token } }); setBooking(d.booking); setMsg('Booking cancelled.') }
    catch (err) { setMsg(err.message) }
  }
  const saveAccount = (e) => { e.preventDefault(); localStorage.setItem('purenest-account', account); setMsg('Account saved on this device.') }

  return (
    <section className="section alt" id="my-bookings">
      <div className="container">
        <p className="eyebrow">My Bookings</p>
        <h2>Track, manage &amp; rebook</h2>
        {!booking ? (
          <div className="card empty-state">
            <div style={{ margin: '0 auto 12px', width: 64, height: 64, borderRadius: '50%', background: 'var(--lime-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--pine)' }}><Icon d={ICONS.sparkle} size={32} /></div>
            <h3>No booking saved yet</h3>
            <p>Book your first clean above, or look up an existing booking with its ID and access token.</p>
            <a className="btn" href="#booking">Book Your First Clean</a>
          </div>
        ) : (
          <div className="card">
            <h3>{booking.serviceName} — {booking.id}</h3>
            <p><strong>Status:</strong> {booking.status} &nbsp;|&nbsp; <strong>Date:</strong> {booking.date} {booking.time} &nbsp;|&nbsp; <strong>Total:</strong> AED {booking.total}</p>
            <p><strong>WhatsApp:</strong> {booking.whatsapp_detail || booking.whatsapp_status}</p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <a className="btn small" href={`/api/invoice/${booking.id}`} target="_blank" rel="noreferrer">Invoice (PDF / print)</a>
              <a className="btn ghost small" href={`/api/calendar/${booking.id}.ics`}>Add to calendar (.ics)</a>
              {booking.status === 'confirmed' && <button className="btn ghost small" onClick={cancel}>Cancel booking</button>}
            </div>
          </div>
        )}
        <div className="grid2" style={{ marginTop: 20 }}>
          <form className="card" onSubmit={lookup}>
            <h3>Look up a booking</h3>
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
