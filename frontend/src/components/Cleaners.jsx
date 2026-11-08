import { Stars } from './Icons'

const TEAM = [
  { initials: 'AK', name: 'Amna K.', role: 'Deep-clean specialist', rating: 5, badge: 'Top Rated', note: 'Dubai all-star — 400+ cleans, pet-friendly.' },
  { initials: 'RP', name: 'Rahul P.', role: 'Move-out & renovation', rating: 5, badge: 'Verified', note: 'Deposit-back specialist, detail-obsessed.' },
  { initials: 'MD', name: 'Maria D.', role: 'Airbnb turnover lead', rating: 5, badge: 'Verified', note: 'Fast turnovers with host photos every stay.' },
]
const ROOMS = ['Living room', 'Kitchen', 'Bathrooms', 'Bedrooms', 'Balcony']
export default function Cleaners() {
  return (
    <section className="section">
      <div className="container">
        <p className="eyebrow">Meet Your Cleaners</p>
        <h2>Trained, verified, background-checked</h2>
        <div className="grid3" style={{ marginTop: 28 }}>
          {TEAM.map((c) => (
            <article key={c.name} className="card">
              <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                <div className="avatar" aria-hidden="true">{c.initials}</div>
                <div><h3 style={{ margin: 0 }}>{c.name}</h3><p style={{ margin: 0 }}>{c.role}</p></div>
              </div>
              <p style={{ marginTop: 12 }}><span className="badge">✓ {c.badge}</span></p>
              <Stars rating={c.rating} />
              <p style={{ marginTop: 8 }}>{c.note}</p>
            </article>
          ))}
        </div>
        <div className="card" style={{ marginTop: 20 }}>
          <h3>Room-by-room tour</h3>
          <p>Every clean follows a room checklist — tick it off with your cleaner on the day.</p>
          <div className="chips">{ROOMS.map((r) => (<span key={r} className="chip">{r}</span>))}</div>
          <p style={{ marginTop: 14 }}>Living room: dust shelves, vacuum sofa, mop floor, wipe switches &amp; remotes. Kitchen: hob, oven front, sink, counters, bins. Bathrooms: descale, mirrors, grout, sanitise.</p>
        </div>
      </div>
    </section>
  )
}
