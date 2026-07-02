import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { ADMIN_COOKIE } from './cookie-name'

/**
 * Supabase client for Server Components, Server Actions, and Route Handlers.
 * Uses the admin-specific cookie name so its session is isolated from the
 * storefront on localhost.
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: { name: ADMIN_COOKIE },
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Called from a Server Component — safe to ignore because the
            // middleware refreshes the session cookies on every request.
          }
        }
      }
    }
  )
}
