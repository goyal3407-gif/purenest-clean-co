import { useState } from 'react'
import { api } from '../api'

export default function Chat() {
  const [msgs, setMsgs] = useState([{ me: false, text: 'Hi, I am Mia, the PureNest AI assistant. Ask me about pricing, booking, eco cleaning or cancellations — or book a free video-call quote.' }])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const send = async (e) => {
    e.preventDefault(); if (!input.trim()) return
    const q = input; setInput(''); setMsgs((m) => [...m, { me: true, text: q }]); setBusy(true)
    try { const d = await api('/api/ai-chat', { method: 'POST', body: { message: q } }); setMsgs((m) => [...m, { me: false, text: d.reply }]) }
    catch { setMsgs((m) => [...m, { me: false, text: 'Sorry, I could not reply just now — please use the callback form below.' }]) }
    finally { setBusy(false) }
  }
  return (
    <section className="section" id="chat">
      <div className="container">
        <p className="eyebrow">Talk to Mia — AI Support</p>
        <h2>Questions? Ask Mia, 24/7</h2>
        <div className="chat-box" style={{ marginTop: 24 }}>
          <div className="chat-log">
            {msgs.map((m, i) => (<div key={i} className={`msg ${m.me ? 'me' : ''}`}>{m.text}</div>))}
            {busy && <div className="msg">Mia is typing...</div>}
          </div>
          <form className="chat-input" onSubmit={send}>
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about price, booking, eco clean..." aria-label="Message Mia" />
            <button className="btn" type="submit">Send</button>
          </form>
        </div>
      </div>
    </section>
  )
}
