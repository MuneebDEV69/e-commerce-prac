# Deployment Guide — Vercel (frontends) + Render (backend)

Three deployables from one monorepo:
- **A-Backend** → Render (Express API)
- **A-Frontend** → Vercel (storefront, port 3000 locally)
- **Admin-panel** → Vercel (admin, port 3001 locally)

Deploy the **backend first** (you need its live URL for the frontends).

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
| `NODE_VERSION` | `20` |
| `DATABASE_URL` | Supabase **pooler** URL (port 6543, `?pgbouncer=true&connection_limit=1`) |
| `DIRECT_URL` | Supabase **direct** URL (port 5432) |
| `SUPABASE_URL` | `https://PROJECT.supabase.co` |
| `SUPABASE_ANON_KEY` | your anon key |
| `FRONTEND_URL` | the storefront Vercel URL (add after step 2) |
| `ADMIN_URL` | the admin Vercel URL (add after step 2) |

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

Env vars:
| Key | Value |
|-----|-------|
| `API_URL` | `https://araish-backend.onrender.com` |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://PROJECT.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | your anon key |

### Project B — Admin
| Setting | Value |
|---------|-------|
| Root Directory | `Admin-panel` |
| Framework Preset | Next.js |
| Build / Install | defaults |

Env vars:
| Key | Value |
|-----|-------|
| `API_URL` | `https://araish-backend.onrender.com` |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://PROJECT.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | your anon key |
| `NEXT_PUBLIC_STOREFRONT_URL` | the storefront Vercel URL |

> `@ecom/shared` (in `packages/shared/`) is picked up automatically — Vercel installs the whole workspace from the repo root, so no extra config is needed. A change to `packages/shared/` triggers rebuilds of both apps.

---

## 3. Wire the URLs back (after all three exist)
1. Copy the two Vercel URLs.
2. On **Render**, set `FRONTEND_URL` + `ADMIN_URL` to those → redeploy backend (CORS).
3. On **Supabase** → Authentication → URL Configuration → add both Vercel URLs to **Redirect URLs / Site URL**.

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
- [ ] Render: deploy backend, set DB/Supabase env → get backend URL, test `/health`
- [ ] Vercel: deploy A-Frontend (Root `A-Frontend`) with `API_URL` = backend URL
- [ ] Vercel: deploy Admin-panel (Root `Admin-panel`) with `API_URL` + `NEXT_PUBLIC_STOREFRONT_URL`
- [ ] Render: set `FRONTEND_URL` + `ADMIN_URL` → redeploy
- [ ] Supabase: add both URLs to Auth redirect/site URLs
- [ ] Smoke test: storefront loads, admin login → dashboard, create a product → shows on store
