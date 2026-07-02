/**
 * Instant shop skeleton — mirrors the real layout (sub-category row + 4-col grid)
 * so the transition is smooth and there's no layout shift when data arrives.
 */
export default function ShopLoading() {
  return (
    <div className="pb-12 animate-pulse">
      {/* sub-category circles */}
      <div className="flex items-center gap-6 px-4 md:px-10 py-6">
        <div className="h-4 w-24 bg-gray-200 rounded hidden md:block" />
        <div className="flex gap-6 overflow-hidden">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2 shrink-0">
              <div className="w-16 h-16 md:w-[72px] md:h-[72px] rounded-full bg-gray-200" />
              <div className="h-2 w-14 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* utility bar */}
      <div className="flex items-center justify-between px-4 md:px-10 py-4 border-y border-gray-100">
        <div className="h-4 w-16 bg-gray-200 rounded" />
        <div className="h-4 w-24 bg-gray-200 rounded" />
      </div>

      {/* product grid */}
      <div className="px-4 md:px-10 py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i}>
              <div className="aspect-[4/5] w-full bg-gray-200 rounded-md" />
              <div className="h-3 w-3/4 bg-gray-200 rounded mx-auto mt-3" />
              <div className="h-3 w-1/2 bg-gray-200 rounded mx-auto mt-2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
