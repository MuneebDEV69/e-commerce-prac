import { createClient } from '@/utils/supabase/server'
import { fetchMe } from '@/lib/api'

/** The authenticated Supabase user for the current request (or null). */
export async function getSessionUser() {
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()
  return user
}

/**
 * Admin check — asks the A-Backend `/v1/me` endpoint (which reads the role from
 * the DB and verifies the token). The frontend never touches the database directly.
 */
export async function isAdmin(): Promise<boolean> {
  const me = await fetchMe()
  return me?.role === 'ADMIN'
}
