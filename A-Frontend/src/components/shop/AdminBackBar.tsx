'use client'

import { useEffect, useState } from 'react'
import { ArrowLeft } from 'lucide-react'

/**
 * Slim "Back to Dashboard" bar shown ONLY to an admin who arrived from the admin
 * panel's "View Storefront" link (which appends ?admin=1). Public shoppers never
 * see it. The flag is stashed in sessionStorage so the bar persists as the admin
 * browses around the storefront, and clears when the tab closes.
 *
 * We read window.location in an effect (not useSearchParams) so this stays a pure
 * client concern and doesn't force the statically-rendered shop page into a
 * Suspense boundary at build time.
 */
const ADMIN_URL = process.env.NEXT_PUBLIC_ADMIN_URL ?? 'http://localhost:3001'
const FLAG = 'from-admin'

export default function AdminBackBar() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const fromQuery = new URLSearchParams(window.location.search).get('admin') === '1'
    if (fromQuery) sessionStorage.setItem(FLAG, '1')
    setShow(fromQuery || sessionStorage.getItem(FLAG) === '1')
  }, [])

  if (!show) return null

  return (
    <div className="bg-gray-900 text-white text-sm">
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between">
        <span className="text-gray-300">Viewing storefront as admin</span>
        <a
          href={ADMIN_URL}
          className="inline-flex items-center gap-1.5 font-medium hover:text-brand transition-colors"
        >
          <ArrowLeft size={16} strokeWidth={1.5} />
          Back to Dashboard
        </a>
      </div>
    </div>
  )
}
