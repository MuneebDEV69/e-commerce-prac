import { PrismaClient } from '@prisma/client'

/**
 * Singleton PrismaClient.
 *
 * Prisma 6 connects through its built-in query engine using DATABASE_URL
 * (declared in schema.prisma). The global cache prevents exhausting DB
 * connections during Next.js dev hot-reload.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
