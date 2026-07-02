import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { ADMIN_COOKIE } from './cookie-name'

/** In the admin app EVERYTHING requires a session except the login page. */
function isPublicPath(path: string): boolean {
  return path.startsWith('/login')
}

/**
 * Refreshes the Supabase session and forces authentication on every admin page.
 * (The ADMIN-role check happens in the dashboard layout via the backend /v1/me.)
 */
export async function updateSession(request: NextRequest) {
  const path = request.nextUrl.pathname
  const isPublic = isPublicPath(path)
  // Only the ADMIN cookie counts — ignore the storefront's cookie that also
  // rides along on localhost (cookies are shared per hostname, not per port).
  const hasAuthCookie = request.cookies.getAll().some((c) => c.name.startsWith(ADMIN_COOKIE))

  if (!hasAuthCookie) {
    if (isPublic) return NextResponse.next({ request })
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', path)
    return NextResponse.redirect(url)
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: { name: ADMIN_COOKIE },
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        }
      }
    }
  )

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user && !isPublic) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', path)
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
