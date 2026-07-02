import type { ReactNode } from 'react'
import { fetchMe } from '@/lib/api'
import AdminHeader from '@/components/layout/AdminHeader'
import SignOutButton from '@/components/layout/SignOutButton'

export const dynamic = 'force-dynamic'

/**
 * Guards every admin page: the visitor must be authenticated (middleware) AND
 * have the ADMIN role (verified here via the backend /v1/me). A logged-in
 * non-admin gets a clear "Access Denied" instead of any admin content.
 */
export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const me = await fetchMe()

  if (me?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
        <h1 className="font-serif text-2xl text-brand mb-3">Access Denied</h1>
        <p className="text-sm text-gray-500 max-w-md">
          This panel is for administrators only. Your account
          {me?.email ? ` (${me.email})` : ''} doesn’t have admin access.
        </p>
        <div className="mt-6">
          <SignOutButton />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <AdminHeader email={me.email} />
      <main>{children}</main>
    </div>
  )
}
