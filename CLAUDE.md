# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

"Muneeb Ki Araish" — a Pakistani e-commerce storefront (Araish.com-style bedding/home
goods shop) built as an **npm-workspaces monorepo** with three independently
deployable apps plus one shared library:

| Folder | App | Port (dev) | Deploys to |
|--------|-----|------|-----------|
| `A-Frontend` | Customer storefront (Next.js 14 App Router) | 3000 | Vercel |
| `Admin-panel` | Back-office admin (Next.js 14 App Router) | 3001 | Vercel |
| `A-Backend` | Express + TypeScript REST API | 4000 | Render |
| `packages/shared` | `@ecom/shared` — Zod schemas + shared TS types | — | imported only |

Root `package.json` orchestrates all three via npm workspaces; there is no
root-level app code.

## The golden rule of this architecture

**The browser never talks to the database, and neither frontend has a Prisma
client.** Every read/write flows: `Browser → Next.js (route handler or server
component) → A-Backend REST API → Prisma → Supabase Postgres`. A-Backend is the
**only** thing with DB credentials. Both Next apps call it through
`src/lib/api.ts` (server-side fetches) or `app/api/**/route.ts` proxies (when the
browser needs to hit it directly, e.g. checkout/OTP) — this keeps `API_URL` and
secrets off the client bundle and avoids CORS.

## Commands

Run everything from the **repo root** (not inside a sub-package) unless noted.

```bash
npm run dev              # starts backend + storefront + admin together (concurrently)
npm run dev:backend      # API only, :4000 (tsx watch — no compile step)
npm run dev:frontend     # storefront only, :3000
npm run dev:admin        # admin only, :3001

npm run build:frontend   # next build (A-Frontend)
npm run build:admin      # next build (Admin-panel)
npm run build:backend    # tsc --noEmit (type-check only; backend runs via tsx, not compiled dist)

npm run db:push          # push prisma/schema.prisma to Supabase (uses DIRECT_URL, port 5432)
npm run db:generate      # regenerate the Prisma client (run after any schema.prisma edit)
npm run db:studio        # Prisma Studio GUI
npm run db:seed          # seed script

docker compose up --build   # full stack in containers, for local testing only (not used by Vercel/Render)
```

There is no test suite and no root lint aggregator in this repo — don't invent
`npm test`/`npm run lint` commands. `A-Frontend` and `Admin-panel` each have
`next lint` if you need to lint one of them individually.

**Env files**: each app has its own `.env` (gitignored) with a matching
`.env.example`. `docker-compose.yml` reads a **root** `.env` — mail/PayFast vars
currently only live in `A-Backend/.env` and must be duplicated to the root `.env`
(and added to the `backend.environment` block in `docker-compose.yml`) if you want
email to work inside Docker.

## Why `tsx` and not a compiled backend

A-Backend runs via `tsx` (transpile-on-the-fly), not `tsc` + `node dist/`, because
it imports `@ecom/shared` as a **live value** (`productInputSchema`,
`orderInputSchema`, etc., used at runtime for validation), not just types. `tsx`
resolves the workspace package directly from source. `npm run build:backend` is
type-checking only (`tsc --noEmit`) — it is not what ships to Render.

## Node version constraint (do not lower)

All three apps require **Node ≥ 22**, enforced via `engines.node` in every
`package.json` and `NODE_VERSION=22` in `render.yaml`. Reason:
`@supabase/supabase-js` constructs a Realtime client inside every
`createClient()` call (even though this project never uses realtime), and that
constructor throws on Node < 22 without native WebSocket support — it crashes the
process on boot, not a warning. On Vercel this must also be set explicitly per
project (Settings → General → Node.js Version), since `engines` alone doesn't
force it there.

## A-Backend — routing & data conventions

- One `Router` per resource under `src/routes/*.ts`, mounted in `src/index.ts`
  under `/v1/...`. Adding a feature = new route file + one `app.use(...)` line.
