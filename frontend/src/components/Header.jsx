import { useState } from 'react'
import { Link } from 'react-router-dom'

const NAV = [
  { href: '#services-section', en: 'Services', hi: 'सेवाएँ', ur: 'خدمات' },
  { href: '#estimator', en: 'Price', hi: 'कीमत', ur: 'قیمت' },
  { href: '#booking', en: 'Book', hi: 'बुक करें', ur: 'بک کریں' },
  { href: '#reviews-section', en: 'Reviews', hi: 'समीक्षाएँ', ur: 'جائزے' },
  { href: '#faq', en: 'FAQ', hi: 'FAQ', ur: 'FAQ' },
]

export default function Header({ lang, setLang, t }) {
  const [open, setOpen] = useState(false)
  return (
    <header className="header">
      <div className="header-in">
        <Link to="/" className="logo" style={{ textDecoration: 'none' }}>PureNest <span>Clean Co.</span></Link>
        <nav className="nav" aria-label="Main">
          {NAV.map((n) => (<a key={n.href} href={n.href}>{n[lang] || n.en}</a>))}
        </nav>
        <div className="header-actions">
          <select className="lang-select" value={lang} onChange={(e) => setLang(e.target.value)} aria-label="Language">
            <option value="en">English</option>
            <option value="hi">हिंदी</option>
            <option value="ur">اردو</option>
          </select>
          <Link className="btn ghost small" to="/admin">Admin Login</Link>
          <a className="btn small" href="#booking">{t.book}</a>
          <button className="hamburger" onClick={() => setOpen(!open)} aria-label="Menu" aria-expanded={open}>☰</button>
        </div>
      </div>
      <nav className={`mobile-nav ${open ? 'open' : ''}`} aria-label="Mobile">
        {NAV.map((n) => (<a key={n.href} href={n.href} onClick={() => setOpen(false)}>{n[lang] || n.en}</a>))}
        <Link to="/admin" onClick={() => setOpen(false)}>Admin Login</Link>
      </nav>
    </header>
  )
}
