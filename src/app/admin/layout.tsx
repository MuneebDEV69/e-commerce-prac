import type { ReactNode } from 'react'
import Link from 'next/link'
import { isAdmin } from '@/server/auth'

export const dynamic = 'force-dynamic'

/**
 * Guards every /admin/* route. Middleware already requires login; this adds the
 * ADMIN-role check so logged-in customers get a clear "access denied" instead of
 * silently hitting RLS errors deeper in.
 */
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const admin = await isAdmin()

  if (!admin) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <h1 className="font-serif text-2xl text-brand mb-3">Access Denied</h1>
        <p className="text-sm text-gray-500 max-w-md">
          This area is for administrators only. If you believe this is a mistake, contact the store owner.
        </p>
        <Link href="/" className="mt-6 text-sm text-brand underline">
          Back to home
        </Link>
      </div>
    )
  }

  return <>{children}</>
}
