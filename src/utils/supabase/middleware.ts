import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Viewable WITHOUT logging in: the landing page and the auth pages only.
 * Everything else (shop, product, checkout, account, admin, …) requires a session.
 */
function isPublicPath(path: string): boolean {
  if (path === '/') return true
  return path.startsWith('/login') || path.startsWith('/signup')
}

/**
 * Refreshes the Supabase auth session and enforces "login required" on every
 * non-public page. Logged-out users are redirected to /login?redirect=<path>;
 * API routes get a 401 instead of an HTML redirect.
 */
export async function updateSession(request: NextRequest) {
  const path = request.nextUrl.pathname
  const isPublic = isPublicPath(path)
  const isApi = path.startsWith('/api')
  const hasAuthCookie = request.cookies.getAll().some((c) => c.name.startsWith('sb-'))

  const redirectToLogin = () => {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', path)
    return NextResponse.redirect(url)
  }

  // Fast paths needing no Supabase round-trip (keeps browsing snappy):
  if (!hasAuthCookie) {
    if (isPublic) return NextResponse.next({ request })
    if (isApi) return new NextResponse('Unauthorized', { status: 401 })
    return redirectToLogin()
  }

  // A session cookie exists → refresh it and verify the user is real.
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

  // IMPORTANT: getUser() revalidates the token with Supabase — do not remove.
  const {
    data: { user }
  } = await supabase.auth.getUser()

  // Cookie present but token invalid/expired, on a protected page → login.
  if (!user && !isPublic) {
    if (isApi) return new NextResponse('Unauthorized', { status: 401 })
    return redirectToLogin()
  }

  return supabaseResponse
}
