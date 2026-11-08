import { useState } from 'react'

const STEPS = ['Booked', 'Team assigned', 'Cleaner on the way', 'Cleaning in progress', 'Done — score ready']
export default function Tracking() {
  const [step, setStep] = useState(2)
  const [query, setQuery] = useState('')
  const [msg, setMsg] = useState('')
  const track = (e) => { e.preventDefault(); setMsg(query.trim() ? `Live status for ${query.trim()}: ${STEPS[step]}. ETA 25 minutes.` : 'Enter a booking ID or email first.') }
  return (
    <section className="section">
      <div className="container">
        <p className="eyebrow">Live Booking Tracking</p>
        <h2>Where is my cleaner?</h2>
        <div className="card">
          <form onSubmit={track} style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <input style={{ flex: 1, minWidth: 220 }} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Enter booking ID or email" aria-label="Booking ID or email" />
            <button className="btn" type="submit">Track</button>
          </form>
          {msg && <p className="note" style={{ marginTop: 14 }}>{msg}</p>}
          <div className="stepper">
            {STEPS.map((s, i) => (<div key={s} className={`step ${i <= step ? 'done' : ''}`}>{s}</div>))}
          </div>
          <p className="muted">Demo: use the step buttons to preview the tracker. Real bookings update automatically as the team moves.</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {STEPS.map((s, i) => (<button key={s} className={`chip ${i === step ? 'active' : ''}`} onClick={() => setStep(i)}>Step {i + 1}</button>))}
          </div>
        </div>
      </div>
    </section>
  )
}
