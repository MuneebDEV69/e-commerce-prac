import { Loader2 } from 'lucide-react'

export default function Loading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <Loader2 size={32} className="animate-spin text-brand" />
      <p className="font-serif tracking-[0.25em] text-brand text-sm">ADMIN</p>
    </div>
  )
}
