import { Loader2 } from 'lucide-react'

/**
 * Default route-transition loader (used by any page without its own loading.tsx).
 * Spinner + wordmark so the user always sees the site is loading.
 */
export default function Loading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 bg-offwhite">
      <Loader2 size={32} className="animate-spin text-brand" />
      <p className="font-serif tracking-[0.25em] text-brand text-sm">MUNEEB KI ARAISH</p>
    </div>
  )
}
