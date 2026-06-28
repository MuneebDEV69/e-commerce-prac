import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

/**
 * Singleton PrismaClient.
 *
 * Prisma 7 connects through a driver adapter (no datasource url in schema), so we
 * wire the Postgres adapter with DATABASE_URL here. Supabase enforces SSL.
 *
 * The global cache prevents exhausting DB connections during Next.js dev hot-reload.
 */
const connectionString = process.env.DATABASE_URL

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

function createPrisma() {
  const adapter = new PrismaPg({
    connectionString,
    ssl: { rejectUnauthorized: false }
  })
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? createPrisma()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
