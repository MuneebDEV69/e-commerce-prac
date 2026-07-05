# syntax=docker/dockerfile:1
# Build context = REPO ROOT (see docker-compose). Paths below are repo-relative.
# Layers ordered least-frequently-changed → most. Requires BuildKit (default) for
# the --mount=type=cache directives.

# ---------- deps: install the whole workspace (cached until a manifest changes) ----------
FROM node:22-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY A-Frontend/package.json ./A-Frontend/
COPY A-Backend/package.json ./A-Backend/
COPY Admin-panel/package.json ./Admin-panel/
COPY packages/shared/package.json ./packages/shared/
RUN --mount=type=cache,target=/root/.npm npm ci

# ---------- builder ----------
FROM node:22-slim AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json ./
COPY packages/shared ./packages/shared
# public (rarely changes) → its own cached layer.
COPY Admin-panel/public ./Admin-panel/public
# App config (rarely changes). ⚠️ Add any new root-level config file here too.
COPY Admin-panel/next.config.js Admin-panel/postcss.config.js Admin-panel/tailwind.config.js Admin-panel/tsconfig.json Admin-panel/package.json ./Admin-panel/
# Source — changes most often, copied last.
COPY Admin-panel/src ./Admin-panel/src
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
RUN --mount=type=cache,target=/app/Admin-panel/.next/cache npm run build:admin

# ---------- runner (listens on 3001) ----------
FROM node:22-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3001
COPY --from=builder /app/Admin-panel/.next/standalone ./
COPY --from=builder /app/Admin-panel/.next/static ./Admin-panel/.next/static
COPY --from=builder /app/Admin-panel/public ./Admin-panel/public
EXPOSE 3001
CMD ["node", "Admin-panel/server.js"]
