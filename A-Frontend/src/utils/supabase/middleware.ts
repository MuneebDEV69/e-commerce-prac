import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * The storefront is a public shop: anyone can browse the landing page, /shop and
 * /product without an account. But placing an order requires an account, so
 * /checkout and /account are gated — an anonymous visitor is sent to /login first.
 * Admin functionality lives entirely in the separate Admin-panel app.
 */
const PROTECTED_PREFIXES = ['/checkout', '/account']

function needsAuth(path: string): boolean {
  return PROTECTED_PREFIXES.some((p) => path.startsWith(p))
}

/**
 * Refreshes the Supabase session (so logged-in users stay logged in) and gates
 * only the protected areas. Public pages skip the Supabase round-trip when there
 * is no session cookie, keeping browsing snappy.
 */
export async function updateSession(request: NextRequest) {
  const path = request.nextUrl.pathname
  const protectedRoute = needsAuth(path)
  const isApi = path.startsWith('/api')
  const hasAuthCookie = request.cookies.getAll().some((c) => c.name.startsWith('sb-'))

  const redirectToLogin = () => {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', path)
    return NextResponse.redirect(url)
  }

  // Anonymous visitor on a public page → no Supabase round-trip at all.
  if (!hasAuthCookie && !protectedRoute) {
    return NextResponse.next({ request })
  }
  // Anonymous visitor on a protected page → straight to login (no round-trip).
  if (!hasAuthCookie && protectedRoute) {
    if (isApi) return new NextResponse('Unauthorized', { status: 401 })
    return redirectToLogin()
  }

  // A session cookie exists → refresh it (keeps the header in sync) and verify.
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
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

  if (!user && protectedRoute) {
    if (isApi) return new NextResponse('Unauthorized', { status: 401 })
    return redirectToLogin()
  }

  return supabaseResponse
}
