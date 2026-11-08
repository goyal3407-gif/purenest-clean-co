export default function Hero({ t }) {
  return (
    <section className="hero">
      <div className="container hero-grid">
        <div>
          <p className="badge" style={{ marginBottom: 16 }}>Trusted • Insured • Background-checked</p>
          <h1>{t.heroTitle}</h1>
          <p className="lead">{t.heroSub}</p>
          <div className="hero-pills">
            <span className="pill"><span style={{ color: '#E9A426' }}>★</span> 4.9 rating</span>
            <span className="pill">500+ homes cleaned</span>
            <span className="pill">Same-day available</span>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <a className="btn lime" href="#booking">{t.book}</a>
            <a className="btn" style={{ background: 'transparent', borderColor: '#fff', color: '#fff' }} href="#estimator">Get Instant Price</a>
          </div>
        </div>
        <div className="hero-visual">
          <div className="visual-art" aria-hidden="true">✦</div>
          <div className="overlay-card">
            <strong>Deep Cleaning — AED 249 / home</strong>
            <p style={{ margin: '6px 0 0' }}>Kitchen, bathrooms, floors &amp; sanitising. Book in under 2 minutes — no call needed.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
