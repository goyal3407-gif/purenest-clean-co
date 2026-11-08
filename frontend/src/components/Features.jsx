import { useState } from 'react'
import { api } from '../api'

export function AiPlan() {
  const [q, setQ] = useState({ bedrooms: 2, bathrooms: 1, homeType: 'apartment', pets: false, allergy: false, eco: false, frequency: 'weekly', budget: 'standard' })
  const [plan, setPlan] = useState([])
  const [score, setScore] = useState(null)
  const run = async (e) => {
    e.preventDefault()
    const d = await api('/api/ai-plan', { method: 'POST', body: q }); setPlan(d.plan)
    const s = Math.max(5, 100 - (q.pets ? 15 : 0) - (q.bedrooms * 4) - (q.allergy ? 0 : 5))
    setScore(s)
  }
  return (
    <section className="section" id="ai-plan">
      <div className="container">
        <p className="eyebrow">AI Cleaning Plan</p>
        <h2>Your home, your plan — in 5 questions</h2>
        <div className="grid2" style={{ alignItems: 'start' }}>
          <form className="card" onSubmit={run}>
            <div className="grid2">
              <div className="field"><label htmlFor="ai-bed">Bedrooms</label><input id="ai-bed" type="number" min="1" max="6" value={q.bedrooms} onChange={(e) => setQ({ ...q, bedrooms: +e.target.value })} /></div>
              <div className="field"><label htmlFor="ai-bath">Bathrooms</label><input id="ai-bath" type="number" min="1" max="4" value={q.bathrooms} onChange={(e) => setQ({ ...q, bathrooms: +e.target.value })} /></div>
            </div>
            <div className="field"><label htmlFor="ai-type">Home type</label>
              <select id="ai-type" value={q.homeType} onChange={(e) => setQ({ ...q, homeType: e.target.value })}>
                <option value="apartment">Apartment</option><option value="villa">Villa</option><option value="office">Office</option>
              </select></div>
            <label className="check-row"><input type="checkbox" checked={q.pets} onChange={(e) => setQ({ ...q, pets: e.target.checked })} /><span>I have pets</span></label>
            <label className="check-row"><input type="checkbox" checked={q.allergy} onChange={(e) => setQ({ ...q, allergy: e.target.checked })} /><span>Someone has allergies</span></label>
            <label className="check-row"><input type="checkbox" checked={q.eco} onChange={(e) => setQ({ ...q, eco: e.target.checked })} /><span>Eco products only</span></label>
            <div className="field" style={{ marginTop: 12 }}><label htmlFor="ai-freq">Frequency</label>
              <select id="ai-freq" value={q.frequency} onChange={(e) => setQ({ ...q, frequency: e.target.value })}>
                <option value="weekly">Weekly</option><option value="fortnightly">Fortnightly</option><option value="monthly">Monthly</option>
              </select></div>
            <button className="btn" type="submit" style={{ width: '100%' }}>Build my AI plan</button>
          </form>
          <div className="card">
            <h3>Your cleaning score</h3>
            {score === null ? <p>Answer the 5 questions and we will estimate your home&apos;s cleaning score and build your plan.</p> : (
              <>
                <p className="price" style={{ fontSize: '2rem' }}>{score}% clean</p>
                <div style={{ background: 'var(--sage)', borderRadius: 999, height: 14, overflow: 'hidden' }}>
                  <div style={{ width: `${score}%`, height: '100%', background: 'var(--pine)' }} />
                </div>
                <p className="muted" style={{ marginTop: 10 }}>Potential: dust level, kitchen grease and bathroom limescale are the biggest gains. A deep clean first, then regular visits, keeps the score above 90%.</p>
              </>
            )}
            {plan.length > 0 && (<><h3 style={{ marginTop: 20 }}>Your plan</h3><ul>{plan.map((p, i) => (<li key={i}>{p}</li>))}</ul></>)}
          </div>
        </div>
      </div>
    </section>
  )
}

