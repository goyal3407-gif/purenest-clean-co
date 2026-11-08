import { useMemo, useState } from 'react'
import { api, money, saveBookingLocal } from '../api'
import { EXTRAS, FREQUENCY_LABEL, calcPrice } from '../pricing'

export default function BookingForm({ services, preset, onBooked, t }) {
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '', serviceId: preset?.serviceId || 'deep', date: '', time: '10:00', bedrooms: preset?.bedrooms || 2, bathrooms: preset?.bathrooms || 1, frequency: preset?.frequency || 'one-time', payment: 'cash', notes: '', eco: preset?.eco || false, allergy: preset?.allergy || false, senior: false, reminders: true, group: false })
  const [extras, setExtras] = useState(preset?.extras || [])
  const [coupon, setCoupon] = useState(preset?.coupon || '')
  const [couponMsg, setCouponMsg] = useState('')
  const [msg, setMsg] = useState('')
  const [savedToken, setSavedToken] = useState('')
  const [busy, setBusy] = useState(false)
  const svc = services.find((s) => s.id === form.serviceId) || { name: 'Deep Cleaning', price: 249 }
  // Same pricing logic as the Estimator (pricing.js): base + AED 30/extra bedroom
  // + AED 20/extra bathroom + extras, then frequency discount, FIRST20, senior 10%.
  const calc = useMemo(() => calcPrice(svc.price, { bedrooms: form.bedrooms, bathrooms: form.bathrooms, frequency: form.frequency, extras, coupon, senior: form.senior }), [svc.price, form.bedrooms, form.bathrooms, form.frequency, form.senior, extras, coupon])
  const total = calc.total
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const toggleExtra = (id) => setExtras((x) => (x.includes(id) ? x.filter((e) => e !== id) : [...x, id]))
  const applyCoupon = () => setCouponMsg(coupon.trim().toUpperCase() === 'FIRST20' ? 'FIRST20 applied — 20% off!' : 'That coupon is not valid. Try FIRST20 for 20% off.')
  const today = new Date().toISOString().slice(0, 10)

  const submit = async (e) => {
    e.preventDefault(); setMsg(''); setSavedToken(''); setBusy(true)
    try {
      const data = await api('/api/bookings', { method: 'POST', body: { ...form, total, extras, coupon } })
      // Save ID + token on this device so My Bookings can list it after reload.
      saveBookingLocal(data.booking)
      setSavedToken(data.booking.accessToken || '')
      setMsg(`Booked! Your booking ID is ${data.booking.id}. Save your access token below — you need it to look up or cancel this booking. WhatsApp: ${data.booking.whatsapp_detail}`)
      onBooked && onBooked(data.booking)
    } catch (err) { setMsg(err.message) } finally { setBusy(false) }
  }

  return (
    <section className="section" id="booking">
      <div className="container">
        <p className="eyebrow">Book Your Clean</p>
        <h2>{t?.bookingHeading || 'Book in 2 minutes'}</h2>
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
              <div className="field"><label htmlFor="bk-date">Date</label>
                <input id="bk-date" required type="date" min={today} value={form.date} onChange={(e) => set('date', e.target.value)} />
                <p className="muted" style={{ fontSize: '.85rem', marginTop: 4 }}>Tap the calendar icon, or click the field and type the date (day / month / year).</p>
              </div>
              <div className="field"><label htmlFor="bk-time">Time</label>
                <select id="bk-time" value={form.time} onChange={(e) => set('time', e.target.value)}>
                  <option value="09:00">09:00</option><option value="10:00">10:00</option><option value="12:00">12:00</option><option value="15:00">15:00</option><option value="17:00">17:00</option>
                </select></div>
            </div>
            <div className="field"><label htmlFor="bk-address">Address</label><input id="bk-address" value={form.address} onChange={(e) => set('address', e.target.value)} placeholder="Building, street, area, city" /></div>
            <div className="grid2">
              <div className="field"><label htmlFor="bk-bed">Bedrooms</label><input id="bk-bed" type="number" min="1" max="6" value={form.bedrooms} onChange={(e) => set('bedrooms', +e.target.value || 1)} /></div>
              <div className="field"><label htmlFor="bk-bath">Bathrooms</label><input id="bk-bath" type="number" min="1" max="4" value={form.bathrooms} onChange={(e) => set('bathrooms', +e.target.value || 1)} /></div>
            </div>
            <div className="field"><label htmlFor="bk-freq">Frequency</label>
              <select id="bk-freq" value={form.frequency} onChange={(e) => set('frequency', e.target.value)}>
                {Object.keys(FREQUENCY_LABEL).map((f) => (<option key={f} value={f}>{FREQUENCY_LABEL[f]}</option>))}
              </select></div>
            <label style={{ marginTop: 8 }}>Extras</label>
            {EXTRAS.map((x) => (
              <label key={x.id} className="check-row">
                <input type="checkbox" checked={extras.includes(x.id)} onChange={() => toggleExtra(x.id)} />
                <span>{x.name}</span><span className="amt">+ AED {x.price}</span>
              </label>
            ))}
            <div className="field" style={{ marginTop: 12 }}><label htmlFor="bk-coupon">Coupon code</label>
              <div style={{ display: 'flex', gap: 10 }}>
                <input id="bk-coupon" value={coupon} onChange={(e) => setCoupon(e.target.value)} placeholder="Try FIRST20" />
                <button className="btn ghost" type="button" onClick={applyCoupon}>Apply</button>
              </div>
              {couponMsg && <p className="note" style={{ marginTop: 8 }}>{couponMsg}</p>}
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
            {savedToken && (
              <div className="card" style={{ marginTop: 12, background: 'var(--lime-2)' }}>
                <strong>Your access token — save it!</strong>
                <p style={{ wordBreak: 'break-all', margin: '6px 0' }}><code>{savedToken}</code></p>
                <p className="muted" style={{ fontSize: '.9rem', margin: 0 }}>You need this token (with your booking ID) to look up or cancel the booking in My Bookings. It is also saved on this device.</p>
              </div>
            )}
            <p className="muted" style={{ fontSize: '.9rem', marginTop: 10 }}>Same-day / emergency booking: choose today&apos;s date and we confirm within 15–30 minutes when a team is free.</p>
          </form>
          <div>
            <div className="summary">
              <h3 style={{ marginTop: 0 }}>Booking summary</h3>
              <div className="row"><span>Service</span><strong>{svc.name}</strong></div>
              <div className="row"><span>Date</span><strong>{form.date ? new Date(form.date + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : 'Select a date'}</strong></div>
              <div className="row"><span>Time</span><strong>{form.time}</strong></div>
              <div className="row"><span>Home</span><strong>{form.bedrooms} bed / {form.bathrooms} bath</strong></div>
              <div className="row"><span>{svc.name} ({form.bedrooms} bed / {form.bathrooms} bath)</span><span>AED {calc.base}</span></div>
              <div className="row"><span>Extras</span><span>AED {calc.extrasTotal}</span></div>
              {calc.freqSaved > 0 && <div className="row"><span>Frequency discount</span><span>− AED {calc.freqSaved}</span></div>}
              {calc.couponSaved > 0 && <div className="row"><span>Coupon FIRST20</span><span>− AED {calc.couponSaved}</span></div>}
              {calc.seniorSaved > 0 && <div className="row"><span>Senior discount (10%)</span><span>− AED {calc.seniorSaved}</span></div>}
              <div className="row"><span>Frequency</span><strong>{form.frequency}</strong></div>
              <div className="row"><span>Payment</span><strong>{form.payment}</strong></div>
              <div className="row" style={{ borderTop: '2px solid var(--pine)', marginTop: 6, paddingTop: 12 }}><span><strong>Total</strong></span><span className="price">AED {total}</span></div>
              {calc.saved > 0 && <p><span className="badge">You save AED {calc.saved}</span></p>}
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
