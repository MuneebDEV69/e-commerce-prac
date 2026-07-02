# syntax=docker/dockerfile:1
# Build context = REPO ROOT (see docker-compose). Paths below are repo-relative.

# ---------- deps: install the whole workspace (cached layer) ----------
FROM node:22-slim AS deps
WORKDIR /app
# Every workspace manifest is needed so npm can resolve the workspace graph.
COPY package.json package-lock.json ./
COPY A-Frontend/package.json ./A-Frontend/
COPY A-Backend/package.json ./A-Backend/
COPY Admin-panel/package.json ./Admin-panel/
COPY packages/shared/package.json ./packages/shared/
RUN npm ci

# ---------- builder: produce the Next standalone output ----------
FROM node:22-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# NEXT_PUBLIC_* are inlined at BUILD time → must arrive as build args.
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build:frontend

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
