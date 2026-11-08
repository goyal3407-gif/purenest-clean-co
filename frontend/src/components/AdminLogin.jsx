import { useState } from 'react'
import { api } from '../api'

export default function AdminLogin() {
  const [password, setPassword] = useState('')
  const [token, setToken] = useState(() => sessionStorage.getItem('purenest-admin') || '')
  const [stats, setStats] = useState(null)
  const [bookings, setBookings] = useState([])
  const [msg, setMsg] = useState('')
  const [staffCode, setStaffCode] = useState('')
  const [jobs, setJobs] = useState([])

  const auth = (t) => ({ headers: { Authorization: `Bearer ${t}` } })
  const load = async (t) => {
    const s = await api('/api/admin/stats', auth(t)); setStats(s.stats)
    const b = await api('/api/admin/bookings', auth(t)); setBookings(b.bookings)
  }
  const login = async (e) => {
    e.preventDefault(); setMsg('')
    try {
      const d = await api('/api/admin/login', { method: 'POST', body: { password } })
      setToken(d.token); sessionStorage.setItem('purenest-admin', d.token); await load(d.token)
    } catch (err) { setMsg(err.message) }
  }
  const logout = async () => {
    await api('/api/admin/logout', { method: 'POST', body: { token } }).catch(() => {})
    setToken(''); setStats(null); setBookings([]); sessionStorage.removeItem('purenest-admin')
  }
  const setStatus = async (id, status) => {
    const d = await api(`/api/admin/bookings/${id}/status`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: { status } })
    setBookings((bs) => bs.map((b) => (b.id === id ? d.booking : b)))
  }
  const resend = async (id) => {
    const d = await api(`/api/bookings/${id}/resend-whatsapp`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } })
    setBookings((bs) => bs.map((b) => (b.id === id ? d.booking : b))); setMsg(`WhatsApp resend: ${d.booking.whatsapp_detail}`)
  }
  const staffJobs = async (e) => {
    e.preventDefault()
    try { const d = await api('/api/staff/jobs', { method: 'POST', body: { code: staffCode } }); setJobs(d.jobs) }
    catch (err) { setMsg(err.message) }
  }

  if (!token) {
    return (
      <section className="section">
        <div className="container" style={{ maxWidth: 520 }}>
          <div className="card" style={{ textAlign: 'center', padding: 36 }}>
            <h2>Admin Login</h2>
            <p>Admin access only. Set <code>ADMIN_PASSWORD</code> in the environment to enable login.</p>
            <form onSubmit={login}>
              <div className="field" style={{ textAlign: 'left' }}><label htmlFor="adm-pass">Admin password</label><input id="adm-pass" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
              <button className="btn" type="submit" style={{ width: '100%' }}>Log In</button>
            </form>
            {msg && <p className="note" style={{ marginTop: 12 }}>{msg}</p>}
          </div>
          <form className="card" style={{ marginTop: 20 }} onSubmit={staffJobs}>
            <h3>Staff view</h3>
            <p>Cleaners: enter your staff code to see today&apos;s confirmed jobs.</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <input value={staffCode} onChange={(e) => setStaffCode(e.target.value)} placeholder="Staff code" aria-label="Staff code" />
              <button className="btn" type="submit">View jobs</button>
            </div>
            {jobs.length > 0 && <ul style={{ marginTop: 12 }}>{jobs.map((j) => (<li key={j.id}>{j.id} — {j.serviceName} — {j.date} {j.time} — {j.address}</li>))}</ul>}
          </form>
        </div>
      </section>
    )
  }
  return (
    <section className="section">
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <h2>Admin Dashboard</h2>
          <button className="btn ghost" onClick={logout}>Log out</button>
        </div>
        {stats && (
          <div className="admin-grid">
            <div className="stat"><span>Bookings</span><b>{stats.bookings}</b></div>
            <div className="stat"><span>Revenue (AED)</span><b>{stats.revenue}</b></div>
            <div className="stat"><span>Reviews</span><b>{stats.reviews}</b></div>
            <div className="stat"><span>Avg rating</span><b>{stats.avgRating}</b></div>
          </div>
        )}
        {msg && <p className="note">{msg}</p>}
        <div className="card">
          <h3>Bookings</h3>
          {bookings.length === 0 ? <p>No bookings yet.</p> : (
            <div style={{ overflowX: 'auto' }}>
              <table className="table"><thead><tr><th>ID</th><th>Customer</th><th>Service</th><th>Date</th><th>Total</th><th>Status</th><th>WhatsApp</th><th>Actions</th></tr></thead>
              <tbody>{bookings.map((b) => (
                <tr key={b.id}><td>{b.id}</td><td>{b.name}<br />{b.phone}</td><td>{b.serviceName}</td><td>{b.date} {b.time}</td><td>AED {b.total}</td><td>{b.status}</td><td>{b.whatsapp_status}</td>
                <td>
                  <select value={b.status} onChange={(e) => setStatus(b.id, e.target.value)} aria-label="Booking status" style={{ width: 'auto', padding: '6px 8px' }}>
                    <option value="confirmed">confirmed</option><option value="assigned">assigned</option><option value="completed">completed</option><option value="cancelled">cancelled</option>
                  </select>
                  <button className="btn ghost small" style={{ marginTop: 6 }} onClick={() => resend(b.id)}>Resend WhatsApp</button>
                </td></tr>
              ))}</tbody></table>
            </div>
          )}
          <p className="muted" style={{ marginTop: 14 }}>WhatsApp auto-send settings (Phone Number ID + Access Token) are set in environment variables — see ATLAS_SETUP.md / .env.example. Cleaner assignment: set a booking to “assigned” above once a cleaner is chosen.</p>
        </div>
      </div>
    </section>
  )
}
