import { useMemo, useState } from 'react'
import { money } from '../api'
import { EXTRAS, calcPrice } from '../pricing'

export default function Estimator({ services, onBook }) {
  const [serviceId, setServiceId] = useState('deep')
  const [bedrooms, setBedrooms] = useState(2)
  const [bathrooms, setBathrooms] = useState(1)
  const [frequency, setFrequency] = useState('one-time')
  const [extras, setExtras] = useState([])
  const [eco, setEco] = useState(false)
  const [allergy, setAllergy] = useState(false)
  const [coupon, setCoupon] = useState('')
  const [couponMsg, setCouponMsg] = useState('')

  const svc = services.find((s) => s.id === serviceId) || services[0] || { price: 249, name: 'Deep Cleaning' }
  // Single shared pricing logic (see pricing.js) — BookingForm uses the same calc.
  const calc = useMemo(() => calcPrice(svc.price, { bedrooms, bathrooms, frequency, extras, coupon }), [svc, bedrooms, bathrooms, frequency, extras, coupon])

  const toggle = (id) => setExtras((x) => (x.includes(id) ? x.filter((e) => e !== id) : [...x, id]))
  const applyCoupon = () => setCouponMsg(coupon.trim().toUpperCase() === 'FIRST20' ? 'FIRST20 applied — 20% off!' : 'That coupon is not valid. Try FIRST20 for 20% off.')

  return (
    <section className="section alt" id="estimator">
      <div className="container">
        <p className="eyebrow">Instant Price Estimator</p>
        <h2>Your exact price in seconds — no call needed</h2>
        <p className="lead">Pick a service, add extras, and see the price live. Eco-clean and allergy mode are free options.</p>
        <div className="grid2" style={{ marginTop: 24, alignItems: 'start' }}>
          <div className="card">
            <div className="field">
              <label htmlFor="est-service">Service</label>
              <select id="est-service" value={serviceId} onChange={(e) => setServiceId(e.target.value)}>
                {services.map((s) => (<option key={s.id} value={s.id}>{s.name} — {money(s.price, s.unit)}</option>))}
              </select>
            </div>
            <div className="range-row"><label style={{ minWidth: 110, margin: 0 }}>Bedrooms: {bedrooms}</label><input type="range" min="1" max="6" value={bedrooms} onChange={(e) => setBedrooms(+e.target.value)} aria-label="Bedrooms" /></div>
            <div className="range-row"><label style={{ minWidth: 110, margin: 0 }}>Bathrooms: {bathrooms}</label><input type="range" min="1" max="4" value={bathrooms} onChange={(e) => setBathrooms(+e.target.value)} aria-label="Bathrooms" /></div>
            <div className="field">
              <label htmlFor="est-freq">Frequency</label>
              <select id="est-freq" value={frequency} onChange={(e) => setFrequency(e.target.value)}>
                <option value="one-time">One-time</option><option value="weekly">Weekly — save 15%</option>
                <option value="fortnightly">Fortnightly — save 10%</option><option value="monthly">Monthly — save 5%</option>
              </select>
            </div>
            <label style={{ marginTop: 8 }}>Extras</label>
            {EXTRAS.map((e) => (
              <label key={e.id} className="check-row">
                <input type="checkbox" checked={extras.includes(e.id)} onChange={() => toggle(e.id)} />
                <span>{e.name}</span><span className="amt">+ AED {e.price}</span>
              </label>
            ))}
            <label className="check-row"><input type="checkbox" checked={eco} onChange={(e) => setEco(e.target.checked)} /><span>Eco-clean — chemical-free, pet-safe, baby-safe</span></label>
            <label className="check-row"><input type="checkbox" checked={allergy} onChange={(e) => setAllergy(e.target.checked)} /><span>Allergy mode — dust-free anti-allergen clean</span></label>
          </div>
          <div>
            <div className="card">
              <h3>Your price</h3>
              <div className="summary" style={{ border: 'none', background: 'transparent', padding: 0 }}>
                <div className="row"><span>{svc.name} ({bedrooms} bed / {bathrooms} bath)</span><span>AED {calc.base}</span></div>
                <div className="row"><span>Extras</span><span>AED {calc.extrasTotal}</span></div>
                <div className="row"><span>Frequency discount</span><span>{frequency === 'one-time' ? '—' : `-${Math.round((1 - FREQUENCY[frequency]) * 100)}%`}</span></div>
              </div>
              <div className="total-line"><span><strong>Total</strong></span><span className="price">AED {calc.total}</span></div>
              {calc.saved > 0 && <p><span className="badge">You save AED {calc.saved}</span></p>}
              <p className="muted">Carbon footprint: ~{Math.max(1, Math.round(calc.total / 60))} kg CO₂ — we offset every clean with eco products.</p>
              <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                <input placeholder="Coupon code (try FIRST20)" value={coupon} onChange={(e) => setCoupon(e.target.value)} aria-label="Coupon code" />
                <button className="btn ghost" type="button" onClick={applyCoupon}>Apply</button>
              </div>
              {couponMsg && <p className="note" style={{ marginTop: 10 }}>{couponMsg}</p>}
              <button className="btn" style={{ width: '100%', marginTop: 16 }} onClick={() => onBook({ serviceId, bedrooms, bathrooms, frequency, extras, total: calc.total, coupon, eco, allergy })}>Book this clean — AED {calc.total}</button>
            </div>
            <div className="card" style={{ marginTop: 20 }}>
              <h3>Live price comparison</h3>
              <p>Same deep clean elsewhere in Dubai: <strong>AED 299–399</strong>. PureNest: <strong>AED {calc.total}</strong> — same trained team, insured and background-checked.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
