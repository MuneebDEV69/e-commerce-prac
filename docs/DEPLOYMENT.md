# Deployment Guide — Vercel (frontends) + Render (backend)

Three deployables from one monorepo:
- **A-Backend** → Render (Express API)
- **A-Frontend** → Vercel (storefront, port 3000 locally)
- **Admin-panel** → Vercel (admin, port 3001 locally)

Deploy the **backend first** (you need its live URL for the frontends).

> **⚠️ Node version — all three services need Node ≥ 22.** `@supabase/supabase-js`
> constructs a Realtime client inside every `createClient()` call, even though
> we only use it for auth — and that constructor **throws on Node < 22** if no
> native WebSocket is available ("Node.js detected but native WebSocket not
> found"). This crashes the process on boot, not just a warning. `engines.node`
> is set to `>=22.0.0` in every `package.json` as a guard, but you must **also**
> set the platform-level Node version explicitly (below) — `engines` alone does
> not force it on Render or Vercel.

> **Testing the full stack locally before deploying?** Run
> `docker compose up --build` from the repo root instead — it builds all three
> services in containers on one network. See the Dockerfiles in each app folder
> and `docker-compose.yml`. That path is independent of this guide (Docker is
> not used by Vercel or Render) but is the closest thing to a production
> dry-run you can do on your own machine.

---

## 1. Backend → Render

**Option A — Blueprint (uses `render.yaml` at repo root):**
Render Dashboard → **New → Blueprint** → select this repo → it reads `render.yaml`.

**Option B — Manual Web Service:**
- Repository: this repo
- Root Directory: **`.`** (repo root — required so npm workspaces resolve `@ecom/shared`)
- Runtime: **Node**
- Build Command: `npm install && npm run db:generate`
- Start Command: `npm run start:backend`
- Health Check Path: `/health`

**Environment variables** (Render → Environment):
| Key | Value |
|-----|-------|
| `NODE_VERSION` | `22` (already set in `render.yaml` — do not lower, see the Node-version warning above) |
| `DATABASE_URL` | Supabase **pooler** URL (port 6543, `?pgbouncer=true&connection_limit=1`) |
| `DIRECT_URL` | Supabase **direct** URL (port 5432) |
| `SUPABASE_URL` | `https://PROJECT.supabase.co` |
| `SUPABASE_ANON_KEY` | your anon key |
| `FRONTEND_URL` | `https://araish-public-front.vercel.app` |
| `ADMIN_URL` | `https://araish-admin-panel.vercel.app` |
| `SMTP_USER` | your Gmail address (e.g. `muneebarif226@gmail.com`) — **required for emails/OTP** |
| `SMTP_PASS` | your 16-char Gmail **App Password** (no spaces) |
| `MAIL_FROM` | `Muneeb Ki Araish <muneebarif226@gmail.com>` |
| `ADMIN_EMAIL` | where order copies go (same Gmail is fine) |
| `OTP_EXP_MIN` | `5` |
| `BACKEND_PUBLIC_URL` | this Render URL, e.g. `https://araish-backend.onrender.com` (for PayFast callback) |
| `PAYFAST_MODE` | `sandbox` (leave PayFast keys blank to keep card = manual bank transfer) |
| `PAYFAST_MERCHANT_ID` / `PAYFAST_SECURED_KEY` / `PAYFAST_STORE_ID` | *(optional)* from GoPayFast |

> **Without `SMTP_USER` + `SMTP_PASS` the deployed backend cannot send login codes
> (OTP) or order emails** — the code no-ops mail when they're missing. This is the
> #1 reason "it works locally but not live": the secrets live in your gitignored
> local `.env` and were never added to Render.

→ After deploy you get a URL like `https://araish-backend.onrender.com`. Test `…/health`.

> Note: the API runs via `tsx` in production so the `@ecom/shared` TypeScript workspace resolves without a separate build step.

---

## 2. Frontends → Vercel (TWO projects, same repo)

Create **two** Vercel projects from this repo. Vercel auto-detects the npm-workspace monorepo and installs from the root (keep "Include files outside the Root Directory" enabled — it's automatic).

### Project A — Storefront
| Setting | Value |
|---------|-------|
| Root Directory | `A-Frontend` |
| Framework Preset | Next.js |
| Build Command | *(default)* `next build` |
| Install Command | *(default)* `npm install` |
| **Node.js Version** (Project Settings → General) | **22.x** — see the Node-version warning above; `engines.node` in `package.json` does not set this on Vercel, the dropdown must be changed manually |

Env vars:
| Key | Value |
|-----|-------|
| `API_URL` | `https://araish-backend.onrender.com` — **the Render backend URL (NOT localhost)** |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://PROJECT.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | your anon key |
| `NEXT_PUBLIC_ADMIN_URL` | `https://araish-admin-panel.vercel.app` (for the "Back to Dashboard" button) |

> **`API_URL` is the #1 fix for "works locally, not live."** Every order, login
> code (OTP), welcome email and landing-page fetch goes through the Next server →
> your backend at `API_URL`. If it's unset on Vercel it defaults to
> `http://127.0.0.1:4000`, which doesn't exist in the cloud, so all of it fails
> silently. Set it on **both** Vercel projects.

### Project B — Admin
| Setting | Value |
|---------|-------|
| Root Directory | `Admin-panel` |
| Framework Preset | Next.js |
| Build / Install | defaults |
| **Node.js Version** (Project Settings → General) | **22.x** (same reason as above) |

Env vars:
| Key | Value |
|-----|-------|
| `API_URL` | `https://araish-backend.onrender.com` — **the Render backend URL (NOT localhost)** |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://PROJECT.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | your anon key |
| `NEXT_PUBLIC_STOREFRONT_URL` | `https://araish-public-front.vercel.app` |

> `@ecom/shared` (in `packages/shared/`) is picked up automatically — Vercel installs the whole workspace from the repo root, so no extra config is needed. A change to `packages/shared/` triggers rebuilds of both apps.

---

## 3. Wire the URLs back (after all three exist)
1. Copy the two Vercel URLs.
2. On **Render**, set `FRONTEND_URL` + `ADMIN_URL` to those → redeploy backend (CORS).
3. On **Supabase** → Authentication → URL Configuration → add both Vercel URLs to **Redirect URLs / Site URL**.

---

## 3.5. Keep the backend warm (fixes slow first loads)

Render's **free tier spins the server down after ~15 min idle**; the next
request then takes 30–60s to cold-start — the #1 cause of "the site is slow the
first time." Two ways to keep it awake:

- **Committed GitHub Action** (`.github/workflows/keep-backend-warm.yml`): add a
  repo **variable** `BACKEND_URL = https://<service>.onrender.com` (Settings →
  Secrets and variables → Actions → Variables). It pings `/health` every ~10 min.
- **More reliable (recommended):** a free external pinger —
  [UptimeRobot](https://uptimerobot.com) or [cron-job.org](https://cron-job.org)
  — hitting `<BACKEND_URL>/health` every 5 minutes. (GitHub's scheduler lags and
  pauses after repo inactivity.)

Or upgrade the Render service to a paid always-on plan to remove cold starts entirely.

### Session & auth notes
- **Storefront browsing is public** (`/shop`, `/product`); only `/checkout` and
  `/account` require login. So an admin clicking "View Storefront" is **not**
  asked to log in again — they browse as a guest.
- **Admin and storefront do NOT share a login session** — they're separate
  origins/domains (and use different auth cookie names). This is expected. If you
  later want a single sign-on across both, put them on subdomains of one custom
  domain (e.g. `araish.com` + `admin.araish.com`) and set the Supabase auth
  cookie's domain to `.araish.com`. This is **not possible** on `*.vercel.app`
  (the Public Suffix List blocks shared cookies), so it requires a custom domain.

---

## 4. Push to GitHub
```bash
git add .
git commit -m "Monorepo: storefront + admin + backend, deploy-ready"
git push origin main
```
`.env` files are gitignored (only `.env.example` is committed — no secrets pushed). Vercel + Render auto-deploy on push.

---

## Order of operations (checklist)
- [ ] Push repo to GitHub
- [ ] Render: deploy backend (Node version 22 via `render.yaml`, already set) → get backend URL, test `/health`
- [ ] Vercel: deploy A-Frontend (Root `A-Frontend`), **set Node.js Version = 22.x in Project Settings**, `API_URL` = backend URL
- [ ] Vercel: deploy Admin-panel (Root `Admin-panel`), **set Node.js Version = 22.x in Project Settings**, `API_URL` + `NEXT_PUBLIC_STOREFRONT_URL`
- [ ] Render: set `FRONTEND_URL` + `ADMIN_URL` → redeploy
- [ ] Supabase: add both URLs to Auth redirect/site URLs
- [ ] Smoke test: storefront loads, admin login → dashboard, create a product → shows on store
