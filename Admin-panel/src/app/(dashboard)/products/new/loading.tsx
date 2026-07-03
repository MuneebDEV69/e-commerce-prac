export default function NewProductLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 animate-pulse">
      <p className="text-sm tracking-wider text-gray-400 mb-6">Add product page is loading…</p>
      <div className="h-3 w-28 bg-gray-200 rounded" />
      <div className="h-8 w-56 bg-gray-200 rounded mt-3 mb-8" />
      <div className="space-y-6 max-w-2xl">
        <div className="h-10 w-full bg-gray-200 rounded" />
        <div className="h-24 w-full bg-gray-200 rounded" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-10 bg-gray-200 rounded" />
          <div className="h-10 bg-gray-200 rounded" />
        </div>
        <div className="h-10 w-full bg-gray-200 rounded" />
        <div className="h-64 w-full bg-gray-200 rounded" />
        <div className="h-11 w-40 bg-gray-200 rounded" />
      </div>
    </div>
  )
}
