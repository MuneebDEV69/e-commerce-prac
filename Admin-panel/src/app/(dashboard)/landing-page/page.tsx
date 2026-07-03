import Link from 'next/link'
import { fetchLandingSections } from '@/lib/api'
import LandingBuilder from '@/components/admin/LandingBuilder'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Manage Landing Page — Admin' }

export default async function ManageLandingPage() {
  const sections = await fetchLandingSections()

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-8">
      <Link href="/" className="text-xs text-gray-500 hover:text-brand">
        ← Back to Dashboard
      </Link>
      <h1 className="font-serif text-2xl sm:text-3xl tracking-[0.15em] text-brand mt-3 mb-1">Landing Page Builder</h1>
      <p className="text-sm text-gray-500 mb-6">
        Edit, add, delete and reorder every section. The right side is a live preview — changes appear on the
        storefront within ~1 minute of saving.
      </p>
      <LandingBuilder initial={sections} />
    </div>
  )
}
