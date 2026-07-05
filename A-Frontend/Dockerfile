# syntax=docker/dockerfile:1
# Build context = REPO ROOT (see docker-compose). Paths below are repo-relative.
# Layers are ordered least-frequently-changed → most, so a source edit invalidates
# the fewest layers. Requires BuildKit (default in modern Docker/Compose) for the
# --mount=type=cache directives.

# ---------- deps: install the whole workspace (cached until a manifest changes) ----------
FROM node:22-slim AS deps
WORKDIR /app
# ONLY the workspace manifests + lockfile. This layer — and the npm ci below —
# stays cached unless a package.json or package-lock.json actually changes.
COPY package.json package-lock.json ./
COPY A-Frontend/package.json ./A-Frontend/
COPY A-Backend/package.json ./A-Backend/
COPY Admin-panel/package.json ./Admin-panel/
COPY packages/shared/package.json ./packages/shared/
# Cache mount keeps npm's download cache across builds → when npm ci DOES re-run,
# packages are restored from cache instead of re-downloaded.
RUN --mount=type=cache,target=/root/.npm npm ci

# ---------- builder: produce the Next standalone output ----------
FROM node:22-slim AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
# Root manifest (holds the `build:frontend` script) — rarely changes.
COPY package.json package-lock.json ./
# Shared workspace — changes rarely.
COPY packages/shared ./packages/shared
# public is LARGE (~122 MB of media) and changes rarely → its own cached layer,
# so it is copied ONCE and never re-copied when you only edit source.
COPY A-Frontend/public ./A-Frontend/public
# App config (rarely changes). ⚠️ If you add a new root-level config file to
# A-Frontend, add it to this line too.
COPY A-Frontend/next.config.js A-Frontend/postcss.config.js A-Frontend/tailwind.config.js A-Frontend/tsconfig.json A-Frontend/.eslintrc.json A-Frontend/package.json ./A-Frontend/
# Source — changes most often, smallest layer, copied LAST.
COPY A-Frontend/src ./A-Frontend/src
# NEXT_PUBLIC_* are inlined at BUILD time → must arrive as build args.
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
# Cache mount persists Next/webpack's build cache → incremental rebuilds are far
# faster (unchanged modules aren't recompiled). Not part of the image output.
RUN --mount=type=cache,target=/app/A-Frontend/.next/cache npm run build:frontend

# ---------- runner: minimal image that just runs the server ----------
FROM node:22-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
# standalone bundle mirrors the repo root (server.js under A-Frontend/, node_modules, packages/shared)
COPY --from=builder /app/A-Frontend/.next/standalone ./
COPY --from=builder /app/A-Frontend/.next/static ./A-Frontend/.next/static
COPY --from=builder /app/A-Frontend/public ./A-Frontend/public
EXPOSE 3000
CMD ["node", "A-Frontend/server.js"]