- **Auth pattern**: `src/middleware/requireAdmin.ts` reads `Authorization: Bearer
  <supabase-jwt>`, asks Supabase who it is, then checks `role === 'ADMIN'` in our
  own `users` table. Public routes (product reads, order placement, landing GET)
  skip it entirely.
- **Validation**: every admin write does
  `someSchema.safeParse(req.body)` using a schema imported from `@ecom/shared` —
  never hand-rolled checks. Add new fields to the shared schema first, then wire
  them through backend → admin form → storefront display.
- **Pricing security**: checkout/PayFast routes accept only `{ slug, quantity }`
  from the client and always re-look-up the authoritative `priceFrom` from the DB
  before computing totals — a tampered client can never change what something
  costs.
- **DB pooler vs direct**: runtime queries use `DATABASE_URL` (Supabase
  **pooler**, port 6543, `pgbouncer=true`); schema pushes use `DIRECT_URL` (port
  5432). If `db:push` fails with "can't reach db:5432" but the app itself works
  fine, that's just the direct/DDL endpoint being flaky — the running app (pooler)
  is unaffected.
- **Order placement is a `$transaction`**: creating the `Order`+`OrderItem` rows
  and decrementing `Product.stock` happen atomically in `src/routes/orders.ts` —
  keep it that way if you touch that route.
- **Email** (`src/lib/mailer.ts`) has two transports and picks automatically:
  **Resend (HTTP API)** if `RESEND_API_KEY` is set, else Gmail **SMTP**
  (nodemailer) if `SMTP_USER`/`SMTP_PASS` are set, else it silently no-ops (never
  throws — a broken mail config must never fail an order). **Render's free tier
  blocks outbound SMTP ports**, so production must use Resend; SMTP is fine for
  local dev. `GET /health` reports the active provider (`resend`/`smtp`/`none`);
  `POST /v1/auth/test-email` sends a real test message to `ADMIN_EMAIL` for
  diagnosing "works locally, not live."
- **OTP login**: `src/routes/auth.ts` + the `EmailOtp` table implement email-based
  2FA (6-digit code, single-use, expiring, rate-limited resend/attempts) — this is
  a bespoke implementation, not a third-party OTP service.
- **PayFast** (`src/lib/payfast.ts`, `src/routes/payfast.ts`) is a scaffolded
  automatic-card-payment path (token → hosted redirect → IPN callback) that is
  currently **unused in the live checkout flow** — the shipped checkout uses a
  manual flow instead (customer pays into a listed JazzCash/EasyPaisa/bank account
  and enters a transaction ref; admin verifies and approves in Manage Orders). See
  `docs/PAYFAST_INTEGRATION.md` and `docs/MOBILE_WALLET_INTEGRATION.md` before
  wiring either wallet's real API.

## A-Frontend & Admin-panel — Next.js App Router conventions

- **Server components by default; `'use client'` only for interactivity**
  (state/effects/handlers/browser APIs). Data-fetching pages
  (`shop/page.tsx`, `product/[slug]/page.tsx`, storefront `page.tsx`) are server
  components with `export const revalidate = <seconds>` (**ISR**) so they serve
  from cache and revalidate in the background instead of blocking on a cold
  backend. `lib/api.ts` fetches always degrade gracefully (`try/catch` →
  `[]`/`null`) so a backend outage never crashes a build or page.
- **`loading.tsx` convention**: skeleton (`animate-pulse`, shaped like the real
  content) for pages with a known layout; spinner+wordmark for generic/unknown
  routes. Follow the existing pattern in a folder rather than introducing a third
  style.
- **`app/api/**/route.ts`** files are same-origin proxies to A-Backend (orders,
  landing, auth/OTP, PayFast initiate) — used when the *browser* needs to call the
  API directly (so `API_URL` stays server-side and CORS is avoided). Server
  components instead call `lib/api.ts` functions directly.
- **`middleware.ts` → `utils/supabase/middleware.ts`**: refreshes the Supabase
  session and gates only `PROTECTED_PREFIXES` (currently `/checkout`, `/account`
  on the storefront — ordering requires an account). Anonymous browsing of
  `/shop`, `/product/*`, and the landing page is intentionally public. If you add
  a route that should require login, add its prefix here.
