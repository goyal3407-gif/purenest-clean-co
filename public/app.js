// PureNest Clean Co. frontend — rebuilt from scratch, 2026-11-08
// Backend contracts (server.js): GET /api/services, POST /api/bookings,
// GET /api/bookings/:id?token=, POST /api/bookings/:id/cancel,
// GET/POST /api/reviews, POST /api/inquiries, /api/waitlist,
// /api/subscriptions, /api/claims, POST /api/ai-plan, POST /api/ai-chat.
// No reveal-on-scroll animation anywhere — all content visible by default.
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
let SERVICES = [];
const EXTRAS = [['Oven clean', 30], ['Fridge clean', 25], ['Windows', 40], ['Laundry & ironing', 35], ['Balcony', 20], ['Carpet shampoo', 50], ['Sofa clean', 45], ['Pet hair removal', 30]];

// Hindi/Urdu switch covers main headings/nav only — detailed copy stays in English.
const LANGS = {
  en: { hero: 'A cleaner home, without the hassle.', book: 'Book Now', note: '' },
  hi: { hero: 'बिना परेशानी के साफ़-सुथरा घर।', book: 'अभी बुक करें', note: 'मुख्य शीर्षक हिंदी में हैं — विस्तृत विवरण अंग्रेज़ी में हैं।' },
  ur: { hero: 'بغیر پریشانی کے صاف ستھرا گھر۔', book: 'ابھی بک کریں', note: 'اہم سرخیاں اردو میں ہیں — تفصیلی وضاحت انگریزی میں ہے۔' },
};
function setLang(l) {
  const d = LANGS[l] || LANGS.en;
  const h = $('#heroTitle'); if (h) h.textContent = d.hero;
  $$('.bookbtn').forEach(b => b.textContent = d.book);
  const note = $('#langNote'); if (note) note.textContent = d.note;
}
async function api(path, opts) {
  const r = await fetch(path, { headers: { 'Content-Type': 'application/json' }, ...opts });
  return r.json();
}
async function loadServices(filter = '', cat = '') {
  SERVICES = (await api('/api/services')).services || [];
  const list = $('#services'); if (!list) return;
  const icons = {
    deep: '<path d="M12 3l2.5 5.5L20 9l-4 4 1 6-5-3-5 3 1-6-4-4 5.5-.5z"/>',
    regular: '<path d="M3 12h18M5 6h14M7 18h10"/>',
    move: '<path d="M3 11l9-7 9 7M5 10v10h14V10"/>',
    reno: '<path d="M14 7l3 3L8 19H5v-3zM13 6l5 5"/>',
    airbnb: '<path d="M3 11l9-7 9 7M5 10v10h5v-6h4v6h5V10"/>',
    office: '<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 9h8M8 13h8M8 17h5"/>',
    pet: '<circle cx="12" cy="12" r="3"/><circle cx="7" cy="8" r="1.6"/><circle cx="17" cy="8" r="1.6"/><circle cx="6" cy="13" r="1.6"/><circle cx="18" cy="13" r="1.6"/>',
    car: '<path d="M5 12l1.5-4.5A2 2 0 0 1 8.4 6h7.2a2 2 0 0 1 1.9 1.5L19 12M5 12v5h2v-2h10v2h2v-5M5 12h14"/>',
  };
  const rows = SERVICES.filter(s => (!cat || s.category === cat) && (s.name + ' ' + s.desc).toLowerCase().includes(filter.toLowerCase()));
  list.innerHTML = rows.map(s => `
    <article class="card service-card"><div class="service-icon"><svg viewBox="0 0 24 24" aria-hidden="true">${icons[s.id] || icons.regular}</svg></div>${s.tag ? `<span class="pill">${s.tag}</span>` : ''}<h3>${s.name}</h3><p>${s.desc}</p>
    <p class="service-price"><b>AED ${s.price}</b> <span class="unit">/ ${s.unit.replace(/^per\s+/, '')}</span></p>
    <button class="btn" onclick="bookService('${s.id}')">Book ${s.name}</button></article>`).join('') || '<p>No services match. Try a different search.</p>';
}
function bookService(id) {
  const el = $('#bookingService'); if (el) el.value = id;
  document.querySelector('#booking')?.scrollIntoView({ behavior: 'smooth' });
  updateSummary();
}
function estimate() {
  const svc = SERVICES.find(s => s.id === $('#estService')?.value) || { price: 249 };
  const bed = +($('#estBed')?.value || 2), bath = +($('#estBath')?.value || 1);
  const freq = $('#estFreq')?.value || 'one-time';
  const extras = $$('.extra:checked').map(c => +c.value);
  const eco = $('#ecoToggle')?.checked, allergy = $('#allergyToggle')?.checked, senior = $('#seniorToggle')?.checked;
  let total = svc.price + (bed - 1) * 30 + (bath - 1) * 20 + extras.reduce((a, b) => a + b, 0);
  if (eco) total += 20; if (allergy) total += 25;
  if (freq === 'weekly') total *= 0.8; if (freq === 'fortnightly') total *= 0.9;
  if (senior) total *= 0.9;
  const code = ($('#coupon')?.value || '').trim().toUpperCase();
  if (code === 'FIRST20') total *= 0.8;
  total = Math.round(total);
  const base = svc.price + (bed - 1) * 30 + (bath - 1) * 20 + extras.reduce((a, b) => a + b, 0) + (eco ? 20 : 0) + (allergy ? 25 : 0);
  const out = $('#estTotal'); if (out) out.textContent = 'AED ' + total;
  const was = $('#estWas'), save = $('#estSave');
  if (was && save) {
    if (total < base) { was.textContent = 'AED ' + Math.round(base); was.classList.remove('hidden'); save.textContent = 'You save AED ' + Math.round(base - total); save.classList.remove('hidden'); }
    else { was.classList.add('hidden'); save.classList.add('hidden'); }
  }
  return total;
}
function updateSummary() {
  const total = estimate();
  const s = $('#bookingSummary'); if (!s) return;
  const dateVal = $('#bookDate')?.value;
  const dateText = dateVal ? new Date(dateVal + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : 'Select a date';
  s.innerHTML = `<div class="row"><span>Service</span><span>${$('#bookingService')?.selectedOptions?.[0]?.text || ''}</span></div><div class="row"><span>Date</span><span>${dateText}${dateVal ? ' · ' + ($('#bookTime')?.value || '') : ''}</span></div><div class="row"><span>Home</span><span>${$('#bookBed')?.value || 2} bedrooms · ${$('#bookBath')?.value || 1} bathrooms</span></div><div class="row total"><span>Total</span><span>AED ${total}</span></div>`;
  const t = $('#bookTotal'); if (t) t.value = total;
}
async function submitBooking(e) {
  e.preventDefault();
  const body = { name: $('#bookName').value, phone: $('#bookPhone').value, email: $('#bookEmail').value, address: $('#bookAddress').value, serviceId: $('#bookingService').value, date: $('#bookDate').value, time: $('#bookTime').value, bedrooms: $('#bookBed').value, bathrooms: $('#bookBath').value, total: $('#bookTotal').value, payment: $('#bookPayment').value, frequency: $('#estFreq')?.value || 'one-time', eco: $('#ecoToggle')?.checked, allergy: $('#allergyToggle')?.checked, senior: $('#seniorToggle')?.checked, extras: $$('.extra:checked').map(c => c.dataset.name) };
  const r = await api('/api/bookings', { method: 'POST', body: JSON.stringify(body) });
  const out = $('#bookingResult');
  if (!r.ok) { out.textContent = 'Error: ' + (r.error || 'booking failed'); return; }
  const b = r.booking;
  localStorage.setItem('purenest_last_booking', JSON.stringify({ id: b.id, token: b.accessToken }));
  out.innerHTML = `<div class="success"><b>Booking confirmed!</b><br>Booking ID: <b>${b.id}</b><br>WhatsApp: ${b.whatsapp_detail || b.whatsapp_status}<br><a href="/api/calendar/${b.id}.ics">Add to calendar (.ics)</a> · <a href="/api/invoice/${b.id}" target="_blank">Download invoice</a><br>Save your booking ID to track it in My Bookings.</div>`;
  loadMyBookings();
}
async function loadReviews() {
  const r = await api('/api/reviews'); const el = $('#reviews'); if (!el) return;
  const star = n => '★'.repeat(n) + '<span class="empty">' + '★'.repeat(Math.max(0, 5 - n)) + '</span>';
  el.innerHTML = (r.reviews || []).map(x => `<article class="card"><div class="review-stars stars">${star(x.rating || 5)}</div><p>“${x.text}”</p><p><b>${x.name}</b><br><span>${x.service || 'Cleaning'}</span></p></article>`).join('');
}
async function submitReview(e) {
  e.preventDefault();
  await api('/api/reviews', { method: 'POST', body: JSON.stringify({ name: $('#revName').value, rating: $('#revRating').value, text: $('#revText').value, service: $('#revService').value }) });
  loadReviews(); e.target.reset(); alert('Thanks for your review!');
}
async function submitInquiry(e) {
  e.preventDefault();
  const r = await api('/api/inquiries', { method: 'POST', body: JSON.stringify({ name: $('#inqName').value, phone: $('#inqPhone').value, message: $('#inqMsg').value }) });
  alert(r.message || 'Thanks!'); e.target.reset();
}
async function aiPlan(e) {
  e.preventDefault();
  const body = { bedrooms: $('#aiBed').value, bathrooms: $('#aiBath').value, homeType: $('#aiHome').value, pets: $('#aiPets').checked, allergy: $('#aiAllergy').checked, frequency: $('#aiFreq').value, budget: $('#aiBudget').value, eco: $('#aiEco').checked };
  const r = await api('/api/ai-plan', { method: 'POST', body: JSON.stringify(body) });
  $('#aiPlanResult').innerHTML = '<div class="card"><h3>Your AI Cleaning Plan</h3><ul class="checklist">' + (r.plan || []).map(p => `<li>${p}</li>`).join('') + '</ul></div>';
}
async function aiChat(e) {
  e.preventDefault();
  const q = $('#chatInput').value; const box = $('#chatBox');
  box.innerHTML += `<p><b>You:</b> ${q}</p>`;
  const r = await api('/api/ai-chat', { method: 'POST', body: JSON.stringify({ message: q }) });
  box.innerHTML += `<p><b>Mia:</b> ${r.reply} <small>(${r.source})</small></p>`;
  e.target.reset();
}
function cleaningScore() {
  const rooms = +($('#scoreRooms').value || 3), last = +($('#scoreLast').value || 7), pets = $('#scorePets').checked;
  let score = 100 - Math.min(40, last * 3) - (pets ? 10 : 0);
  score = Math.max(40, score);
  const msg = score > 80 ? 'Great! A regular clean will keep it perfect.' : score > 60 ? 'Good — a deep clean is recommended.' : 'Time for a deep clean!';
  const wrap = $('#scoreWrap'); if (wrap) wrap.classList.remove('hidden');
  const val = $('#scoreValue'); if (val) val.textContent = score + ' / 100';
  const fill = $('#scoreFill'); if (fill) fill.style.width = score + '%';
  const lab = $('#scoreLabel'); if (lab) lab.textContent = score > 80 ? 'Your home is looking great' : score > 60 ? 'Your home is doing well' : 'Your home needs attention';
  $('#scoreResult').textContent = msg;
}
function comparePrices() {
  const ours = estimate();
  $('#compareResult').innerHTML = `PureNest: AED ${ours} · Typical competitor: AED ${Math.round(ours * 1.25)} · You save AED ${Math.round(ours * 0.25)} with PureNest.`;
}
async function joinWaitlist(e) {
  e.preventDefault();
  const r = await api('/api/waitlist', { method: 'POST', body: JSON.stringify({ name: $('#wlName').value, date: $('#wlDate').value, service: $('#wlService').value }) });
  alert(r.message); e.target.reset();
}
async function loadMyBookings() {
  const saved = JSON.parse(localStorage.getItem('purenest_last_booking') || 'null');
  const el = $('#myBookings'); if (!el) return;
  if (!saved) {
    el.innerHTML = `<div class="empty-state"><div class="empty-icon"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#093c2a" stroke-width="1.8" stroke-linecap="round"><path d="M3 12h18M5 6h14M7 18h10"/></svg></div><h3>No bookings yet</h3><p>You have no bookings saved on this device. Book a cleaning above and it will appear here with live tracking.</p><a href="#booking" class="btn">Book Your First Clean</a></div>`;
    return;
  }
  const r = await api(`/api/bookings/${saved.id}?token=${saved.token}`);
  if (!r.ok) {
    el.innerHTML = `<div class="empty-state"><h3>Could not load booking</h3><p>Your booking may have been cancelled, or this device does not have it saved.</p><a href="#booking" class="btn">Book Again</a></div>`;
    return;
  }
  const b = r.booking;
  el.innerHTML = `<div class="card"><h3>${b.serviceName}</h3><p><b>${b.id}</b> · ${b.date} at ${b.time} · <b>AED ${b.total}</b> · ${b.status}</p><p>WhatsApp: ${b.whatsapp_detail}</p><div class="stepper"><span class="step done"><span class="dot"></span>Booked</span><span class="step ${b.status !== 'confirmed' ? 'done' : ''}"><span class="dot"></span>Cleaner assigned</span><span class="step"><span class="dot"></span>On the way</span><span class="step"><span class="dot"></span>Cleaning</span><span class="step"><span class="dot"></span>Done</span></div><p style="margin-top:14px"><button class="btn ghost" onclick="cancelBooking('${b.id}','${b.token}')">Cancel booking</button> <a class="btn ghost" href="/api/invoice/${b.id}" target="_blank">Invoice</a> <a class="btn ghost" href="/api/calendar/${b.id}.ics">Calendar .ics</a></p></div>`;
}
async function cancelBooking(id, token) {
  await api(`/api/bookings/${id}/cancel`, { method: 'POST', body: JSON.stringify({ token }) });
  loadMyBookings();
}
function initExtras() {
  const el = $('#extras'); if (!el) return;
  el.innerHTML = EXTRAS.map(([n, p]) => `<label class="check-row"><input type="checkbox" class="extra" value="${p}" data-name="${n}" onchange="updateSummary()"><span>${n} (+AED ${p})</span></label>`).join('');
}
function toggleMenu(btn) {
  const m = document.getElementById('mobileMenu'); if (!m) return;
  const open = m.classList.toggle('open');
  if (btn) btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  document.body.classList.toggle('modal-open', open);
}
function searchArea() {
  const v = (document.getElementById('areaSearch')?.value || '').trim();
  const el = document.getElementById('areaResult'); if (!el) return;
  el.textContent = v ? `Yes — we cover ${v} (Dubai, Abu Dhabi, Sharjah, Riyadh, Doha).` : 'We cover Dubai, Abu Dhabi, Sharjah, Riyadh and Doha.';
}
// Hide the floating Book Now button whenever any input is focused, so it never covers a form field.
document.addEventListener('focusin', e => {
  const t = e.target;
  if (t && /^(INPUT|SELECT|TEXTAREA)$/.test(t.tagName)) document.body.classList.add('form-focused');
});
document.addEventListener('focusout', () => setTimeout(() => {
  const a = document.activeElement;
  if (!a || !/^(INPUT|SELECT|TEXTAREA)$/.test(a.tagName)) document.body.classList.remove('form-focused');
}, 50));
document.addEventListener('DOMContentLoaded', () => {
  initExtras(); loadServices(); loadReviews(); loadMyBookings();
  const s = $('#serviceSearch'); if (s) s.addEventListener('input', () => loadServices(s.value, $('#serviceCat')?.value || ''));
  const c = $('#serviceCat'); if (c) c.addEventListener('change', () => loadServices($('#serviceSearch')?.value || '', c.value));
  ['estService', 'estBed', 'estBath', 'estFreq'].forEach(id => { const el = document.getElementById(id); if (el) el.addEventListener('change', updateSummary); });
  const cp = $('#coupon'); if (cp) cp.addEventListener('input', updateSummary);
  updateSummary();
  // Before/After slider — pointer + keyboard, no animation that hides content.
  const slider = document.getElementById('baSlider');
  if (slider) {
    const setPct = pct => { pct = Math.max(5, Math.min(95, pct)); slider.style.left = pct + '%'; slider.setAttribute('aria-valuenow', String(Math.round(pct))); };
    const move = x => { const r = slider.parentElement.getBoundingClientRect(); setPct(((x - r.left) / r.width) * 100); };
    slider.addEventListener('pointerdown', e => {
      slider.setPointerCapture(e.pointerId);
      const h = ev => move(ev.clientX);
      slider.addEventListener('pointermove', h);
      slider.addEventListener('pointerup', () => slider.removeEventListener('pointermove', h), { once: true });
    });
    slider.addEventListener('keydown', e => {
      const cur = parseFloat(slider.style.left) || 50;
      if (e.key === 'ArrowLeft') setPct(cur - 5);
      if (e.key === 'ArrowRight') setPct(cur + 5);
    });
  }
  document.querySelectorAll('#mobileMenu a').forEach(a => a.addEventListener('click', () => {
    document.getElementById('mobileMenu')?.classList.remove('open');
    document.body.classList.remove('modal-open');
  }));
});
