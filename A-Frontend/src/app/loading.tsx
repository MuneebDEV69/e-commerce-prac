import { Loader2 } from 'lucide-react'

/**
 * Shown instantly during any route transition that doesn't have its own
 * loading.tsx — gives immediate feedback so the UI never feels frozen.
 */
export default function Loading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 bg-offwhite">
      <Loader2 size={32} className="animate-spin text-brand" />
      <p className="font-serif tracking-[0.25em] text-brand text-sm">MUNEEB KI ARAISH</p>
    </div>
  )
}
