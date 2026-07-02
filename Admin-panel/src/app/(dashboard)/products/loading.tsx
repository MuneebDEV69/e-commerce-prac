export default function ProductsLoading() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12 animate-pulse">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="h-3 w-28 bg-gray-200 rounded" />
          <div className="h-8 w-40 bg-gray-200 rounded mt-3" />
          <div className="h-3 w-16 bg-gray-200 rounded mt-2" />
        </div>
        <div className="h-10 w-32 bg-gray-200 rounded" />
      </div>

      <div className="border border-gray-100">
        <div className="h-11 bg-cream" />
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 border-t border-gray-100 px-4 py-3">
            <div className="w-12 h-14 bg-gray-200 rounded shrink-0" />
            <div className="h-3 w-48 bg-gray-200 rounded" />
            <div className="ml-auto flex gap-2">
              <div className="h-8 w-24 bg-gray-200 rounded" />
              <div className="h-8 w-8 bg-gray-200 rounded" />
              <div className="h-8 w-8 bg-gray-200 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