export function ContactForms() {
  const [cb, setCb] = useState({ name: '', phone: '', message: '' })
  const [wl, setWl] = useState({ name: '', email: '', area: '' })
  const [claim, setClaim] = useState({ name: '', bookingId: '', details: '' })
  const [msg, setMsg] = useState('')
  const send = async (e, path, body, done) => {
    e.preventDefault()
    try { const d = await api(path, { method: 'POST', body }); setMsg(d.message || 'Thanks!'); done() }
    catch (err) { setMsg(err.message) }
  }
  return (
    <section className="section alt" id="contact">
      <div className="container">
        <p className="eyebrow">Contact &amp; More</p>
        <h2>Callback, waitlist &amp; claims</h2>
        <div className="grid3" style={{ marginTop: 28 }}>
          <form className="card" onSubmit={(e) => send(e, '/api/inquiries', { ...cb, kind: 'callback' }, () => setCb({ name: '', phone: '', message: '' }))}>
            <h3>Request a callback</h3>
            <p>Want a free video-call quote? Leave your number — we call back within 30 minutes, 8am–8pm.</p>
            <div className="field"><label htmlFor="cb-name">Name</label><input id="cb-name" required value={cb.name} onChange={(e) => setCb({ ...cb, name: e.target.value })} /></div>
            <div className="field"><label htmlFor="cb-phone">Phone</label><input id="cb-phone" required value={cb.phone} onChange={(e) => setCb({ ...cb, phone: e.target.value })} /></div>
            <div className="field"><label htmlFor="cb-msg">Message</label><textarea id="cb-msg" rows="2" value={cb.message} onChange={(e) => setCb({ ...cb, message: e.target.value })} placeholder="Video-call quote, or anything else" /></div>
            <button className="btn" type="submit" style={{ width: '100%' }}>Call me back</button>
          </form>
          <form className="card" onSubmit={(e) => send(e, '/api/waitlist', wl, () => setWl({ name: '', email: '', area: '' }))}>
            <h3>Join the waitlist</h3>
            <p>Same-day slots fill fast. Join the waitlist and we notify you first when a slot opens in your area.</p>
            <div className="field"><label htmlFor="wl-name">Name</label><input id="wl-name" required value={wl.name} onChange={(e) => setWl({ ...wl, name: e.target.value })} /></div>
            <div className="field"><label htmlFor="wl-email">Email</label><input id="wl-email" required type="email" value={wl.email} onChange={(e) => setWl({ ...wl, email: e.target.value })} /></div>
            <div className="field"><label htmlFor="wl-area">Area</label><input id="wl-area" value={wl.area} onChange={(e) => setWl({ ...wl, area: e.target.value })} placeholder="e.g. Dubai Marina" /></div>
            <button className="btn" type="submit" style={{ width: '100%' }}>Join waitlist</button>
          </form>
          <form className="card" onSubmit={(e) => send(e, '/api/claims', claim, () => setClaim({ name: '', bookingId: '', details: '' }))}>
            <h3>Damage / insurance claim</h3>
            <p>Something damaged during a clean? File a claim — insured up to AED 10,000, answered within 24 hours.</p>
            <div className="field"><label htmlFor="cl-name">Name</label><input id="cl-name" required value={claim.name} onChange={(e) => setClaim({ ...claim, name: e.target.value })} /></div>
            <div className="field"><label htmlFor="cl-id">Booking ID</label><input id="cl-id" value={claim.bookingId} onChange={(e) => setClaim({ ...claim, bookingId: e.target.value })} placeholder="PN-..." /></div>
            <div className="field"><label htmlFor="cl-details">What happened?</label><textarea id="cl-details" rows="2" required value={claim.details} onChange={(e) => setClaim({ ...claim, details: e.target.value })} /></div>
            <button className="btn" type="submit" style={{ width: '100%' }}>File claim</button>
          </form>
        </div>
        {msg && <p className="note" style={{ marginTop: 16 }}>{msg}</p>}
      </div>
    </section>
  )
}
