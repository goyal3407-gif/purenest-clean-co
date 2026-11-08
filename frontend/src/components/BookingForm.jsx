import { useState } from 'react'
import { api, money } from '../api'

export default function BookingForm({ services, preset, onBooked }) {
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '', serviceId: preset?.serviceId || 'deep', date: '', time: '10:00', bedrooms: preset?.bedrooms || 2, bathrooms: preset?.bathrooms || 1, frequency: preset?.frequency || 'one-time', payment: 'cash', notes: '', eco: preset?.eco || false, allergy: preset?.allergy || false, senior: false, reminders: true, group: false })
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)
  const svc = services.find((s) => s.id === form.serviceId) || { name: 'Deep Cleaning', price: 249 }
  const total = (preset?.total && form.serviceId === preset.serviceId) ? preset.total : svc.price
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const submit = async (e) => {
    e.preventDefault(); setMsg(''); setBusy(true)
    try {
      const data = await api('/api/bookings', { method: 'POST', body: { ...form, total, extras: preset?.extras || [] } })
      setMsg(`Booked! Your booking ID is ${data.booking.id}. WhatsApp: ${data.booking.whatsapp_detail}`)
      onBooked && onBooked(data.booking)
    } catch (err) { setMsg(err.message) } finally { setBusy(false) }
  }

  return (
    <section className="section" id="booking">
      <div className="container">
        <p className="eyebrow">Book Your Clean</p>
        <h2>Book in 2 minutes</h2>
        <div className="grid2" style={{ alignItems: 'start' }}>
          <form className="card" onSubmit={submit}>
            <div className="grid2">
              <div className="field"><label htmlFor="bk-service">Service</label>
                <select id="bk-service" value={form.serviceId} onChange={(e) => set('serviceId', e.target.value)}>
                  {services.map((s) => (<option key={s.id} value={s.id}>{s.name} — {money(s.price, s.unit)}</option>))}
                </select></div>
              <div className="field"><label htmlFor="bk-name">Your name</label><input id="bk-name" required value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Full name" /></div>
              <div className="field"><label htmlFor="bk-phone">Phone / WhatsApp</label><input id="bk-phone" required type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+971 ..." /></div>
              <div className="field"><label htmlFor="bk-email">Email</label><input id="bk-email" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="you@example.com" /></div>
              <div className="field"><label htmlFor="bk-date">Date</label><input id="bk-date" required type="date" value={form.date} onChange={(e) => set('date', e.target.value)} /></div>
              <div className="field"><label htmlFor="bk-time">Time</label>
                <select id="bk-time" value={form.time} onChange={(e) => set('time', e.target.value)}>
                  <option value="09:00">09:00</option><option value="10:00">10:00</option><option value="12:00">12:00</option><option value="15:00">15:00</option><option value="17:00">17:00</option>
                </select></div>
            </div>
            <div className="field"><label htmlFor="bk-address">Address</label><input id="bk-address" value={form.address} onChange={(e) => set('address', e.target.value)} placeholder="Building, street, area, city" /></div>
            <div className="grid2">
              <div className="field"><label htmlFor="bk-bed">Bedrooms</label><input id="bk-bed" type="number" min="1" max="6" value={form.bedrooms} onChange={(e) => set('bedrooms', +e.target.value)} /></div>
              <div className="field"><label htmlFor="bk-bath">Bathrooms</label><input id="bk-bath" type="number" min="1" max="4" value={form.bathrooms} onChange={(e) => set('bathrooms', +e.target.value)} /></div>
            </div>
            <div className="field"><label htmlFor="bk-pay">Payment</label>
              <select id="bk-pay" value={form.payment} onChange={(e) => set('payment', e.target.value)}>
                <option value="cash">Cash after clean</option><option value="card">Card (link sent after booking)</option><option value="upi">UPI (link sent after booking)</option>
              </select>
              <p className="muted" style={{ fontSize: '.9rem', marginTop: 6 }}>Online payment is a recorded choice — our team sends a secure payment link. No card details are taken here.</p>
            </div>
            <label className="check-row"><input type="checkbox" checked={form.eco} onChange={(e) => set('eco', e.target.checked)} /><span>Eco-clean (chemical-free, pet-safe)</span></label>
            <label className="check-row"><input type="checkbox" checked={form.allergy} onChange={(e) => set('allergy', e.target.checked)} /><span>Allergy mode</span></label>
            <label className="check-row"><input type="checkbox" checked={form.senior} onChange={(e) => set('senior', e.target.checked)} /><span>Senior citizen discount (10% off)</span></label>
            <label className="check-row"><input type="checkbox" checked={form.group} onChange={(e) => set('group', e.target.checked)} /><span>Group booking — clean with neighbours &amp; save</span></label>
            <label className="check-row"><input type="checkbox" checked={form.reminders} onChange={(e) => set('reminders', e.target.checked)} /><span>SMS + email reminders before the visit</span></label>
            <div className="field" style={{ marginTop: 12 }}><label htmlFor="bk-notes">Notes</label><textarea id="bk-notes" rows="3" value={form.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Gate code, pets, priorities..." /></div>
            <button className="btn" type="submit" disabled={busy} style={{ width: '100%' }}>{busy ? 'Booking...' : `Confirm Booking — AED ${total}`}</button>
            {msg && <p className="note" style={{ marginTop: 12 }}>{msg}</p>}
            <p className="muted" style={{ fontSize: '.9rem', marginTop: 10 }}>Same-day / emergency booking: choose today&apos;s date and we confirm within 15–30 minutes when a team is free.</p>
          </form>
          <div>
            <div className="summary">
              <h3 style={{ marginTop: 0 }}>Booking summary</h3>
              <div className="row"><span>Service</span><strong>{svc.name}</strong></div>
              <div className="row"><span>Date</span><strong>{form.date ? new Date(form.date + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : 'Select a date'}</strong></div>
              <div className="row"><span>Time</span><strong>{form.time}</strong></div>
              <div className="row"><span>Home</span><strong>{form.bedrooms} bed / {form.bathrooms} bath</strong></div>
              <div className="row"><span>Frequency</span><strong>{form.frequency}</strong></div>
              <div className="row"><span>Payment</span><strong>{form.payment}</strong></div>
              <div className="row" style={{ borderTop: '2px solid var(--pine)', marginTop: 6, paddingTop: 12 }}><span><strong>Total</strong></span><span className="price">AED {total}</span></div>
            </div>
            <div className="card" style={{ marginTop: 20 }}>
              <h3>Trust badges</h3>
              <p>✓ Insured up to AED 10,000 &nbsp; ✓ Background-checked team &nbsp; ✓ Happiness guarantee — we re-clean free within 24h</p>
              <p className="muted">Need a video-call quote? Book a free 10-minute video call from the callback form below and we quote on the spot.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
