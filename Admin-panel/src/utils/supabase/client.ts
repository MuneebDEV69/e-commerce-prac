import { createBrowserClient } from '@supabase/ssr'
import { ADMIN_COOKIE } from './cookie-name'

/** Supabase client for Client Components (browser). */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookieOptions: { name: ADMIN_COOKIE } }
  )
}
