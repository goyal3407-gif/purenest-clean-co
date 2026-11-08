# MongoDB Atlas — FREE Setup (M0 tier, $0/month)

PureNest stores bookings, reviews, inquiries, waitlist entries and callbacks in
MongoDB when `MONGODB_URI` is set. **If it is not set, the site still works** —
it falls back to local JSON files in `data/` (bookings, reviews, inquiries,
waitlist, subscriptions, claims). The JSON fallback is fine for local testing,
but on Vercel the filesystem is temporary, so **for the live site, connect the
free Atlas database** using the steps below. It takes about 10 minutes and
costs nothing.

## What you get for free (Atlas M0)

- 512 MB of storage — enough for tens of thousands of bookings
- Shared cluster, no credit card required for M0
- The same database works for local development and for Vercel

## Step 1 — Create a free Atlas account & cluster

1. Go to https://www.mongodb.com/cloud/atlas/register and create a free account
   (sign up with Google or email).
2. Choose **Build a Database** → pick the **M0 FREE** tier (it is the free option).
3. Provider: **AWS**, Region: pick the closest one (e.g. **Mumbai (ap-south-1)**
   for India / Gulf, or Frankfurt for Europe). Cluster name: `purenest` (any name works).
4. Click **Create Deployment**. Wait 1–3 minutes while the cluster is created.

## Step 2 — Create a database user

1. In Atlas, go to **Database Access** (left menu, under Security).
2. Click **Add New Database User**.
3. Authentication method: **Password**. Username: e.g. `purenest-app`.
4. Password: click **Autogenerate Secure Password** and **copy it somewhere safe**
   (you will need it in the connection string). Or type your own strong password.
5. Database User Privileges: **Read and write to any database**.
6. Click **Add User**.

## Step 3 — Allow network access (so Vercel can connect)

1. In Atlas, go to **Network Access** (left menu, under Security).
2. Click **Add IP Address**.
3. Click **Allow Access from Anywhere** — this adds `0.0.0.0/0`.
   (Vercel servers use many different IPs, so a single IP will not work.
   Access is still protected by your database username + password.)
4. Click **Confirm**. Wait a minute for the change to apply.

## Step 4 — Copy the connection string

1. Go to **Database** → click **Connect** on your cluster.
2. Choose **Drivers** (or "Connect your application").
3. Driver: **Node.js**, version 5.5 or later.
4. Copy the connection string. It looks like this:

   ```
   mongodb+srv://purenest-app:<password>@purenest.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

5. Replace `<password>` with the password from Step 2 (the exact password,
   no `< >` brackets). Add the database name after `.net/`:
   `...mongodb.net/purenest?retryWrites=true&w=majority`
   (the app also works without a database name — it defaults to `test` — but
   naming it `purenest` keeps things tidy).

## Step 5 — Use it locally (optional)

```bash
cp .env.example .env
# Edit .env and set:
MONGODB_URI=mongodb+srv://purenest-app:YOUR_PASSWORD@purenest.xxxxx.mongodb.net/purenest?retryWrites=true&w=majority
npm start
```

On startup you should see: `MongoDB: connected to Atlas (MONGODB_URI)`.
If the string is wrong or the network blocks it, you will see
`MongoDB: connection failed, falling back to local JSON storage` and the
site keeps working on JSON files — fix the string and restart.

## Step 6 — Set it in Vercel (for the live site)

1. Open your Vercel project **purenest-clean-co** → **Settings** → **Environment Variables**.
2. Add a variable:
   - Name: `MONGODB_URI`
   - Value: the full connection string from Step 4
   - Environments: tick **Production** (and Preview if you want it there too).
3. Click **Save**, then **Deployments** → redeploy the latest deployment
   (or push a new commit — any new deploy picks up the variable).
4. Check the live site: book a test clean, then open the **Admin Dashboard** —
   the booking should appear there. That proves the live site is writing to Atlas.

## What is stored where

| Data | MongoDB collection | JSON fallback file |
|---|---|---|
| Bookings | `bookings` | `data/bookings.json` |
| Reviews | `reviews` | `data/reviews.json` |
| Inquiries (callback requests) | `callbacks` + `inquiries` | `data/inquiries.json` |
| Waitlist | `waitlists` | `data/waitlist.json` |
| Subscriptions | `subscriptions` | `data/subscriptions.json` |
| Damage / insurance claims | `claims` | `data/claims.json` |

Models live in `db.js` (mongoose schemas). The code checks `MONGODB_URI` on
startup: if it is missing or the connection fails, every read/write uses the
JSON files instead — nothing breaks.

## Troubleshooting

- **"MongoDB: connection failed" on startup** — wrong password in the string,
  or Network Access does not include `0.0.0.0/0` yet (wait 1–2 minutes after adding it).
- **Works locally but not on Vercel** — the env var was added after the last
  deploy. Redeploy from Vercel → Deployments → ⋯ → Redeploy.
- **"Authentication failed"** — the database user password has special
  characters (`@`, `/`, `?`, `#`, …). URL-encode them in the connection string
  (e.g. `@` → `%40`) or generate a password with only letters and numbers.
- **Never commit `.env`** — it is in `.gitignore`. Only put the connection
  string in Vercel env vars and your local `.env`.
