export default function LandingLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 animate-pulse">
      <p className="text-sm tracking-wider text-gray-400 mb-6">Manage landing page is loading…</p>
      <div className="h-8 w-64 bg-gray-200 rounded mb-8" />
      <div className="space-y-8 max-w-3xl">
        <div className="h-10 w-full bg-gray-200 rounded" />
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="aspect-video bg-gray-200 rounded" />
          ))}
        </div>
        <div className="grid grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-[9/16] bg-gray-200 rounded" />
          ))}
        </div>
        <div className="h-11 w-48 bg-gray-200 rounded" />
      </div>
    </div>
  )
}
