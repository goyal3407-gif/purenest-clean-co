import { useState } from 'react'

const FAQS = [
  { q: 'How do I pay?', a: 'Cash after the clean, or card / UPI via a secure link we send after booking. No card details are taken on this site.' },
  { q: 'What if I am not happy with the clean?', a: 'Tell us within 24 hours and we re-clean the missed areas free — that is our happiness guarantee. Damage is covered by insurance up to AED 10,000; file a claim from the form below.' },
  { q: 'Do you bring products and equipment?', a: 'Yes — all products and equipment are included. Choose Eco-clean for chemical-free, pet-safe and baby-safe products.' },
  { q: 'Can I book the same cleaner again?', a: 'Yes. Weekly and monthly plans keep the same cleaner, and you can request a favourite cleaner when you book.' },
]
export default function FAQ() {
  const [open, setOpen] = useState(0)
  return (
    <section className="section alt" id="faq">
      <div className="container">
        <p className="eyebrow">FAQ</p>
        <h2>Frequently asked questions</h2>
        <div style={{ marginTop: 24 }}>
          {FAQS.map((f, i) => (
            <div key={f.q} className="faq-item">
              <button className="faq-q" onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i}>
                <span>{f.q}</span><span>{open === i ? '−' : '+'}</span>
              </button>
              {open === i && <div className="faq-a">{f.a}</div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
