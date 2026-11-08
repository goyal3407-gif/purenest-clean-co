# Booking Email Setup — PureNest Clean Co.

When a customer books, PureNest sends **two emails** automatically:

1. **To the customer** (the email they entered at booking)
   - Subject: `Your PureNest booking is confirmed — <booking ID>`
   - Booking ID, service, date, time, bedrooms/bathrooms, address, total,
     access token, and "Our team will contact you shortly to confirm."
2. **To the owner** (`goyaldhiman00@gmail.com`)
   - Subject: `New PureNest booking — <booking ID> — <customer name>`
   - All booking details (name, phone, email, service, date, time, address,
     total, payment, notes, extras) so the owner can contact the customer.

Waitlist sign-ups and callback requests also email the owner (and the
customer, if they gave an email address).

Emails are sent with Gmail SMTP via `nodemailer` (`server/email.js`).
**Without the settings below, bookings still work** — the booking is saved
with `email_status: "not_configured"` and no email is attempted.

## Step 1 — Create a Gmail App Password (5 minutes)

You need a **Gmail App Password**, not your normal Gmail password.
Gmail only lets you create one if 2-Step Verification is on.

1. Go to https://myaccount.google.com/security and sign in as
   **goyaldhiman00@gmail.com**.
2. Turn on **2-Step Verification** if it is off (Google will ask you to
   verify with your phone).
3. Go to https://myaccount.google.com/apppasswords
   (or Security → 2-Step Verification → **App passwords** at the bottom).
4. App name: choose **Mail**. Device: choose **Other** and type
   `PureNest Website`.
5. Click **Create**. Google shows a **16-character password**
   (e.g. `abcd efgh ijkl mnop`). **Copy it now** — Google will not show it
   again. Enter it without the spaces.

## Step 2 — Set the variables in Vercel

1. Vercel dashboard → project **purenest-clean-co** → **Settings** →
   **Environment Variables**.
2. Add:
   - `GMAIL_USER` = `goyaldhiman00@gmail.com`
   - `GMAIL_APP_PASSWORD` = the 16-character App Password from Step 1
   - (optional) `OWNER_EMAIL` = `goyaldhiman00@gmail.com` — only needed
     if owner alerts should go to a different address.
   Apply to **Production, Preview and Development**.
3. **Redeploy** the Production deployment (Deployments → latest → Redeploy)
   so the new variables take effect.

For local testing, copy `.env.example` to `.env` and fill in the same two
values. **Never commit `.env`** — it is gitignored.

## Step 3 — Test it

1. Make a test booking on the live site with your own email address.
2. Check your inbox for "Your PureNest booking is confirmed" and the
   owner's inbox for "New PureNest booking".
3. Check the booking in the admin panel, or `GET /api/bookings/<id>?token=<accessToken>`:
   `email_status` should be `"sent"`.
   - `"not_configured"` = GMAIL_USER / GMAIL_APP_PASSWORD are not set.
   - `"failed"` = check `email_detail` on the booking (and Vercel logs)
     for the SMTP error message. Common causes: wrong App Password,
     2-Step Verification off, or the App Password was revoked.

## How it works in code

- `server/email.js` — `sendBookingEmails(booking)`, `sendWaitlistEmails(entry)`,
  `sendCallbackEmails(entry)`. Each returns `{ status, detail }` and never
  throws; a failed send never blocks a booking.
- `server.js` — `POST /api/bookings` calls `sendBookingEmails` before saving,
  stores `email_status` / `email_detail` on the booking, and returns them in
  the booking response (also visible via `GET /api/bookings/:id`).
  Admins can re-send with `POST /api/bookings/:id/resend-email`.
- `db.js` — the Booking model stores `email_status` and `email_detail`.
