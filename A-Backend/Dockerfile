# syntax=docker/dockerfile:1
# Build context = REPO ROOT (see docker-compose). Runs via tsx (no compile step)
# because the API imports the @ecom/shared TS package at runtime.
# Requires BuildKit (default) for --mount=type=cache.

# ---------- deps ----------
FROM node:22-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY A-Frontend/package.json ./A-Frontend/
COPY A-Backend/package.json ./A-Backend/
COPY Admin-panel/package.json ./Admin-panel/
COPY packages/shared/package.json ./packages/shared/
RUN --mount=type=cache,target=/root/.npm npm ci

# ---------- runner ----------
FROM node:22-slim AS runner
WORKDIR /app
# openssl is required by the Prisma query engine on debian. Stable early layer.
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
ENV NODE_ENV=production
ENV PORT=4000
COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json ./
# Copy the Prisma SCHEMA first and generate the client. Because this happens BEFORE
# the source copy, `prisma generate` is cached and only re-runs when the schema
# (or node_modules) changes — editing backend source below no longer regenerates it.
COPY A-Backend/prisma ./A-Backend/prisma
RUN npx prisma generate --schema=A-Backend/prisma/schema.prisma
# Shared workspace + backend source + entrypoint (change often; don't touch generate).
COPY packages/shared ./packages/shared
COPY A-Backend/package.json A-Backend/tsconfig.json ./A-Backend/
COPY A-Backend/src ./A-Backend/src
COPY scripts ./scripts
# Normalize CRLF→LF so the entrypoint runs even if authored on Windows.
RUN sed -i 's/\r$//' scripts/backend-entrypoint.sh
EXPOSE 4000
ENTRYPOINT ["sh", "scripts/backend-entrypoint.sh"]
