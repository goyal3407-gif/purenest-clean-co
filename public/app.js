// PureNest Clean Co. frontend
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
let SERVICES = [];
const EXTRAS = [['Oven clean', 30], ['Fridge clean', 25], ['Windows', 40], ['Laundry & ironing', 35], ['Balcony', 20], ['Carpet shampoo', 50], ['Sofa clean', 45], ['Pet hair removal', 30]];
const LANGS = {
  en: { nav: 'Services · Pricing · Book · Reviews · FAQ', hero: 'A cleaner home, without the hassle.', book: 'Book Now' },
  hi: { nav: 'सेवाएँ · कीमत · बुक करें · समीक्षाएँ · प्रश्न', hero: 'बिना परेशानी के साफ़-सुथरा घर।', book: 'अभी बुक करें' },
  ur: { nav: 'خدمات · قیمت · بک کریں · جائزے · سوالات', hero: 'بغیر پریشانی کے صاف ستھرا گھر۔', book: 'ابھی بک کریں' },
};
function setLang(l) {
  const d = LANGS[l] || LANGS.en;
  const nav = $('#navlinks'); if (nav) nav.textContent = d.nav;
  const h = $('#heroTitle'); if (h) h.textContent = d.hero;
  $$('.bookbtn').forEach(b => b.textContent = d.book);
  const note = $('#langNote'); if (note) note.textContent = l === 'en' ? '' : (l === 'hi' ? 'मुख्य शीर्षक हिंदी में हैं — विस्तृत विवरण अंग्रेज़ी में हैं।' : 'اہم سرخیاں اردو میں ہیں — تفصیلی وضاحت انگریزی میں ہے۔');
}
async function api(path, opts) { const r = await fetch(path, { headers: { 'Content-Type': 'application/json' }, ...opts }); return r.json(); }
async function loadServices(filter = '', cat = '') {
  SERVICES = (await api('/api/services')).services || [];
  const list = $('#services'); if (!list) return;
  list.innerHTML = SERVICES.filter(s => (!cat || s.category === cat) && (s.name + s.desc).toLowerCase().includes(filter.toLowerCase())).map(s => `
    <div class="card"><span class="pill">${s.tag || s.category}</span><h3>${s.name}</h3><p>${s.desc}</p>
    <p><b>AED ${s.price}</b> ${s.unit}</p>
    <button class="btn" onclick="bookService('${s.id}')">Book ${s.name}</button></div>`).join('') || '<p>No services match.</p>';
}
function bookService(id) { const el = $('#bookingService'); if (el) el.value = id; document.querySelector('#booking')?.scrollIntoView({ behavior: 'smooth' }); updateSummary(); }
// Estimator
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
  const out = $('#estTotal'); if (out) out.textContent = 'AED ' + total + (code === 'FIRST20' ? ' (FIRST20 applied)' : '');
  return total;
}
function updateSummary() {
  const total = estimate();
  const s = $('#bookingSummary'); if (!s) return;
  s.innerHTML = `<b>Service:</b> ${$('#bookingService')?.selectedOptions?.[0]?.text || ''}<br><b>Date:</b> ${$('#bookDate')?.value || '-'} ${$('#bookTime')?.value || ''}<br><b>Bedrooms:</b> ${$('#bookBed')?.value || 2} · <b>Bathrooms:</b> ${$('#bookBath')?.value || 1}<br><b>Total:</b> AED ${total}`;
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
  out.innerHTML = `<b>Booking confirmed!</b> ID: ${b.id}<br>WhatsApp: ${b.whatsapp_detail || b.whatsapp_status}<br><a href="/api/calendar/${b.id}.ics">Add to calendar (.ics)</a> · <a href="/api/invoice/${b.id}" target="_blank">Download invoice</a><br>Save your booking ID to track it in My Bookings.`;
}
async function loadReviews() {
  const r = await api('/api/reviews'); const el = $('#reviews'); if (!el) return;
  el.innerHTML = (r.reviews || []).map(x => `<div class="card"><b>${x.name}</b> — ${'★'.repeat(x.rating || 5)}<p>${x.text}</p><small>${x.service || ''}</small></div>`).join('');
}
async function submitReview(e) { e.preventDefault(); await api('/api/reviews', { method: 'POST', body: JSON.stringify({ name: $('#revName').value, rating: $('#revRating').value, text: $('#revText').value, service: $('#revService').value }) }); loadReviews(); e.target.reset(); alert('Thanks for your review!'); }
async function submitInquiry(e) { e.preventDefault(); const r = await api('/api/inquiries', { method: 'POST', body: JSON.stringify({ name: $('#inqName').value, phone: $('#inqPhone').value, message: $('#inqMsg').value }) }); alert(r.message || 'Thanks!'); e.target.reset(); }
async function aiPlan(e) {
  e.preventDefault();
  const body = { bedrooms: $('#aiBed').value, bathrooms: $('#aiBath').value, homeType: $('#aiHome').value, pets: $('#aiPets').checked, allergy: $('#aiAllergy').checked, frequency: $('#aiFreq').value, budget: $('#aiBudget').value, eco: $('#aiEco').checked };
  const r = await api('/api/ai-plan', { method: 'POST', body: JSON.stringify(body) });
  $('#aiPlanResult').innerHTML = '<h3>Your AI Cleaning Plan</h3><ul>' + (r.plan || []).map(p => `<li>${p}</li>`).join('') + '</ul>';
}
async function aiChat(e) {
  e.preventDefault();
  const q = $('#chatInput').value; const box = $('#chatBox'); box.innerHTML += `<p><b>You:</b> ${q}</p>`;
  const r = await api('/api/ai-chat', { method: 'POST', body: JSON.stringify({ message: q }) });
  box.innerHTML += `<p><b>AI:</b> ${r.reply} <small>(${r.source})</small></p>`; e.target.reset();
}
function cleaningScore() {
  const rooms = +($('#scoreRooms').value || 3), last = +($('#scoreLast').value || 7), pets = $('#scorePets').checked;
  let score = 100 - Math.min(40, last * 3) - (pets ? 10 : 0);
  score = Math.max(40, score);
  $('#scoreResult').innerHTML = `<b>Cleaning score: ${score}/100</b> — ${score > 80 ? 'Great! A regular clean will keep it perfect.' : score > 60 ? 'Good — a deep clean is recommended.' : 'Time for a deep clean!'}`;
}
function comparePrices() {
  const ours = estimate();
  $('#compareResult').innerHTML = `PureNest: AED ${ours} · Typical competitor: AED ${Math.round(ours * 1.25)} · You save AED ${Math.round(ours * 0.25)} with PureNest.`;
}
async function joinWaitlist(e) { e.preventDefault(); const r = await api('/api/waitlist', { method: 'POST', body: JSON.stringify({ name: $('#wlName').value, date: $('#wlDate').value, service: $('#wlService').value }) }); alert(r.message); }
async function loadMyBookings() {
  const saved = JSON.parse(localStorage.getItem('purenest_last_booking') || 'null');
  const el = $('#myBookings'); if (!el) return;
  if (!saved) { el.innerHTML = '<p>No booking saved on this device yet. Book above, then come back here.</p>'; return; }
  const r = await api(`/api/bookings/${saved.id}?token=${saved.token}`);
  if (!r.ok) { el.innerHTML = '<p>Could not load booking.</p>'; return; }
  const b = r.booking;
  el.innerHTML = `<div class="card"><b>${b.id}</b> — ${b.serviceName} — ${b.date} ${b.time} — AED ${b.total} — ${b.status}<br>WhatsApp: ${b.whatsapp_detail}<div class="stepper"><span class="step done">Booked</span><span class="step ${b.status !== 'confirmed' ? 'done' : ''}">Cleaner assigned</span><span class="step">On the way</span><span class="step">Cleaning</span><span class="step">Done</span></div><br><button class="btn ghost" onclick="cancelBooking('${b.id}','${b.token}')">Cancel booking</button> <a class="btn ghost" href="/api/invoice/${b.id}" target="_blank">Invoice</a> <a class="btn ghost" href="/api/calendar/${b.id}.ics">Calendar .ics</a></div>`;
}
async function cancelBooking(id, token) { await api(`/api/bookings/${id}/cancel`, { method: 'POST', body: JSON.stringify({ token }) }); loadMyBookings(); }
function initExtras() {
  const el = $('#extras'); if (!el) return;
  el.innerHTML = EXTRAS.map(([n, p]) => `<label><input type="checkbox" class="extra" value="${p}" data-name="${n}" onchange="updateSummary()"> ${n} (+AED ${p})</label><br>`).join('');
}
document.addEventListener('DOMContentLoaded', () => {
  initExtras(); loadServices(); loadReviews(); loadMyBookings();
  const s = $('#serviceSearch'); if (s) s.addEventListener('input', () => loadServices(s.value, $('#serviceCat')?.value || ''));
  const c = $('#serviceCat'); if (c) c.addEventListener('change', () => loadServices($('#serviceSearch')?.value || '', c.value));
  ['estService', 'estBed', 'estBath', 'estFreq'].forEach(id => { const el = document.getElementById(id); if (el) el.addEventListener('change', updateSummary); });
  const cp = $('#coupon'); if (cp) cp.addEventListener('input', updateSummary);
  updateSummary();
});
