/** Instant PDP skeleton — mirrors the gallery + buy-box two-column layout. */
export default function ProductLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 animate-pulse">
      <p className="text-center text-sm tracking-wider text-gray-400 mb-6">Product page is loading…</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* gallery */}
        <div>
          <div className="aspect-square w-full bg-gray-200 rounded-md" />
          <div className="mt-4 flex gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="w-16 h-20 bg-gray-200 rounded" />
            ))}
          </div>
        </div>

        {/* buy box */}
        <div className="md:pl-4 lg:pl-10">
          <div className="h-7 w-3/4 bg-gray-200 rounded" />
          <div className="h-5 w-28 bg-gray-200 rounded mt-4" />
          <div className="h-3 w-full bg-gray-200 rounded mt-6" />
          <div className="h-3 w-5/6 bg-gray-200 rounded mt-2" />
          <div className="h-3 w-2/3 bg-gray-200 rounded mt-2" />
          <div className="h-10 w-40 bg-gray-200 rounded mt-8" />
          <div className="h-14 w-full bg-gray-200 rounded mt-7" />
          <div className="h-11 w-full bg-gray-200 rounded mt-3" />
        </div>
      </div>
    </div>
  )
}
