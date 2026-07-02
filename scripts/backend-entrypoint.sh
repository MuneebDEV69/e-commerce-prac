#!/bin/sh
# Entry point for the A-Backend container.
# The Prisma client is generated at build time; this just launches the API.
# (If you later add SQL migrations, run `prisma migrate deploy` here first.)
set -e

echo "Starting A-Backend API on port ${PORT:-4000}..."
exec npx tsx A-Backend/src/index.ts
