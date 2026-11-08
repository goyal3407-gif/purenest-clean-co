import { useState } from 'react'
import { api } from '../api'

const PLANS = [
  { name: 'One-time', price: 249, per: 'per clean', note: 'Deep clean, no commitment.', features: ['Top-to-bottom clean', 'Eco products', 'Happiness guarantee'] },
  { name: 'Weekly', price: 119, per: 'per visit', note: 'Our most popular plan — save 20%.', features: ['Regular clean every week', 'Same cleaner each time', 'Priority same-day slots', 'Free reschedule'], featured: true },
  { name: 'Monthly', price: 179, per: 'per visit', note: 'A deep clean every month.', features: ['Monthly deep clean', 'Fridge & oven twice a year', 'Loyalty points'] },
]
export default function Pricing() {
  const [email, setEmail] = useState('')
  const [msg, setMsg] = useState('')
  const subscribe = async (plan) => {
    try { const d = await api('/api/subscriptions', { method: 'POST', body: { plan, email: email || 'guest@purenest.local' } }); setMsg(d.message) }
    catch (err) { setMsg(err.message) }
  }
  return (
    <section className="section alt" id="pricing">
      <div className="container">
        <p className="eyebrow">Pricing &amp; Subscriptions</p>
        <h2>Simple plans, no hidden fees</h2>
        <p className="lead">Seasonal packages: Ramadan deep-clean special and summer move-out bundle — ask in chat for this month&apos;s offer.</p>
        <div className="grid3" style={{ marginTop: 28 }}>
          {PLANS.map((p) => (
            <article key={p.name} className="card" style={p.featured ? { border: '2px solid var(--pine)', background: 'var(--lime-2)' } : {}}>
              {p.featured && <span className="badge pine">Most Popular</span>}
              <h3 style={{ marginTop: 10 }}>{p.name}</h3>
              <p className="price">From AED {p.price} <small>/ {p.per}</small></p>
              <p>{p.note}</p>
              <ul>{p.features.map((f) => (<li key={f}>{f}</li>))}</ul>
              <button className="btn" style={{ width: '100%' }} onClick={() => subscribe(p.name)}>Start {p.name} plan</button>
            </article>
          ))}
        </div>
        <div className="card" style={{ marginTop: 20 }}>
          <h3>Start a subscription</h3>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <input style={{ flex: 1, minWidth: 220 }} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email for the subscription" aria-label="Email for subscription" />
            <button className="btn" onClick={() => subscribe('Weekly')}>Subscribe — Weekly</button>
          </div>
          {msg && <p className="note" style={{ marginTop: 12 }}>{msg}</p>}
          <p className="muted" style={{ marginTop: 10 }}>Pause or cancel anytime from My Bookings. Smart-home owners: connect Alexa / Google Home to book by voice — “Hey Google, book PureNest for Friday.”</p>
        </div>
      </div>
    </section>
  )
}
