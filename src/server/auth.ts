import { createClient } from '@/utils/supabase/server'
import { prisma } from '@/server/prisma'

/** The authenticated Supabase user for the current request (or null). */
export async function getSessionUser() {
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()
  return user
}

/** The matching row in our public.users table (has the role), or null. */
export async function getCurrentDbUser() {
  const user = await getSessionUser()
  if (!user) return null
  return prisma.user.findUnique({ where: { id: user.id } })
}

/**
 * Authoritative admin check for server actions / server components.
 * IMPORTANT: Prisma connects as the DB owner and bypasses RLS, so every
 * write path that should be admin-only MUST call this — storage RLS does not
 * protect database writes.
 */
export async function isAdmin() {
  const dbUser = await getCurrentDbUser()
  return dbUser?.role === 'ADMIN'
}
