import { Icon, ICONS } from './Icons'
import { money } from '../api'

const ICON_FOR = { deep: 'sparkle', regular: 'home', move: 'move', reno: 'reno', airbnb: 'bed', office: 'office', pet: 'paw', car: 'car' }

export default function Services({ services, onBook }) {
  return (
    <section className="section" id="services-section">
      <div className="container">
        <p className="eyebrow">Our Services</p>
        <h2>Cleaning for every home, office &amp; stay</h2>
        <p className="lead">All services include trained, background-checked cleaners and our happiness guarantee.</p>
        <div className="grid3" style={{ marginTop: 28 }}>
          {services.map((s) => (
            <article key={s.id} className="card service-card">
              <div className="icon-box"><Icon d={ICONS[ICON_FOR[s.id]] || ICONS.sparkle} /></div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <h3 style={{ margin: 0 }}>{s.name}</h3>
                {s.tag && <span className="badge">{s.tag}</span>}
              </div>
              <p style={{ marginTop: 10 }}>{s.desc}</p>
              <p className="price">{money(s.price, s.unit)}</p>
              <button className="btn" onClick={() => onBook({ serviceId: s.id })}>Book {s.name}</button>
            </article>
          ))}
        </div>
        <div className="grid3" style={{ marginTop: 20 }}>
          <div className="card"><h3>Move-In / Move-Out</h3><p>Landlord-approved checklist with a deposit-back guarantee. Empty-home deep clean, inside cupboards and appliances included.</p></div>
          <div className="card"><h3>Post-Renovation</h3><p>Fine dust, paint and debris removal after renovation — windows, fixtures and floors left spotless.</p></div>
          <div className="card"><h3>Airbnb Turnover</h3><p>Cleaning between guests, linen change, restocking and host photos after every stay.</p></div>
        </div>
      </div>
    </section>
  )
}