- **Cart state** (`A-Frontend/src/lib/cart.ts`) is Zustand with `persist`
  (localStorage) and a `partialize` so the drawer's open/closed flag is never
  persisted. Use `useCartHydrated()` before rendering cart-derived UI to avoid an
  SSR/localStorage hydration mismatch.
- **Landing page is a block-based CMS**, not hardcoded sections. The whole page is
  an ordered JSON array (`LandingPageContent.sections` in the DB, shape defined in
  `@ecom/shared` as `LandingBlock`/`LandingBlockType`). Storefront:
  `A-Frontend/src/components/home/LandingPage.tsx` has a `BlockRenderer` that
  dispatches each block type to a component (Hero, Curated, Feature, Snug,
  Dining, Reels, Banner, Instagram). Admin: `Admin-panel/src/components/admin/
  LandingBuilder.tsx` is a split-screen visual editor (left = add/delete/reorder
  block list with per-type field editors, right = live preview) that PUTs the
  whole `sections` array back. **To add a new section type**: extend
  `LandingBlockType`/`LANDING_BLOCK_META`/`DEFAULT_LANDING_SECTIONS` in
  `packages/shared/src/index.ts`, add a renderer case in the storefront
  `BlockRenderer`, and an editor+preview+template case in `LandingBuilder.tsx` —
  no DB migration needed since it's JSON.
- **Admin-panel specifics**:
  - `app/(dashboard)/layout.tsx` is a route-group layout that gates *every* admin
    page — it calls `fetchMe()` and shows "Access Denied" if `role !== 'ADMIN'`.
    New admin pages placed under `(dashboard)/` inherit this automatically.
  - Mutations go through **Server Actions** (`src/actions/*.ts`, `'use server'`)
    called directly from client components, which then `revalidatePath(...)` the
    relevant admin page.
  - Admin uses a **separate Supabase auth cookie name**
    (`sb-araish-admin`, in `utils/supabase/cookie-name.ts`) so an admin session on
    `:3001` and a customer session on `:3000` don't collide on `localhost` (cookies
    are scoped by hostname, not port).
  - Media (product images, landing hero/reel uploads) goes straight from the
    browser to **Supabase Storage** via `utils/upload-media.ts` /
    `components/admin/MediaUploader.tsx`, returning a public URL to persist. When
    replacing/removing media in a form, the backend deletes the now-unreferenced
    storage object on save — don't bypass that cleanup path when adding new
    upload UI.
  - `NotificationsBell.tsx` polls `/api/notifications` (admin's own route,
    forwards the signed-in Supabase token to `A-Backend`) every 30s for new
    orders — there's no websocket/push, it's deliberately simple polling.

## Deployment specifics worth knowing before touching env/config

- Two separate Vercel **projects** from the same repo (Root Directory
  `A-Frontend` and `Admin-panel` respectively) + one Render service for
  `A-Backend` (`render.yaml`, Blueprint deploy, `rootDir: .` so npm workspaces
  resolve `@ecom/shared`).
- **The #1 "works locally, not live" cause**: `API_URL` unset on Vercel defaults
  to `http://127.0.0.1:4000`, which doesn't exist in the cloud. Both Vercel
  projects need `API_URL` = the Render backend URL.
- **The #1 "email/OTP silently doesn't send in production" cause**: Render's free
  tier blocks outbound SMTP ports, so Gmail SMTP env vars that work locally
  time out live — must set `RESEND_API_KEY` there instead (see `A-Backend/src/lib/mailer.ts`
  above).
- Render's free tier also cold-sleeps after ~15 min idle; there's a keep-alive
  GitHub Action + guidance for an external pinger in `docs/DEPLOYMENT.md`.
- Full env var reference and step-by-step deploy checklist: `docs/DEPLOYMENT.md`.
- Broader "why is it built this way" tour of every concept in the codebase (with
  file references): `docs/PROJECT_GUIDE.md`.
