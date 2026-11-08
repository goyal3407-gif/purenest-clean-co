# PureNest Clean Co. — Cleaning Services Business Website

By Goyal Kumar

A complete, deployable cleaning services business website: instant price estimator, 6+ searchable services, booking with live summary, My Bookings, admin login, automatic WhatsApp booking messages, AI cleaning plan and AI support chat, customer accounts, subscriptions, loyalty, staff view, invoices, calendar sync, waitlist and more.

## Tech

- Frontend: static HTML + Tailwind CSS + vanilla JS (`public/`)
- Backend: Node.js + Express (`server.js`)
- Storage: local JSON files in `data/` (bookings, reviews, inquiries, waitlist, subscriptions, claims). Swap `load`/`save` in `server.js` for MongoDB when you scale.
- WhatsApp: Meta WhatsApp Business Cloud API (`graph.facebook.com`)
- AI chat: built-in answers, plus Google Gemini when `GEMINI_API_KEY` is set

## Setup

```bash
npm install
cp .env.example .env
# Edit .env — set ADMIN_PASSWORD and any WhatsApp / Gemini keys
npm start
```

Open http://localhost:3000

## Environment variables

| Variable | Required | What it does |
|---|---|---|
| `ADMIN_PASSWORD` | Yes, for admin | Admin login password. No default is shipped and it is never stored in the repo. Set it in `.env` only. |
| `STAFF_CODE` | Optional | Code cleaners use for the staff view |
| `OWNER_WHATSAPP` | No | Owner WhatsApp number, default `917876520226` |
| `WHATSAPP_PHONE_NUMBER_ID` | For WhatsApp | Meta WhatsApp Phone Number ID |
| `WHATSAPP_ACCESS_TOKEN` | For WhatsApp | Meta WhatsApp permanent Access Token |
| `WHATSAPP_TEMPLATE` | No | Approved template name, default `booking_notification` |
| `GEMINI_API_KEY` | Optional | Google Gemini API key for smarter AI support chat |
| `PORT` | No | Default `3000` |

## Admin

Go to `/admin.html`, log in with the password from `ADMIN_PASSWORD`. The admin area has WhatsApp auto-send settings, bookings management, cleaner assignment/status, analytics, waitlist and callbacks.

## WhatsApp — automatic booking messages

WhatsApp needs Meta credentials; a phone number alone cannot send automatically.

1. Create a WhatsApp Business app at Meta for Developers.
2. Copy the Phone Number ID and create a permanent Access Token.
3. Create / approve a booking message template.
4. Put the three values in `.env` and restart the server.

Until then, every booking is saved and marked **“Not sent — API not connected”**, and the admin can press **Resend WhatsApp** after connecting. WhatsApp direct (Meta Cloud API) costs about ₹0.115 per utility message in India, with 1,000 free service messages a month — see Meta's pricing page for current rates.

## Features

Hero + Instant Price Estimator (bedrooms/bathrooms sliders, frequency discounts, 8 extras, `FIRST20` coupon), 6 searchable/filterable services, How It Works, room checklists, Before/After slider, Meet Your Cleaners, pricing plans, areas with search, testimonials + review form, callback/contact form, FAQ, floating mobile Book button, booking flow with live summary and confirmation, My Bookings dashboard with live tracking stepper, AI cleaning plan (5 questions), AI support chat, room tour, cleaning score, eco/allergy toggles, move-in/out, post-renovation, Airbnb turnover, car+home combo, pet cleaning, senior discount, group booking, price comparison, trust badges, video-call quote, calendar sync (.ics), waitlist, feedback-video coupon, carbon footprint, customer accounts (local), subscriptions, loyalty/referrals, payment choice (UPI/card/cash), staff view, invoice, insurance claim, seasonal packages, reminders, EN/Hindi/Urdu switcher for main headings/nav.

## Deploy free

- **Frontend + backend together:** Render (free tier) — set the repo, build command `npm install`, start command `npm start`, add the env vars above in Render.
- **Frontend only:** Vercel — import the repo, or deploy `public/` as a static site (API features need the Render backend URL).
- **Database:** MongoDB Atlas (free 512 MB cluster) when you outgrow local JSON files.
- **Domain:** buy a domain later and connect it in Vercel / Render.

## Security notes

- Never commit `.env`. It is in `.gitignore`.
- The admin password is only in the environment, never in code or in this repo.
- WhatsApp and Gemini keys are only in the environment, never in code.
- Admin sessions are in-memory tokens; restart the server to end all sessions.

## License

MIT — By Goyal Kumar
