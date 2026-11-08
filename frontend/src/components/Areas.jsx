import { useState } from 'react'

const AREAS = ['Dubai', 'Abu Dhabi', 'Sharjah', 'Riyadh', 'Jeddah', 'Doha', 'Ajman']
export default function Areas() {
  const [q, setQ] = useState('')
  const [active, setActive] = useState('Dubai')
  const found = AREAS.filter((a) => a.toLowerCase().includes(q.toLowerCase()))
  return (
    <section className="section alt" id="areas">
      <div className="container">
        <p className="eyebrow">Areas Covered</p>
        <h2>We clean across the Gulf</h2>
        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search your city..." aria-label="Search areas" />
          <button className="btn" onClick={() => setActive(found[0] || 'Dubai')}>Search</button>
        </div>
        <div className="chips" style={{ marginTop: 16 }}>
          {found.length ? found.map((a) => (<button key={a} className={`chip ${a === active ? 'active' : ''}`} onClick={() => setActive(a)}>{a}</button>)) : <span>No area matches that search yet — ask us in chat.</span>}
        </div>
        <p style={{ marginTop: 16 }}>Now serving <strong>{active}</strong> — same-day slots, 7 days a week, 8am–8pm.</p>
      </div>
    </section>
  )
}
