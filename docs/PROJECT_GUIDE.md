# Muneeb Ki Araish — Complete Project Guide (Concepts, Flows, How to Change Things)

A plain-language tour of **everything** in this codebase: what each concept is,
**why** it's used, **where** it lives, and **how** to change it later. Read top to
bottom once; after that use it as a lookup.

## Table of contents
1. [The big picture (monorepo)](#1-the-big-picture)
2. [A-Backend — the API server](#2-a-backend)
3. [A-Frontend — the storefront](#3-a-frontend)
4. [Admin-panel — the back office](#4-admin-panel)
5. [packages/shared — the contract](#5-packagesshared)
6. [Key end-to-end flows](#6-key-end-to-end-flows)
7. [Animations & motion used here](#7-animations--motion)
8. [Modern frontend techniques + where to learn them](#8-modern-frontend--resources)
9. [Performance optimisation](#9-performance)
10. [How to change things (recipes)](#10-recipes)

---

## 1. The big picture

**Monorepo** = one Git repo holding several apps that share code. We use **npm
workspaces** (see root `package.json` → `"workspaces"`). Three deployables + one
shared library:

| Folder | What it is | Runs on |
|--------|-----------|---------|
| `A-Backend` | Express REST API + database access | Render |
| `A-Frontend` | Public storefront (Next.js) | Vercel |
| `Admin-panel` | Admin back office (Next.js) | Vercel |
| `packages/shared` | Types + validation shared by all | (imported) |

**Why monorepo?** The frontend and backend must agree on data shapes (e.g. what a
"product" looks like). Keeping the shared Zod schemas in one place means the client
and server can't drift apart. One `npm install` at the root wires everything.

**Golden rule of the architecture:** the browser **never** talks to the database.
Flow is always: **Browser → Next.js server (route handler / server component) →
A-Backend API → Prisma → Supabase Postgres.** This keeps DB credentials and the
backend URL private, and lets the backend enforce security (auth, pricing).

---

## 2. A-Backend

**Stack:** Node + Express + TypeScript, run with **`tsx`** (no compile step — it
transpiles TS on the fly, and also resolves the `@ecom/shared` workspace at
runtime). Data via **Prisma** ORM to **Supabase Postgres**.

### Files
| File | Purpose |
|------|---------|
| `src/index.ts` | App entry: CORS, JSON/urlencoded parsers, mounts all routes, starts server |
| `src/lib/prisma.ts` | The single Prisma client instance (DB connection) |
| `src/lib/storage.ts` | Supabase Storage helpers (delete media by URL) |
| `src/lib/mailer.ts` | Nodemailer (Gmail SMTP) + every email template |
| `src/lib/payfast.ts` | PayFast token/config helper |
| `src/middleware/requireAdmin.ts` | Verifies the caller is a logged-in ADMIN |
| `src/routes/products.ts` | Product CRUD (public read, admin write) |
| `src/routes/categories.ts` | Category list |
| `src/routes/orders.ts` | Place order (public) + list/update status (admin) |
| `src/routes/auth.ts` | Welcome email, OTP send, OTP verify |
| `src/routes/landing.ts` | Landing page blocks (public read, admin write) |
| `src/routes/payfast.ts` | Card payment initiate + IPN callback |
| `src/routes/me.ts` | "Who am I / what's my role" |

### Concepts & why

- **REST API + Router modules.** Each resource gets its own `Router` (products,
  orders…). `index.ts` mounts them under `/v1/...`. **Why:** keeps routes small and
  discoverable; adding a feature = adding a file + one `app.use(...)` line.

- **ORM (Prisma).** Instead of writing SQL, you describe tables in
  `prisma/schema.prisma` and Prisma generates a typed client
  (`prisma.product.findMany(...)`). **Why:** type safety + no hand-written SQL.
  - `npm run db:push` — apply schema changes to the DB (uses `DIRECT_URL`, port 5432).
  - `npm run db:generate` — regenerate the typed client after editing the schema.
  - **Pooler vs direct:** runtime queries use the **pooler** (`DATABASE_URL`, port
    6543) which handles many short connections; schema changes (DDL) use the
    **direct** connection (5432). That's why you saw "can't reach 5432" — only the
    migration path was blocked, not the running app.

- **Validation with Zod (from `@ecom/shared`).** Every write validates the request
  body (`productInputSchema.safeParse(req.body)`). **Why:** never trust the client;
  reject bad data with a clear message before it touches the DB.

- **Auth = Supabase JWT + role check.** `requireAdmin.ts`: reads the `Authorization:
  Bearer <token>` header, asks Supabase "is this token valid, and who is it?", then
  checks `user.role === 'ADMIN'` in our DB. **Why:** Supabase owns identity; we own
  authorization (roles). Public routes (product reads, order placement) skip this.

- **Server-computed pricing (security).** In `orders.ts` / `payfast.ts` the client
  only sends `{ slug, quantity }`. The server looks up the **real** price from the DB
  and computes the total. **Why:** a tampered browser can never change what an item
  costs.

- **Database transaction.** Placing an order creates the order **and** decrements
  stock inside `prisma.$transaction(...)`. **Why:** both succeed or both fail — you
  never sell stock you didn't reserve.

- **Email (Nodemailer + Gmail SMTP).** `mailer.ts` builds branded HTML and sends via
  Gmail. Calls are **fire-and-forget** (`void orderPendingCustomer(order)`) and never
  throw. **Why:** a slow/broken mail server must not fail or delay an order. If
  `SMTP_*` env is missing it silently no-ops (that was the "works locally not live"
  bug — the secrets weren't on Render).

- **OTP (one-time codes).** `auth.ts`: generate a 6-digit code (`crypto.randomInt`),
  store it in the `EmailOtp` table with an expiry, email it, and verify later
  (checks match + not expired + attempt limit + single-use). **Why:** email-based
  2FA without a third-party service.

- **CORS.** `index.ts` only allows the storefront/admin origins. **Why:** stops other
  sites calling your API from a browser. (Our own calls are server-to-server, so CORS
  rarely triggers, but it's correct defense.)

- **Env & secrets.** All secrets come from `process.env` (loaded from `.env` locally,
  set in the Render dashboard in production). `.env` is gitignored; `.env.example`
  documents the keys. **Never** hard-code secrets.

---

## 3. A-Frontend

**Stack:** **Next.js 14 App Router**, React 18, Tailwind CSS, Zustand (cart),
Supabase SSR (auth).

### The single most important concept: Server vs Client Components
In the App Router, every component is a **Server Component by default** (renders on
the server, ships zero JS, can fetch data directly). Add **`'use client'`** at the
top only when you need interactivity (state, effects, event handlers, browser APIs).

- **Server component** → use for data-fetching pages (`shop/page.tsx`,
  `product/[slug]/page.tsx`, `page.tsx`). Fast, SEO-friendly, no JS cost.
- **Client component** → use for anything interactive (`Header`, `CartDrawer`,
  `BuyBox`, `LandingPage`, all forms). Marked with `'use client'`.

**How to decide:** does it use `useState`/`useEffect`/`onClick`/`window`? → client.
Otherwise → leave it server.

### Routing (file-based)
Folders under `src/app/` become URLs. `page.tsx` = the page. Special files:
- `layout.tsx` — wraps everything (Header, Footer, CartDrawer live here).
- `loading.tsx` — shown instantly during navigation (see skeleton concept below).
- `[slug]` — dynamic segment (`product/[slug]` → `/product/mystic-wings`).
- `api/**/route.ts` — **Route Handlers** = server endpoints on the frontend's own
  domain.

### Concepts & why

- **Route Handlers as proxies** (`app/api/orders/route.ts`, `api/auth/*`,
  `api/landing`, `api/payfast/*`). The browser calls **same-origin** `/api/...`; the
  handler runs on the server and forwards to `A-Backend` using the private `API_URL`.
  **Why:** keeps the backend URL secret, avoids CORS, and lets the client use simple
  relative fetches.

- **Data fetching + ISR (Incremental Static Regeneration).** `shop/page.tsx`,
  `product/[slug]/page.tsx` and `page.tsx` export `export const revalidate = 60/120`.
  The page is pre-rendered and cached, then re-fetched in the background every N
  seconds. **Why:** pages load **instantly** from cache instead of waiting on the
  (possibly cold) backend, while still updating. `lib/api.ts` wraps fetches in
  try/catch returning `[]`/`null` so an outage degrades gracefully instead of
  crashing the build.

- **`loading.tsx` — skeleton vs spinner (the concept you asked about).**
  When you navigate, Next shows the nearest `loading.tsx` **instantly** while the real
  page loads. Two styles:
  - **Skeleton** (grey shimmer shaped like the real content — `shop/loading.tsx`,
    `product/[slug]/loading.tsx`). **Use when** the page has a known layout (a grid, a
    form). It prevents "layout shift" and feels faster because the shape is already
    there. Uses Tailwind's `animate-pulse`.
  - **Spinner + wordmark** (`app/loading.tsx`, admin `app/loading.tsx`). **Use as the
    generic fallback** for routes without a specific skeleton, or where the layout is
    unpredictable. Uses `animate-spin`.
  Both also show the **"X page is loading…"** text you requested. Rule of thumb:
  *skeleton for known layouts, spinner for generic/unknown.*

- **Middleware** (`src/middleware.ts` → `utils/supabase/middleware.ts`). Runs on every
  request **before** the page. It refreshes the Supabase session and **gates
  protected routes** (`/checkout`, `/account`) — anonymous users are redirected to
  `/login`. Public pages skip the auth round-trip entirely (fast). **Why:** one place
  to enforce "must be logged in to order."

- **Auth (Supabase SSR).** `utils/supabase/{client,server,middleware}.ts` create the
  Supabase client for browser, server components, and middleware respectively. Auth
  state lives in cookies so the server can read it. Login uses the **browser** client
  (`signInWithPassword`), then we email an OTP and send the user to `/verify`.

- **State management (Zustand)** — `lib/cart.ts`. A tiny global store for the cart,
  **persisted to localStorage** (survives reload) via the `persist` middleware.
  `useCartHydrated()` avoids a "server said empty, client says 2 items" hydration
  mismatch. **Why Zustand over Context:** no provider boilerplate, components
  subscribe to just the slice they use, and persistence is one line. `partialize`
  makes sure the drawer's open/closed flag isn't persisted.

- **`next/image`.** Every image uses `<Image>` with `fill` + `sizes` + `priority`
  (first hero) + `object-cover/contain`. **Why:** automatic resizing, lazy-loading,
  and correct sizing per device — big performance win. Remote images (Supabase) are
  allowed via `next.config.js` `images.remotePatterns`.

- **Tailwind CSS.** Utility classes in the markup (`flex`, `px-4`, `md:grid-cols-3`).
  Responsive via breakpoint prefixes: `sm:` ≥640, `md:` ≥768, `lg:` ≥1024. **Why:**
  no context-switching to CSS files, consistent spacing scale, and responsive design
  reads inline. `styles/globals.css` holds the few globals + the brand colours.

### Component map (storefront)
| File | Role |
|------|------|
| `app/layout.tsx` | Global shell: Header, Marquee, page, Footer, WhatsApp, CartDrawer |
| `components/home/LandingPage.tsx` | **All landing blocks** (Hero, Curated, Feature, Snug, Dining, Reels, Banner, Instagram) + `BlockRenderer` |
| `components/layout/Header.tsx` | Sticky nav, scroll-shrink logo, Home button, cart badge |
| `components/layout/Marquee.tsx` | Scrolling promo strip |
| `components/layout/CartButton.tsx` / `cart/CartDrawer.tsx` | Cart icon + slide-in drawer |
| `components/product/BuyBox.tsx` / `ProductGallery.tsx` | Product detail buy area + gallery |
| `components/shop/*` | Shop grid, product card, filters, sub-category slider |
| `components/auth/*` | Login / signup forms |
| `lib/{api,cart,payment,products}.ts` | API client, cart store, payment config, static fallbacks |

---

## 4. Admin-panel

Same Next.js concepts as the storefront, plus:

- **Route groups** — `app/(dashboard)/...`. Parentheses = a folder that groups routes
  **without** adding to the URL. `(dashboard)/layout.tsx` guards every admin page
  (checks `fetchMe().role === 'ADMIN'`, else "Access Denied"). **Why:** one guard for
  all admin pages.

- **Server Actions** — `actions/product.ts`, `actions/order.ts`, `actions/landing.ts`
  (`'use server'`). These are functions that run **on the server** but you call them
  **directly from a client component** (like a built-in RPC), no manual `fetch`.
  Next handles the network. **Why:** form submissions and mutations with less
  boilerplate; they also `revalidatePath(...)` to refresh cached data after a change.

- **Media upload** — `utils/upload-media.ts` + `components/admin/MediaUploader.tsx`.
  Uploads image/video straight to **Supabase Storage** from the browser and returns a
  public URL to save in the DB. Removed media is deleted server-side on save (no junk
  files).

- **The Landing Builder** — `components/admin/LandingBuilder.tsx`. A **block-based
  CMS**: the page is a JSON array of `{ id, type, content }` blocks. Left = list with
  add/delete/reorder + per-block field editors; right = **live preview** that
  re-renders as you type. The storefront reads the same JSON and renders real
  components (`BlockRenderer`). **Why JSON blocks:** infinite flexibility — add/remove
  any section without a schema change.

- **Notifications** — `components/layout/NotificationsBell.tsx` polls
  `/api/notifications` every 30s and shows new orders with date/time. **Why polling:**
  simplest reliable "new order" signal without websockets.

- **Distinct auth cookie** — `utils/supabase/cookie-name.ts` (`sb-araish-admin`).
  **Why:** on localhost the admin and storefront share a hostname; a different cookie
  name keeps their sessions separate.

---

## 5. packages/shared

One file, `src/index.ts`. Holds **Zod schemas** (`productInputSchema`,
`orderInputSchema`, `landingSectionsSchema`), **TypeScript types**, and the landing
**defaults**. Imported by all apps as `@ecom/shared`. **Why:** the client validates
with the exact same rules the server enforces — one source of truth.

---

## 6. Key end-to-end flows

**Browse → buy:**
`shop/page.tsx` (server, ISR) → `lib/api.fetchProducts()` → `/v1/products` →
Prisma → cards. Click a card → `product/[slug]/page.tsx` → `BuyBox` "Add to cart"
→ Zustand store → `CartDrawer` opens → Checkout.

**Checkout (account required):** middleware forces login → `checkout/page.tsx`
validates fields → `POST /api/orders` (proxy) → `/v1/orders` → server re-prices,
`$transaction` (create order + decrement stock) → emails customer → confirmation.

**Login + OTP:** `LoginForm` → Supabase password check → `POST /api/auth/otp/send`
→ backend stores + emails a 6-digit code → `/verify` page (countdown, resend,
change email) → `POST /api/auth/otp/verify` → success → into the site.

**Admin approves:** `NotificationsBell` shows the new order → **Manage Orders** →
Approve → `PATCH /v1/orders/:id/status` → status CONFIRMED → **customer gets the
"confirmed" email.**

**Edit the landing page:** Admin **Manage Landing Page** → edit blocks → Save →
`PUT /v1/landing` (saves JSON + deletes removed media) → storefront revalidates
(~60s) and renders the new blocks.

---

## 7. Animations & motion

Everything here is **CSS + small JS** (no animation library yet — a good future
upgrade, see §8). Where each lives:

| Effect | Where | How it works |
|--------|-------|-------------|
| **Marquee** (scrolling promo strip) | `layout/Marquee.tsx` | CSS `@keyframes` translating content left in a loop |
| **Hero crossfade slider** | `LandingPage.tsx` → HeroBlock | `opacity` transition between absolutely-stacked slides + `setInterval` autoplay |
| **Category carousel + custom scrollbar** | CuratedBlock | native horizontal scroll + a thumb whose width/offset is computed from `scrollLeft` |
| **Video reels (lazy + autoplay)** | ReelsBlock | **IntersectionObserver** mounts videos only near the viewport, plays while visible, `scroll-snap` for card alignment, `muted` set imperatively so autoplay is allowed |
| **Scroll-shrink logo** | `layout/Header.tsx` | a scroll listener toggles a `scrolled` flag → `transition-all` shrinks the logo |
| **Hover zoom on images** | Curated/cards | `group-hover:scale-105` + `transition-transform` |
| **Cart drawer slide-in** | `cart/CartDrawer.tsx` | `translate-x-full → translate-x-0` with `transition-transform`, dim overlay fades via `opacity` |
| **Skeleton shimmer** | all `loading.tsx` | Tailwind `animate-pulse` |
| **Spinner** | `app/loading.tsx` | `animate-spin` on a Lucide icon |
| **Accordion (product details/care)** | `BuyBox.tsx` | conditional render + chevron `rotate-180` |
| **Button/icon hovers** | everywhere | `hover:bg-*`, `hover:scale-105`, `transition-colors` |

The core primitives: **CSS transitions** (`transition-*`), **CSS keyframes**
(`@keyframes` in `globals.css` / `animate-*`), **transforms** (`translate`,
`scale`, `rotate`), and **IntersectionObserver** for "do something when it enters
the screen."

---

## 8. Modern frontend & resources

You asked where to see modern animations/techniques to use in future projects.

### Inspiration (look at what's possible)
- **Awwwards** — award-winning sites (awwwards.com)
- **Godly** — godly.website (curated modern web design)
- **Codrops** — tympanus.net/codrops (tutorials + downloadable demos — best for
  learning *how*)
- **Land-book / Httpster** — landing-page inspiration
- **CodePen** — search any effect, see the code
- **Dribbble** — UI motion concepts

### Animation libraries (implement it)
- **Framer Motion** (motion.dev) — the standard for React animations: enter/exit,
  layout animations, gestures, scroll-linked. **Start here.**
- **GSAP + ScrollTrigger** (gsap.com) — the most powerful timeline/scroll animation
  engine (parallax, pinned sections, scrubbing).
- **Lenis** (github.com/darkroomengineering/lenis) — buttery **smooth scrolling**
  (used on most modern "premium" sites).
- **Embla Carousel** / **Swiper** — production carousels (you already have Swiper as a
  dependency).
- **Lottie** (lottiefiles.com) — play After-Effects animations as lightweight JSON.
- **Three.js / React Three Fiber** — 3D and WebGL scenes.
- **AOS** / **tailwindcss-animate** — quick scroll-reveal / Tailwind animation utils.

### Prebuilt animated components (copy-paste, Tailwind-based)
- **shadcn/ui** (ui.shadcn.com) — the modern base component system.
- **Aceternity UI** (ui.aceternity.com) — flashy animated sections (great for hero
  areas).
- **Magic UI** (magicui.design) — animated marquees, shimmer, particles, etc.
- **Hover.dev**, **Motion Primitives** — ready Framer Motion components.

### Techniques that are common in 2025-era sites
Scroll-triggered reveals & parallax, staggered list entrances, magnetic/cursor
effects, sticky "pinned" scroll sections, marquees, skeleton + optimistic UI, the
**View Transitions API** (native page-transition animations), SSR/streaming for
speed, and image/video optimization. In this project, a natural next step is adding
**Framer Motion** for section reveals + **Lenis** for smooth scroll — both drop in
without rewriting your components.

---

## 9. Performance

What's already done and why:
- **ISR / caching** — pages serve from cache, revalidate in the background
  (`revalidate` exports). Instant loads.
- **Server Components** — data-fetching pages ship **zero JS**.
- **`next/image`** — resized, lazy, correctly-sized images.
- **Lazy video** — reels mount only near the viewport (IntersectionObserver),
  `preload="metadata"` (don't download whole clips up front).
- **Code splitting** — the App Router splits JS per route automatically; only
  interactive bits are `'use client'`.
- **`optimizePackageImports`** (`next.config.js`) — tree-shakes big icon packs.
- **`output: 'standalone'`** — smaller production server bundle.
- **Graceful fetch** — API failures return `[]`/`null` so a slow backend never blocks
  rendering.
- **Keep-alive** — an external pinger keeps Render's free tier warm (see DEPLOYMENT.md).

Biggest remaining win: **compress the reel videos** (they're 6–23 MB each) — see the
ffmpeg command in earlier notes; or move them to a CDN/Supabase Storage.

---

## 10. Recipes — how to change things

**Add a field to a product (e.g. "brand"):**
1. `A-Backend/prisma/schema.prisma` → add `brand String?` to `Product` → `npm run db:push`.
2. `packages/shared/src/index.ts` → add `brand` to `productInputSchema` + `ProductDTO`.
3. `A-Backend/src/routes/products.ts` → include `brand` in create/update.
4. Admin `components/admin/ProductForm.tsx` → add an input + include in the payload.
5. Storefront `product/[slug]/page.tsx` + `BuyBox.tsx` → display it.

**Add a new storefront page (e.g. `/about`):** create
`A-Frontend/src/app/about/page.tsx` (server component). Add `loading.tsx` beside it
for a skeleton. Done — the route exists.

**Add a new API endpoint:** create `A-Backend/src/routes/<thing>.ts` with a `Router`,
then `app.use('/v1/<thing>', <thing>Router)` in `index.ts`. If the browser needs it,
add a proxy `app/api/<thing>/route.ts` on the frontend.

**Change a colour / spacing:** it's Tailwind classes in the component, or the brand
colour tokens in `styles/globals.css` (storefront) / `app/globals.css` (admin) and
`tailwind.config`.

**Add a new landing section type:** add the type to `@ecom/shared`
(`LandingBlockType` + `LANDING_BLOCK_META`), add a renderer in the storefront
`LandingPage.tsx` (`BlockRenderer` switch), and an editor + preview + template in the
admin `LandingBuilder.tsx`. The JSON storage needs no migration.

**Change who gets order emails / the wording:** `A-Backend/src/lib/mailer.ts` (all
templates + recipients live there).

**Where "must log in to order" is enforced:** `A-Frontend/src/utils/supabase/
middleware.ts` → `PROTECTED_PREFIXES`.

---

*Tip: open this file in VS Code and hit the Markdown preview (Ctrl+Shift+V) for a
nicely formatted read.*
