const STEPS = [
  { n: 1, title: 'Get your price', text: 'Use the estimator — your exact price in seconds, free, no call needed.' },
  { n: 2, title: 'Book in 2 minutes', text: 'Pick a service, date and time. Pay by card, UPI or cash after the clean.' },
  { n: 3, title: 'We clean', text: 'A trained, background-checked team arrives on time with eco products.' },
  { n: 4, title: 'Relax & rate', text: 'Get your cleaning score and report, rate the clean, and rebook in one tap.' },
]
export default function HowItWorks() {
  return (
    <section className="section alt">
      <div className="container">
        <p className="eyebrow">How It Works</p>
        <h2>Book a clean in 4 easy steps</h2>
        <div className="grid3" style={{ gridTemplateColumns: 'repeat(4,1fr)', marginTop: 28 }}>
          {STEPS.map((s) => (
            <div key={s.n} className="card"><div className="step-num">{s.n}</div><h3>{s.title}</h3><p>{s.text}</p></div>
          ))}
        </div>
      </div>
    </section>
  )
}
