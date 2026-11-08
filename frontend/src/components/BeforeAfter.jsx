import { useState } from 'react'

export default function BeforeAfter() {
  const [pos, setPos] = useState(50)
  return (
    <section className="section alt">
      <div className="container">
        <p className="eyebrow">Before / After</p>
        <h2>See the PureNest difference</h2>
        <p className="lead">Drag the handle to compare a living room before and after a deep clean.</p>
        <div className="ba" style={{ marginTop: 24 }}>
          <div className="pane before"><span>BEFORE — dusty, cluttered</span></div>
          <div className="pane after" style={{ clipPath: `inset(0 0 0 ${pos}%)` }}><span>AFTER — fresh &amp; spotless</span></div>
          <span className="tag" style={{ left: 14 }}>Before</span>
          <span className="tag" style={{ right: 14 }}>After</span>
          <div className="handle" style={{ left: `calc(${pos}% - 2px)` }} />
          <input type="range" min="0" max="100" value={pos} onChange={(e) => setPos(+e.target.value)} aria-label="Before and after slider" style={{ position: 'absolute', inset: 0, width: '100%', opacity: 0, cursor: 'ew-resize', margin: 0 }} />
        </div>
        <p className="muted" style={{ marginTop: 12 }}>Deep clean of a 2-bed apartment in Dubai Marina — 3 hours, 2 cleaners, eco products.</p>
      </div>
    </section>
  )
}
