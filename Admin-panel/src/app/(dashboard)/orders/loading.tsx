export default function OrdersLoading() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12 animate-pulse">
      <p className="text-sm tracking-wider text-gray-400 mb-6">Orders page is loading…</p>
      <div className="h-8 w-40 bg-gray-200 rounded mb-2" />
      <div className="h-3 w-64 bg-gray-200 rounded mb-8" />
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-14 bg-gray-200 rounded" />
        ))}
      </div>
    </div>
  )
}
