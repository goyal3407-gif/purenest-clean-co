import { useMemo, useState } from 'react'
import { Icon, ICONS } from './Icons'
import { money } from '../api'

const ICON_FOR = { deep: 'sparkle', regular: 'home', move: 'move', reno: 'reno', airbnb: 'bed', office: 'office', pet: 'paw', car: 'car' }
const CATEGORIES = [
  { id: 'all', label: 'All services' },
  { id: 'home', label: 'Home' },
  { id: 'move', label: 'Move-in / Move-out' },
  { id: 'special', label: 'Special' },
  { id: 'business', label: 'Business' },
  { id: 'combo', label: 'Combo' },
]

export default function Services({ services, onBook, t }) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return services.filter((s) => {
      if (category !== 'all' && (s.category || 'home') !== category) return false
      if (!q) return true
      return [s.name, s.desc, s.tag].filter(Boolean).join(' ').toLowerCase().includes(q)
    })
  }, [services, query, category])

  return (
    <section className="section" id="services-section">
      <div className="container">
        <p className="eyebrow">Our Services</p>
        <h2>{t?.servicesHeading || 'Cleaning for every home, office & stay'}</h2>
        <p className="lead">All services include trained, background-checked cleaners and our happiness guarantee.</p>
        <div className="card" style={{ marginTop: 24, padding: 16 }}>
          <div className="field" style={{ margin: 0 }}>
            <label htmlFor="svc-search">Search services</label>
            <input id="svc-search" type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Try “deep”, “pet”, “office”… " aria-label="Search services" />
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }} role="group" aria-label="Filter by category">
            {CATEGORIES.map((c) => (
              <button key={c.id} type="button" className={`btn small ${category === c.id ? '' : 'ghost'}`} aria-pressed={category === c.id} onClick={() => setCategory(c.id)}>{c.label}</button>
            ))}
          </div>
          <p className="muted" style={{ margin: '10px 0 0', fontSize: '.9rem' }}>{filtered.length} of {services.length} services{query ? ` matching “${query.trim()}”` : ''}</p>
        </div>
        {filtered.length === 0 ? (
          <div className="card empty-state" style={{ marginTop: 20 }}>
            <h3>No services match that search</h3>
            <p>Try a different word, or clear the filter to see all services.</p>
            <button className="btn" type="button" onClick={() => { setQuery(''); setCategory('all') }}>Show all services</button>
          </div>
        ) : (
          <div className="grid3" style={{ marginTop: 28 }}>
            {filtered.map((s) => (
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
        )}
        <div className="grid3" style={{ marginTop: 20 }}>
          <div className="card"><h3>Move-In / Move-Out</h3><p>Landlord-approved checklist with a deposit-back guarantee. Empty-home deep clean, inside cupboards and appliances included.</p></div>
          <div className="card"><h3>Post-Renovation</h3><p>Fine dust, paint and debris removal after renovation — windows, fixtures and floors left spotless.</p></div>
          <div className="card"><h3>Airbnb Turnover</h3><p>Cleaning between guests, linen change, restocking and host photos after every stay.</p></div>
        </div>
      </div>
    </section>
  )
}
