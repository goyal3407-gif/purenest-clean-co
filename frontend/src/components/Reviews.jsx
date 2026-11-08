import { useEffect, useState } from 'react'
import { api } from '../api'
import { Stars } from './Icons'

// Fallback matches the server seed data exactly (Sara K. is a 5-star review).
const FALLBACK = [
  { name: 'Aisha M.', rating: 5, text: 'Deep clean was perfect — kitchen and bathrooms looked brand new.', service: 'Deep Cleaning' },
  { name: 'Rahul S.', rating: 5, text: 'On time, polite team, great price. Booked weekly now.', service: 'Regular Home Cleaning' },
  { name: 'Sara K.', rating: 5, text: 'Airbnb turnover was fast and the photos helped a lot.', service: 'Airbnb Turnover' },
]

export default function Reviews() {
  const [reviews, setReviews] = useState(FALLBACK)
  const [form, setForm] = useState({ name: '', rating: 5, text: '', service: '' })
  const [msg, setMsg] = useState('')
  useEffect(() => { api('/api/reviews').then((d) => { if (d.reviews?.length) setReviews(d.reviews) }).catch(() => {}) }, [])
  const submit = async (e) => {
    e.preventDefault()
    try { await api('/api/reviews', { method: 'POST', body: form }); setReviews((r) => [...r, form]); setMsg('Thanks! Your review is live.'); setForm({ name: '', rating: 5, text: '', service: '' }) }
    catch (err) { setMsg(err.message) }
  }
  return (
    <section className="section" id="reviews-section">
      <div className="container">
        <p className="eyebrow">Reviews</p>
        <h2>What Customers Say</h2>
        <div className="grid3" style={{ marginTop: 28 }}>
          {reviews.map((r, i) => (
            <article key={i} className="card">
              <Stars rating={r.rating} />
              <p style={{ marginTop: 10 }}>{r.text}</p>
              <p><strong>{r.name}</strong> — {r.service}</p>
            </article>
          ))}
        </div>
        <form className="card" style={{ marginTop: 20 }} onSubmit={submit}>
          <h3>Leave a review</h3>
          <div className="grid2">
            <div className="field"><label htmlFor="rv-name">Name</label><input id="rv-name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" /></div>
            <div className="field"><label htmlFor="rv-rating">Rating</label>
              <select id="rv-rating" value={form.rating} onChange={(e) => setForm({ ...form, rating: +e.target.value })}>
                {[5, 4, 3, 2, 1].map((n) => (<option key={n} value={n}>{n} star{n > 1 ? 's' : ''}</option>))}
              </select></div>
          </div>
          <div className="field"><label htmlFor="rv-text">Your review</label><textarea id="rv-text" required rows="3" value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} placeholder="How was your clean?" /></div>
          <button className="btn" type="submit">Post review</button>
          {msg && <p className="note" style={{ marginTop: 12 }}>{msg}</p>}
          <p className="muted" style={{ fontSize: '.9rem', marginTop: 10 }}>Film a 30-second feedback video after your clean and get AED 25 off your next booking.</p>
        </form>
      </div>
    </section>
  )
}
