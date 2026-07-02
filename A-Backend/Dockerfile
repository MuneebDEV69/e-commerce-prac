# syntax=docker/dockerfile:1
# Build context = REPO ROOT (see docker-compose). Runs via tsx (no compile step)
# because the API imports the @ecom/shared TS package at runtime.

# ---------- deps ----------
FROM node:20-slim AS deps
WORKDIR /app
# openssl is required by the Prisma query engine on debian.
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
COPY A-Frontend/package.json ./A-Frontend/
COPY A-Backend/package.json ./A-Backend/
COPY Admin-panel/package.json ./Admin-panel/
COPY packages/shared/package.json ./packages/shared/
RUN npm ci

# ---------- runner ----------
FROM node:20-slim AS runner
WORKDIR /app
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
ENV NODE_ENV=production
ENV PORT=4000
COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json ./
COPY A-Backend ./A-Backend
COPY packages/shared ./packages/shared
COPY scripts ./scripts
# Normalize CRLF→LF so the entrypoint runs even if authored on Windows.
RUN sed -i 's/\r$//' scripts/backend-entrypoint.sh
# Generate the Prisma client for this container's linux platform.
RUN npx prisma generate --schema=A-Backend/prisma/schema.prisma
EXPOSE 4000
ENTRYPOINT ["sh", "scripts/backend-entrypoint.sh"]
