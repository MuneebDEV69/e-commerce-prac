/**
 * Distinct auth cookie name for the admin app — kept in its own dependency-free
 * module so it can be safely imported by the Edge middleware without pulling in
 * the browser Supabase client.
 *
 * Browser cookies are scoped by HOSTNAME, not port, so on localhost the admin
 * (:3001) and storefront (:3000) share one cookie jar. A separate cookie name
 * keeps the admin session fully independent from the storefront's.
 */
export const ADMIN_COOKIE = 'sb-araish-admin'
