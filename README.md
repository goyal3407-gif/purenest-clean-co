# PureNest Clean Co. — Cleaning Services Business Website

By Goyal Kumar

A complete, deployable cleaning services business website: instant price estimator, 6+ searchable services, booking with live summary, My Bookings, admin login, automatic WhatsApp booking messages, AI cleaning plan and AI support chat, customer accounts, subscriptions, loyalty, staff view, invoices, calendar sync, waitlist and more.

## Tech — MERN stack (React + Vite + Express + MongoDB)

- **Frontend:** React 18 + Vite (`frontend/`) — components in `frontend/src/components/` (Header, Hero, Estimator, Services, HowItWorks, BookingForm, MyBookings, Tracking, BeforeAfter, Cleaners, Pricing, Reviews, Areas, Chat, FAQ, Footer, AdminLogin, Features). React Router (`/` home, `/admin` admin). Design: white/sage background, pine `#093C2A`, lime `#CDF08D`, ink `#0C1F16`, Sora headings + Inter body. No low-contrast text, no reveal animations that hide content, SVG icons only (no emoji), prices render as "AED 249 / home".
- **Backend:** Node.js + Express (`server.js`, entry also exported for Vercel serverless via `api/index.js`)
- **Database:** MongoDB Atlas free tier (M0) via mongoose (`db.js`, models: Booking, Review, Inquiry, Waitlist, Callback, Subscription, Claim). **When `MONGODB_URI` is not set, the site falls back to local JSON files in `data/`** — it works either way. See [ATLAS_SETUP.md](ATLAS_SETUP.md) for the free 10-minute Atlas setup.
- **WhatsApp:** Meta WhatsApp Business Cloud API (`graph.facebook.com`)
- **AI chat:** built-in answers, plus Google Gemini when `GEMINI_API_KEY` is set

## Setup

```bash
npm install
cp .env.example .env
# Edit .env — set ADMIN_PASSWORD and any WhatsApp / Gemini keys
# Optional: set MONGODB_URI for the free Atlas database (see ATLAS_SETUP.md)
npm run build        # builds the React frontend into frontend/dist
npm start            # serves the React app + API on http://localhost:3000
```

Frontend dev mode (with API proxy to localhost:3000):

```bash
npm run frontend:dev   # Vite on http://localhost:5173
```

## Environment variables

| Variable | Required | What it does |
|---|---|---|
| `ADMIN_PASSWORD` | Yes, for admin | Admin login password. No default is shipped and it is never stored in the repo. Set it in `.env` only. |
| `MONGODB_URI` | Recommended (free) | MongoDB Atlas connection string. Empty = local JSON files in `data/`. See ATLAS_SETUP.md. |
| `STAFF_CODE` | Optional | Code cleaners use for the staff view |
| `OWNER_WHATSAPP` | No | Owner WhatsApp number, default `917876520226` |
| `WHATSAPP_PHONE_NUMBER_ID` | For WhatsApp | Meta WhatsApp Phone Number ID |
| `WHATSAPP_ACCESS_TOKEN` | For WhatsApp | Meta WhatsApp permanent Access Token |
| `WHATSAPP_TEMPLATE` | No | Approved template name, default `booking_notification` |
| `GEMINI_API_KEY` | Optional | Google Gemini API key for smarter AI support chat |
| `PORT` | No | Default `3000` |

## Admin

Go to `/admin`, log in with the password from `ADMIN_PASSWORD`. The admin area has WhatsApp auto-send settings, bookings management, cleaner assignment/status, analytics, waitlist and callbacks.

## WhatsApp — automatic booking messages

WhatsApp needs Meta credentials; a phone number alone cannot send automatically.

1. Create a WhatsApp Business app at Meta for Developers.
2. Copy the Phone Number ID and create a permanent Access Token.
3. Create / approve a booking message template.
4. Put the three values in `.env` and restart the server.

Until then, every booking is saved and marked **"Not sent — API not connected"**, and the admin can press **Resend WhatsApp** after connecting. WhatsApp direct (Meta Cloud API) costs about ₹0.115 per utility message in India, with 1,000 free service messages a month — see Meta's pricing page for current rates.

## Features

Hero + Instant Price Estimator (bedrooms/bathrooms sliders, frequency discounts, 8 extras, `FIRST20` coupon), 6 searchable/filterable services, How It Works, room checklists, Before/After slider, Meet Your Cleaners, pricing plans, areas with search, testimonials + review form, callback/contact form, FAQ, floating mobile Book button (hides while typing in any form field), booking flow with live summary and confirmation, My Bookings dashboard with live tracking stepper, AI cleaning plan (5 questions), AI support chat, room tour, cleaning score, eco/allergy toggles, move-in/out, post-renovation, Airbnb turnover, car+home combo, pet cleaning, senior discount, group booking, price comparison, trust badges, video-call quote, calendar sync (.ics), waitlist, feedback-video coupon, carbon footprint, customer accounts (local), subscriptions, loyalty/referrals, payment choice (UPI/card/cash), staff view, invoice, insurance claim, seasonal packages, reminders, EN/Hindi/Urdu switcher for main headings/nav.

## Deploy free (Vercel Hobby)

1. Push this repo to GitHub.
2. In Vercel: **Add New → Project → Import** the repo. Vercel runs `npm run build` (builds the Vite frontend into `frontend/dist`) and serves it as static files; `/api/*` requests are rewritten to the Express app via the serverless function `api/index.js` (see `vercel.json`).
3. In **Settings → Environment Variables**, add `MONGODB_URI` (Atlas connection string — see ATLAS_SETUP.md), `ADMIN_PASSWORD`, and any WhatsApp / Gemini keys. Redeploy after adding variables.
4. Live URL: `https://purenest-clean-co.vercel.app` (the production domain — do not use old deployment-specific URLs, they are pinned to one deploy and never update).

## Security notes

- Never commit `.env`. It is in `.gitignore`.
- The admin password is only in the environment, never in code or in this repo.
- WhatsApp, Gemini and MongoDB credentials are only in the environment, never in code.
- Admin sessions are in-memory tokens; restart the server to end all sessions.

## License

MIT — By Goyal Kumar
