# Muneeb Ki Araish — Monorepo Architecture

An npm-workspaces monorepo. Each folder is an independent package; the root
`package.json` orchestrates all of them with one command.

```
E-COM WEB/
├── package.json      # workspace root — scripts to run/build every app
├── docker-compose.yml # local full-stack cluster (see DEPLOYMENT.md)
├── A-Frontend/       # Next.js 14 — customer storefront ONLY (port 3000)
├── A-Backend/        # Express + TypeScript + Prisma REST API (port 4000)
├── Admin-panel/      # Next.js 14 — back-office admin app (port 3001)
├── packages/
│   └── shared/       # @ecom/shared — zod schemas & TS types used by both apps
├── scripts/          # helper scripts consumed by Docker/deploy (e.g. backend entrypoint)
└── docs/             # this documentation
```

Three servers, one database. `npm run dev` starts all three together via `concurrently`.

## A-Frontend (`http://localhost:3000`) — customer storefront
Public-facing shop only — no admin code ships to customers, so the bundle stays
light. Next.js App Router, Tailwind, Supabase Auth (SSR) for login/signup.

**It has no database connection.** Every product read goes through the
A-Backend REST API (`src/lib/api.ts`). This keeps the storefront fast and
decoupled from the DB.

Run: `npm run dev:frontend` · Build: `npm run build:frontend`

## Admin-panel (`http://localhost:3001`) — back-office
A fully independent Next.js app for managing the catalogue (create/edit/delete
products, adjust stock, upload media). Customers never see or load this code.

- Every route except `/login` is gated by Supabase auth (middleware) **and** an
  ADMIN-role check against `A-Backend`'s `/v1/me` (`(dashboard)/layout.tsx`).
- Uses its **own auth cookie** (`sb-araish-admin`, set in
  `src/utils/supabase/cookie-name.ts`) so a customer session on `:3000` and an
  admin session on `:3001` never collide on `localhost` (cookies are scoped by
  hostname, not port — both apps otherwise share `localhost`'s cookie jar).
- Like the storefront, it has no direct DB access — all writes go through
  A-Backend, forwarding the signed-in admin's Supabase access token as a
  Bearer token.

Run: `npm run dev:admin` · Build: `npm run build:admin`

## A-Backend (`http://localhost:4000`) — the only database connection
A standalone REST API over the Supabase Postgres database. Both frontends
consume it; neither has its own Prisma client.

| Method | Path | Access |
|--------|------|--------|
| GET | `/health` | public |
| GET | `/v1/products` | public — published products |
| GET | `/v1/products/:slug` | public — one product |
| GET | `/v1/products/by-id/:id` | public — used by the admin edit form |
| GET | `/v1/categories` | public |
| GET | `/v1/me` | authenticated — returns `{ id, email, role }` |
| POST | `/v1/products` | **admin only** |
| PUT | `/v1/products/:id` | **admin only** |
| PATCH | `/v1/products/:id/stock` | **admin only** — body `{ delta }` |
| DELETE | `/v1/products/:id` | **admin only** |

Admin routes require `Authorization: Bearer <supabase-access-token>` from a
user whose `role` (in the `users` table) is `ADMIN`; verified in
`src/middleware/requireAdmin.ts`.

The API runs via **`tsx`** (not a compiled `node dist/...`) because it imports
`@ecom/shared` as a live TypeScript value (`productInputSchema`), not just types.

Run: `npm run dev:backend` · Type-check: `npm run build:backend`

## packages/shared (`@ecom/shared`)
Single source of truth for the product input contract (zod schema) and shared
TS types, so the storefront, admin, and backend never drift apart. Lives under
`packages/` (not the repo root) because it's an internal library, not a runnable app.

## Database
One Supabase Postgres instance, owned exclusively by **A-Backend**:
- **Runtime** queries use the connection **pooler** (`DATABASE_URL`, port 6543).
- **Migrations/schema pushes** use the **direct** connection (`DIRECT_URL`, port 5432).

Both frontends are fully decoupled from the DB — the API-first migration
(Prisma removed from A-Frontend, admin extracted with no DB access) is complete.

## Local Docker cluster
`docker-compose.yml` at the repo root builds and runs all three services in
containers (their own network, `NEXT_PUBLIC_*` baked in as build args). See
`docs/DEPLOYMENT.md` for the full guide — this is for local full-stack testing
and a future VPS, separate from the Vercel/Render cloud deploy.

## Common commands (from repo root)
| Command | What |
|---------|------|
| `npm run dev` | start **all three** servers together (API + storefront + admin) |
| `npm run dev:frontend` | start the storefront alone (:3000) |
| `npm run dev:backend`  | start the API alone (:4000) |
| `npm run dev:admin`    | start the admin panel alone (:3001) |
| `npm run build:frontend` / `build:admin` | production build of that app |
| `npm run build:backend` | type-check the API |
| `npm run db:seed` | seed the database |
| `npm run db:push` | push the Prisma schema to Supabase |
| `npm run db:studio` | open Prisma Studio |
| `npm run db:generate` | regenerate the Prisma client |
| `docker compose up --build` | run the full stack in containers |
